"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionController = void 0;
const user_model_1 = require("../models/user.model");
const rbac_config_1 = require("../config/rbac.config");
const catch_async_util_1 = require("../utils/catch-async.util");
const error_util_1 = require("../utils/error.util");
const permission_cache_util_1 = require("../utils/permission-cache.util");
const audit_log_model_1 = require("../models/audit-log.model");
const permission_service_1 = require("../services/permission.service");
class PermissionController {
    constructor() {
        this.permissionService = new permission_service_1.PermissionService();
        this.getAllPermissions = (0, catch_async_util_1.catchAsync)(async (_req, res) => {
            const permissions = await this.permissionService.getAllPermissions();
            res.status(200).json({
                status: "success",
                data: permissions,
            });
        });
        this.getRolePermissions = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const permissions = await this.permissionService.getRolePermissions(req.params.role);
            res.status(200).json({
                status: "success",
                data: permissions,
            });
        });
        this.updateRolePermissions = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const permissions = await this.permissionService.updateRolePermissions(req.params.role, req.body.permissions);
            res.status(200).json({
                status: "success",
                data: permissions,
            });
        });
    }
}
exports.PermissionController = PermissionController;
_a = PermissionController;
PermissionController.assignPermissions = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
    var _b, _c, _d;
    const { userId, permissions } = req.body;
    if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes(rbac_config_1.UserRole.ADMIN))) {
        throw new error_util_1.AppError("Only administrators can assign permissions", 403);
    }
    const user = await user_model_1.UserModel.findById(userId);
    if (!user) {
        throw new error_util_1.AppError("User not found", 404);
    }
    const allValidPermissions = new Set(Object.values(rbac_config_1.PERMISSIONS)
        .flatMap((rolePerms) => Object.values(rolePerms))
        .flat());
    const invalidPermissions = permissions.filter((perm) => !allValidPermissions.has(perm));
    if (invalidPermissions.length > 0) {
        throw new error_util_1.AppError(`Invalid permissions detected: ${invalidPermissions.join(", ")}`, 400);
    }
    const adminPermissions = new Set(Object.values(rbac_config_1.PERMISSIONS.ADMIN));
    const hasAdminPermissions = permissions.some((perm) => adminPermissions.has(perm));
    if (hasAdminPermissions) {
        throw new error_util_1.AppError("Cannot assign admin-level permissions through this endpoint", 403);
    }
    const oldPermissions = [...(user.customPermissions || [])];
    user.customPermissions = [
        ...new Set([...(user.customPermissions || []), ...permissions]),
    ];
    const MAX_CUSTOM_PERMISSIONS = 50;
    if (user.customPermissions.length > MAX_CUSTOM_PERMISSIONS) {
        throw new error_util_1.AppError(`Cannot exceed ${MAX_CUSTOM_PERMISSIONS} custom permissions`, 400);
    }
    await user.save();
    permission_cache_util_1.permissionCache.clearUserPermissions(userId);
    await audit_log_model_1.AuditLogModel.create({
        userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id,
        action: "PERMISSION_GRANTED",
        resource: `user/${userId}/permissions`,
        roles: ((_d = req.user) === null || _d === void 0 ? void 0 : _d.roles) || [],
        ip: req.ip || "unknown",
        userAgent: req.get("user-agent") || "unknown",
        metadata: {
            oldPermissions,
            newPermissions: user.customPermissions,
            grantedPermissions: permissions,
        },
        status: "success",
    });
    res.status(200).json({
        status: "success",
        message: "Permissions assigned successfully",
        data: {
            userId,
            customPermissions: user.customPermissions,
        },
    });
});
PermissionController.revokePermissions = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
    var _b, _c, _d;
    const { userId, permissions } = req.body;
    if (!((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes(rbac_config_1.UserRole.ADMIN))) {
        throw new error_util_1.AppError("Only administrators can revoke permissions", 403);
    }
    const user = await user_model_1.UserModel.findById(userId);
    if (!user) {
        throw new error_util_1.AppError("User not found", 404);
    }
    const oldPermissions = [...(user.customPermissions || [])];
    user.customPermissions = (user.customPermissions || []).filter((perm) => !permissions.includes(perm));
    await user.save();
    permission_cache_util_1.permissionCache.clearUserPermissions(userId);
    await audit_log_model_1.AuditLogModel.create({
        userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id,
        action: "PERMISSION_REVOKED",
        resource: `user/${userId}/permissions`,
        roles: ((_d = req.user) === null || _d === void 0 ? void 0 : _d.roles) || [],
        ip: req.ip || "unknown",
        userAgent: req.get("user-agent") || "unknown",
        metadata: {
            oldPermissions,
            newPermissions: user.customPermissions,
            revokedPermissions: permissions,
        },
        status: "success",
    });
    res.status(200).json({
        status: "success",
        message: "Permissions revoked successfully",
        data: {
            userId,
            customPermissions: user.customPermissions,
        },
    });
});
PermissionController.getUserPermissions = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
    const user = await user_model_1.UserModel.findById(req.params.userId);
    if (!user) {
        throw new error_util_1.AppError("User not found", 404);
    }
    let allPermissions = permission_cache_util_1.permissionCache.getPermissions(user._id.toString(), user.roles);
    if (!allPermissions) {
        const rolePermissions = user.roles.flatMap((role) => rbac_config_1.ROLE_PERMISSIONS[role] || []);
        allPermissions = [
            ...new Set([...rolePermissions, ...(user.customPermissions || [])]),
        ];
        permission_cache_util_1.permissionCache.setPermissions(user._id.toString(), user.roles, allPermissions);
    }
    res.status(200).json({
        status: "success",
        data: {
            permissions: allPermissions,
        },
    });
});
exports.default = new PermissionController();
//# sourceMappingURL=permission.controller.js.map