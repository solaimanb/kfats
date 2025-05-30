"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const catch_async_util_1 = require("../utils/catch-async.util");
const user_service_1 = require("../services/user.service");
class UserController {
    constructor() {
        this.userService = new user_service_1.UserService();
        this.getProfile = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            var _a;
            const user = await this.userService.getProfile((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            res.status(200).json({
                status: 'success',
                data: user,
            });
        });
        this.updateProfile = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            var _a;
            const user = await this.userService.updateProfile((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, req.body);
            res.status(200).json({
                status: 'success',
                data: user,
            });
        });
        this.updatePassword = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            var _a;
            await this.userService.updatePassword((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, req.body);
            res.status(200).json({
                status: 'success',
                message: 'Password updated successfully',
            });
        });
        this.getAllUsers = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const users = await this.userService.getAllUsers(req.query);
            res.status(200).json({
                status: 'success',
                data: users,
            });
        });
        this.getUser = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const user = await this.userService.getUser(req.params.id);
            res.status(200).json({
                status: 'success',
                data: user,
            });
        });
        this.createUser = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const user = await this.userService.createUser(req.body);
            res.status(201).json({
                status: 'success',
                data: user,
            });
        });
        this.updateUser = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const user = await this.userService.updateUser(req.params.id, req.body);
            res.status(200).json({
                status: 'success',
                data: user,
            });
        });
        this.deleteUser = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            await this.userService.deleteUser(req.params.id);
            res.status(204).json({
                status: 'success',
                data: null,
            });
        });
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map