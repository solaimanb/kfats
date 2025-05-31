"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = require("../models/user.model");
const refresh_token_model_1 = require("../models/refresh-token.model");
const role_application_model_1 = require("../models/role-application.model");
const rbac_config_1 = require("../config/rbac.config");
const error_util_1 = require("../utils/error.util");
const email_util_1 = require("../utils/email.util");
class AuthService {
    static generateAccessToken(userId) {
        const signOptions = {
            expiresIn: "15m",
        };
        return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SECRET || "default-secret", signOptions);
    }
    static async generateRefreshToken(userId, deviceInfo) {
        const activeTokenCount = await refresh_token_model_1.RefreshTokenModel.countDocuments({
            user: userId,
            isRevoked: false,
            expiresAt: { $gt: new Date() },
        });
        if (activeTokenCount >= 5) {
            const oldestToken = await refresh_token_model_1.RefreshTokenModel.findOne({
                user: userId,
                isRevoked: false,
            }).sort({ issuedAt: 1 });
            if (oldestToken) {
                oldestToken.isRevoked = true;
                await oldestToken.save();
            }
        }
        const token = crypto_1.default.randomBytes(40).toString("hex");
        await refresh_token_model_1.RefreshTokenModel.create({
            user: userId,
            token,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            deviceInfo,
        });
        return token;
    }
    static async register(userData, deviceInfo) {
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
        const accessToken = this.generateAccessToken(user._id.toString());
        const refreshToken = await this.generateRefreshToken(user._id.toString(), deviceInfo);
        if (process.env.NODE_ENV !== "development") {
            await this.sendVerificationEmail(user.email, accessToken);
        }
        return { user, accessToken, refreshToken };
    }
    static async login(email, password, deviceInfo) {
        const user = await user_model_1.UserModel.findOne({ email }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            throw new error_util_1.AppError("Invalid credentials", 401);
        }
        if (user.status !== rbac_config_1.UserStatus.ACTIVE) {
            throw new error_util_1.AppError("Account not active", 403);
        }
        const accessToken = this.generateAccessToken(user._id.toString());
        const refreshToken = await this.generateRefreshToken(user._id.toString(), deviceInfo);
        const sanitizedUser = user.toObject();
        const { password: pwd, security } = sanitizedUser, userWithoutSensitiveData = __rest(sanitizedUser, ["password", "security"]);
        return { user: userWithoutSensitiveData, accessToken, refreshToken };
    }
    static async refreshToken(oldRefreshToken, deviceInfo) {
        const existingToken = await refresh_token_model_1.RefreshTokenModel.findOne({
            token: oldRefreshToken,
            isRevoked: false,
            expiresAt: { $gt: new Date() },
        }).populate("user");
        if (!existingToken) {
            throw new error_util_1.AppError("Invalid or expired refresh token", 401);
        }
        existingToken.isRevoked = true;
        await existingToken.save();
        const accessToken = this.generateAccessToken(existingToken.user._id.toString());
        const refreshToken = await this.generateRefreshToken(existingToken.user._id.toString(), deviceInfo);
        return { accessToken, refreshToken };
    }
    static async logout(userId, refreshToken) {
        if (refreshToken) {
            await refresh_token_model_1.RefreshTokenModel.updateOne({ user: userId, token: refreshToken }, { isRevoked: true });
        }
        else {
            await refresh_token_model_1.RefreshTokenModel.updateMany({ user: userId, isRevoked: false }, { isRevoked: true });
        }
    }
    static async revokeAllUserSessions(userId) {
        await refresh_token_model_1.RefreshTokenModel.updateMany({ user: userId }, { isRevoked: true });
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