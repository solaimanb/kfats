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
dotenv_1.default.config();
const protect = async (req, _res, next) => {
    var _a;
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            throw new error_util_1.AppError("Not authenticated. Please log in.", 401);
        }
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
                    throw new error_util_1.AppError("Invalid role detected", 403);
                }
                if (!req.user.roles.some((role) => roles.includes(role))) {
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