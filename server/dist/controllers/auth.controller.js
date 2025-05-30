"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const catch_async_util_1 = require("../utils/catch-async.util");
const auth_service_1 = require("../services/auth.service");
class AuthController {
    constructor() {
        this.register = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const { user, token } = await auth_service_1.AuthService.register(req.body);
            res.status(201).json({
                status: "success",
                data: { user, token },
            });
        });
        this.login = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const { email, password } = req.body;
            const { user, token } = await auth_service_1.AuthService.login(email, password);
            res.status(200).json({
                status: "success",
                data: { user, token },
            });
        });
        this.forgotPassword = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            await auth_service_1.AuthService.forgotPassword(req.body.email);
            res.status(200).json({
                status: "success",
                message: "Password reset email sent",
            });
        });
        this.resetPassword = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            await auth_service_1.AuthService.resetPassword(req.params.token, req.body.password);
            res.status(200).json({
                status: "success",
                message: "Password reset successful",
            });
        });
        this.getMe = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            res.status(200).json({
                status: "success",
                data: req.user,
            });
        });
        this.logout = (0, catch_async_util_1.catchAsync)(async (_req, res) => {
            res.status(200).json({
                status: "success",
                message: "Logged out successfully",
            });
        });
        this.refreshToken = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            var _a;
            const token = await auth_service_1.AuthService.refreshToken((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            res.status(200).json({
                status: "success",
                data: { token },
            });
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map