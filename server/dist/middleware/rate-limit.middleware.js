"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetLimiter = exports.registrationLimiter = exports.loginLimiter = exports.roleApplicationLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const error_util_1 = require("../utils/error.util");
const createLimiter = (options) => {
    return (0, express_rate_limit_1.default)({
        windowMs: options.windowMs,
        max: options.max,
        message: options.message,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (_req, _res, next) => {
            next(new error_util_1.AppError(options.message, 429));
        },
    });
};
exports.roleApplicationLimiter = createLimiter({
    windowMs: 24 * 60 * 60 * 1000,
    max: 2,
    message: "Too many role applications. Please try again after 24 hours.",
});
exports.loginLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts. Please try again after 15 minutes.",
});
exports.registrationLimiter = createLimiter({
    windowMs: 24 * 60 * 60 * 1000,
    max: 3,
    message: "Too many accounts created. Please try again after 24 hours.",
});
exports.passwordResetLimiter = createLimiter({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: "Too many password reset requests. Please try again after an hour.",
});
//# sourceMappingURL=rate-limit.middleware.js.map