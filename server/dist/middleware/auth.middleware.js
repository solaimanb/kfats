"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customRateLimit = exports.hasPermission = exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = require("../models/user.model");
const error_util_1 = require("../utils/error.util");
const rbac_config_1 = require("../config/rbac.config");
const permission_cache_util_1 = require("../utils/permission-cache.util");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const crypto_1 = __importDefault(require("crypto"));
const refresh_token_model_1 = require("../models/refresh-token.model");
dotenv_1.default.config();
const protect = async (req, res, next) => {
    var _a, _b;
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            throw new error_util_1.AppError("Not authenticated. Please log in.", 401);
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = (await user_model_1.UserModel.findById(decoded.id).select("+security"));
            if (!user) {
                throw new error_util_1.AppError("User no longer exists", 404);
            }
            if (((_a = user.security) === null || _a === void 0 ? void 0 : _a.passwordChangedAt) && decoded.iat) {
                const changedTimestamp = user.security.passwordChangedAt.getTime() / 1000;
                if (decoded.iat < changedTimestamp) {
                    throw new error_util_1.AppError("Password recently changed. Please log in again.", 401);
                }
            }
            if (user.status !== rbac_config_1.UserStatus.ACTIVE) {
                throw new error_util_1.AppError("Account is not active. Please contact support.", 401);
            }
            req.user = user;
            req.token = token;
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                const refreshToken = (_b = req.cookies) === null || _b === void 0 ? void 0 : _b.refreshToken;
                if (!refreshToken) {
                    throw new error_util_1.AppError("Session expired. Please log in again.", 401);
                }
                const validToken = await refresh_token_model_1.RefreshTokenModel.findOne({
                    token: refreshToken,
                    isRevoked: false,
                    expiresAt: { $gt: new Date() },
                });
                if (!validToken) {
                    throw new error_util_1.AppError("Invalid refresh token. Please log in again.", 401);
                }
                const user = await user_model_1.UserModel.findById(validToken.user).select("+security");
                if (!user || user.status !== rbac_config_1.UserStatus.ACTIVE) {
                    throw new error_util_1.AppError("User not found or inactive", 401);
                }
                const newToken = jsonwebtoken_1.default.sign({ id: user._id, roles: user.roles, email: user.email }, process.env.JWT_SECRET, { expiresIn: "15m" });
                validToken.isRevoked = true;
                await validToken.save();
                const newRefreshToken = await refresh_token_model_1.RefreshTokenModel.create({
                    user: user._id,
                    token: crypto_1.default.randomBytes(40).toString("hex"),
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    deviceInfo: {
                        ip: req.ip || req.socket.remoteAddress || "unknown",
                        userAgent: req.headers["user-agent"] || "",
                    },
                });
                res.cookie("refreshToken", newRefreshToken.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                });
                res.setHeader("X-New-Access-Token", newToken);
                req.user = user;
                req.token = newToken;
                next();
            }
            else {
                throw new error_util_1.AppError("Invalid token. Please log in again.", 401);
            }
        }
    }
    catch (error) {
        next(error);
    }
};
exports.protect = protect;
const permissionCheckLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many permission checks from this IP, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
});
const restrictTo = (...roles) => {
    return [
        permissionCheckLimiter,
        (req, _res, next) => {
            try {
                if (!req.user) {
                    throw new error_util_1.AppError("Not authenticated", 401);
                }
                const validRoles = Object.values(rbac_config_1.UserRole);
                const hasInvalidRole = req.user.roles.some((role) => !validRoles.includes(role));
                if (hasInvalidRole) {
                    throw new error_util_1.AppError("Invalid user role", 403);
                }
                const hasRequiredRole = req.user.roles.some((role) => roles.includes(role));
                if (!hasRequiredRole) {
                    throw new error_util_1.AppError("You do not have permission to perform this action", 403);
                }
                next();
            }
            catch (error) {
                next(error);
            }
        },
    ];
};
exports.restrictTo = restrictTo;
const hasPermission = (permission) => {
    return [
        permissionCheckLimiter,
        async (req, _res, next) => {
            try {
                if (!req.user) {
                    throw new error_util_1.AppError("Not authenticated", 401);
                }
                if (process.env.NODE_ENV === "development") {
                    return next();
                }
                const userId = req.user._id.toString();
                const userRoles = req.user.roles;
                const validRoles = Object.values(rbac_config_1.UserRole);
                const hasInvalidRole = userRoles.some((role) => !validRoles.includes(role));
                if (hasInvalidRole) {
                    throw new error_util_1.AppError("Invalid role detected", 403);
                }
                let userPermissions = permission_cache_util_1.permissionCache.getPermissions(userId, userRoles);
                if (!userPermissions) {
                    userPermissions = userRoles.flatMap((role) => (0, rbac_config_1.getAllPermissionsForRole)(role));
                    permission_cache_util_1.permissionCache.setPermissions(userId, userRoles, userPermissions);
                }
                const customPermissions = req.user.customPermissions || [];
                const allValidPermissions = new Set(Object.values(rbac_config_1.PERMISSIONS)
                    .flatMap((rolePerms) => Object.values(rolePerms))
                    .flat());
                const hasInvalidCustomPermission = customPermissions.some((perm) => !allValidPermissions.has(perm));
                if (hasInvalidCustomPermission) {
                    throw new error_util_1.AppError("Invalid custom permission detected", 403);
                }
                const allUserPermissions = [...userPermissions, ...customPermissions];
                if (!allUserPermissions.includes(permission)) {
                    throw new error_util_1.AppError("You do not have the required permission", 403);
                }
                next();
            }
            catch (error) {
                next(error);
            }
        },
    ];
};
exports.hasPermission = hasPermission;
const customRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
    const requests = new Map();
    return (req, _res, next) => {
        const ip = req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;
        requests.forEach((timestamp, key) => {
            if (timestamp < windowStart) {
                requests.delete(key);
            }
        });
        const requestCount = Array.from(requests.values()).filter((timestamp) => timestamp > windowStart).length;
        if (requestCount >= max) {
            throw new error_util_1.AppError("Too many requests. Please try again later.", 429);
        }
        requests.set(ip, now);
        next();
    };
};
exports.customRateLimit = customRateLimit;
//# sourceMappingURL=auth.middleware.js.map