"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("../models/user.model");
const error_util_1 = require("../utils/error.util");
const rbac_config_1 = require("../config/rbac.config");
class UserService {
    async getProfile(userId) {
        const user = await user_model_1.UserModel.findById(userId);
        if (!user) {
            throw new error_util_1.AppError("User not found", 404);
        }
        return user;
    }
    async updateProfile(userId, updateData) {
        const user = await user_model_1.UserModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true });
        if (!user) {
            throw new error_util_1.AppError("User not found", 404);
        }
        return user;
    }
    async updatePassword(userId, passwordData) {
        const user = await user_model_1.UserModel.findById(userId).select("+password");
        if (!user) {
            throw new error_util_1.AppError("User not found", 404);
        }
        if (!(await user.comparePassword(passwordData.currentPassword))) {
            throw new error_util_1.AppError("Current password is incorrect", 401);
        }
        user.password = passwordData.newPassword;
        await user.save();
    }
    async getAllUsers(query) {
        return user_model_1.UserModel.find(query);
    }
    async getUser(userId) {
        const user = await user_model_1.UserModel.findById(userId);
        if (!user) {
            throw new error_util_1.AppError("User not found", 404);
        }
        return user;
    }
    async createUser(userData) {
        return user_model_1.UserModel.create(userData);
    }
    async updateUser(id, data) {
        if (data.roles) {
            if (!(0, rbac_config_1.validateRoleConstraints)(data.roles)) {
                throw new error_util_1.AppError((0, rbac_config_1.getRoleConstraintViolationMessage)(data.roles), 400);
            }
        }
        const user = await user_model_1.UserModel.findByIdAndUpdate(id, { $set: data }, { new: true });
        if (!user) {
            throw new error_util_1.AppError(`User with ID ${id} not found`, 404);
        }
        return user;
    }
    async deleteUser(userId) {
        const user = await user_model_1.UserModel.findByIdAndDelete(userId);
        if (!user) {
            throw new error_util_1.AppError("User not found", 404);
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map