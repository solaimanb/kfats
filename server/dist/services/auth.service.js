"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = require("../models/user.model");
const role_application_model_1 = require("../models/role-application.model");
const rbac_config_1 = require("../config/rbac.config");
const error_util_1 = require("../utils/error.util");
const email_util_1 = require("../utils/email.util");
class AuthService {
    static generateToken(userId) {
        const signOptions = {
            expiresIn: 3600,
        };
        return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SECRET || "default-secret", signOptions);
    }
    static async register(userData) {
        const existingUser = await user_model_1.UserModel.findOne({ email: userData.email });
        if (existingUser) {
            throw new error_util_1.AppError("Email already registered", 400);
        }
        const user = await user_model_1.UserModel.create({
            email: userData.email,
            password: userData.password,
            profile: {
                firstName: userData.firstName,
                lastName: userData.lastName,
            },
            roles: [rbac_config_1.UserRole.STUDENT],
            status: process.env.NODE_ENV === "development"
                ? rbac_config_1.UserStatus.ACTIVE
                : rbac_config_1.UserStatus.PENDING_VERIFICATION,
        });
        const token = this.generateToken(user._id.toString());
        if (process.env.NODE_ENV !== "development") {
            await this.sendVerificationEmail(user.email, token);
        }
        return { user, token };
    }
    static async login(email, password) {
        const user = await user_model_1.UserModel.findOne({ email }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            throw new error_util_1.AppError("Invalid credentials", 401);
        }
        if (user.status !== rbac_config_1.UserStatus.ACTIVE) {
            throw new error_util_1.AppError("Account not active", 403);
        }
        const token = this.generateToken(user._id.toString());
        const sanitizedUser = user.toObject();
        delete sanitizedUser.password;
        return { user: sanitizedUser, token };
    }
    static async forgotPassword(email) {
        var _a;
        const user = await user_model_1.UserModel.findOne({ email });
        if (!user) {
            throw new error_util_1.AppError("No user found with that email address", 404);
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        user.security = Object.assign(Object.assign({}, user.security), { resetPasswordToken: resetToken, resetPasswordExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) });
        await user.save({ validateBeforeSave: false });
        await email_util_1.emailService.sendPasswordResetEmail(user.email, ((_a = user.profile) === null || _a === void 0 ? void 0 : _a.firstName) || user.email.split("@")[0], `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`);
    }
    static async resetPassword(token, newPassword) {
        const user = await user_model_1.UserModel.findOne({
            "security.resetPasswordToken": token,
            "security.resetPasswordExpires": { $gt: Date.now() },
        });
        if (!user) {
            throw new error_util_1.AppError("Token is invalid or has expired", 400);
        }
        user.password = newPassword;
        user.security = Object.assign(Object.assign({}, user.security), { resetPasswordToken: undefined, resetPasswordExpires: undefined });
        await user.save();
    }
    static async refreshToken(userId) {
        const user = await user_model_1.UserModel.findById(userId);
        if (!user) {
            throw new error_util_1.AppError("User not found", 404);
        }
        return this.generateToken(user._id.toString());
    }
    static async sendVerificationEmail(email, token) {
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
        await email_util_1.emailService.sendVerificationEmail(email, email.split("@")[0], verificationUrl);
    }
    static async applyForRole(userId, roleData) {
        const existingApplication = await role_application_model_1.RoleApplicationModel.findOne({
            userId,
            requestedRole: roleData.requestedRole,
            status: { $in: ["PENDING", "IN_REVIEW"] },
        });
        if (existingApplication) {
            throw new error_util_1.AppError("You already have a pending application", 400);
        }
        return role_application_model_1.RoleApplicationModel.create(Object.assign({ userId }, roleData));
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map