"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionService = void 0;
const rbac_config_1 = require("../config/rbac.config");
const app_error_util_1 = require("../utils/app-error.util");
class PermissionService {
    async getAllPermissions() {
        return Object.values(rbac_config_1.ROLE_PERMISSIONS).flat();
    }
    async getRolePermissions(role) {
        if (!Object.values(rbac_config_1.UserRole).includes(role)) {
            throw new app_error_util_1.AppError('Invalid role', 400);
        }
        return rbac_config_1.ROLE_PERMISSIONS[role] || [];
    }
    async updateRolePermissions(role, permissions) {
        if (!Object.values(rbac_config_1.UserRole).includes(role)) {
            throw new app_error_util_1.AppError('Invalid role', 400);
        }
        return permissions;
    }
}
exports.PermissionService = PermissionService;
exports.default = new PermissionService();
//# sourceMappingURL=permission.service.js.map