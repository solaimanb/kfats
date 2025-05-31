"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionService = void 0;
const rbac_config_1 = require("../config/rbac.config");
const app_error_util_1 = require("../utils/app-error.util");
const permission_override_model_1 = require("../models/permission-override.model");
const permission_cache_util_1 = require("../utils/permission-cache.util");
class PermissionService {
    getAllPermissions() {
        return Object.values(rbac_config_1.ROLE_PERMISSIONS).flat();
    }
    validateRolePermissions(role, permissions) {
        if (role === rbac_config_1.UserRole.ADMIN) {
            return permissions;
        }
        const basePermissions = rbac_config_1.ROLE_PERMISSIONS[role] || [];
        const invalidPermissions = permissions.filter((p) => !basePermissions.includes(p));
        if (invalidPermissions.length > 0) {
            throw new app_error_util_1.AppError(`Role ${role} cannot have these permissions: ${invalidPermissions.join(", ")}`, 400);
        }
        return permissions;
    }
    async getRolePermissions(role) {
        if (!Object.values(rbac_config_1.UserRole).includes(role)) {
            throw new app_error_util_1.AppError("Invalid role", 400);
        }
        const cachedPermissions = permission_cache_util_1.permissionCache.getPermissions("system", [
            role,
        ]);
        if (cachedPermissions) {
            return cachedPermissions;
        }
        const basePermissions = rbac_config_1.ROLE_PERMISSIONS[role] || [];
        const override = await permission_override_model_1.PermissionOverrideModel.findOne({ role });
        const finalPermissions = override
            ? this.validateRolePermissions(role, override.permissions)
            : basePermissions;
        permission_cache_util_1.permissionCache.setPermissions("system", [role], finalPermissions);
        return finalPermissions;
    }
    async updateRolePermissions(role, permissions, userId) {
        if (!Object.values(rbac_config_1.UserRole).includes(role)) {
            throw new app_error_util_1.AppError("Invalid role", 400);
        }
        const validatedPermissions = this.validateRolePermissions(role, permissions);
        const override = await permission_override_model_1.PermissionOverrideModel.findOneAndUpdate({ role }, {
            permissions: validatedPermissions,
            createdBy: userId,
        }, {
            new: true,
            upsert: true,
        });
        permission_cache_util_1.permissionCache.clearUserPermissions("system");
        return override.permissions;
    }
    async resetRolePermissions(role) {
        if (!Object.values(rbac_config_1.UserRole).includes(role)) {
            throw new app_error_util_1.AppError("Invalid role", 400);
        }
        await permission_override_model_1.PermissionOverrideModel.deleteOne({ role });
        permission_cache_util_1.permissionCache.clearUserPermissions("system");
        return rbac_config_1.ROLE_PERMISSIONS[role] || [];
    }
}
exports.PermissionService = PermissionService;
exports.default = new PermissionService();
//# sourceMappingURL=permission.service.js.map