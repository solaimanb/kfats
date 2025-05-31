"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const catch_async_util_1 = require("../utils/catch-async.util");
const auth_service_1 = require("../services/auth.service");
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.register = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
    const { email, password, firstName, lastName } = req.body;
    const deviceInfo = {
        ip: req.ip || req.socket.remoteAddress || "unknown",
        userAgent: req.headers["user-agent"] || "",
        deviceId: req.body.deviceId,
    };
    const { user, accessToken, refreshToken } = await auth_service_1.AuthService.register({
        email,
        password,
        firstName,
        lastName,
    }, deviceInfo);
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
        status: "success",
        data: {
            user,
            accessToken,
        },
    });
});
AuthController.login = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
    const { email, password } = req.body;
    const deviceInfo = {
        ip: req.ip || req.socket.remoteAddress || "unknown",
        userAgent: req.headers["user-agent"] || "",
        deviceId: req.body.deviceId,
    };
    const { user, accessToken, refreshToken } = await auth_service_1.AuthService.login(email, password, deviceInfo);
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
        status: "success",
        data: {
            user,
            accessToken,
        },
    });
});
AuthController.logout = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
    const refreshToken = req.cookies.refreshToken;
    await auth_service_1.AuthService.logout(req.user._id.toString(), refreshToken);
    res.clearCookie("refreshToken");
    res.status(200).json({
        status: "success",
        data: null,
    });
});
AuthController.logoutAllDevices = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
    await auth_service_1.AuthService.revokeAllUserSessions(req.user._id.toString());
    res.clearCookie("refreshToken");
    res.status(200).json({
        status: "success",
        message: "Logged out from all devices",
        data: null,
    });
});
AuthController.refreshToken = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401).json({
            status: "fail",
            message: "No refresh token provided",
        });
        return;
    }
    const deviceInfo = {
        ip: req.ip || req.socket.remoteAddress || "unknown",
        userAgent: req.headers["user-agent"] || "",
        deviceId: req.body.deviceId,
    };
    const { accessToken, refreshToken: newRefreshToken } = await auth_service_1.AuthService.refreshToken(refreshToken, deviceInfo);
    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
        status: "success",
        data: {
            accessToken,
        },
    });
});
AuthController.forgotPassword = (0, catch_async_util_1.catchAsync)(async (req, res) => {
    await auth_service_1.AuthService.forgotPassword(req.body.email);
    res.status(200).json({
        status: "success",
        message: "Password reset email sent",
    });
});
AuthController.resetPassword = (0, catch_async_util_1.catchAsync)(async (req, res) => {
    await auth_service_1.AuthService.resetPassword(req.params.token, req.body.password);
    res.status(200).json({
        status: "success",
        message: "Password reset successful",
    });
});
//# sourceMappingURL=auth.controller.js.map