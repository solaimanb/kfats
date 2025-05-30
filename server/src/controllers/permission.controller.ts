// server/controllers/permission.controller.ts
import { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/user.model";
import { ROLE_PERMISSIONS, UserRole, PERMISSIONS } from "../config/rbac.config";
import { catchAsync } from "../utils/catch-async.util";
import { AppError } from "../utils/error.util";
import { permissionCache } from "../utils/permission-cache.util";
import { AuditLogModel } from "../models/audit-Log.model";
import { PermissionService } from "../services/permission.service";

// Extend IUser to include customPermissions
declare module "../models/user.model" {
  interface IUser {
    customPermissions?: string[];
  }
}

export class PermissionController {
  private permissionService = new PermissionService();

  static assignPermissions = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { userId, permissions } = req.body;

      // Validate requesting user has admin role
      if (!req.user?.roles.includes(UserRole.ADMIN)) {
        throw new AppError("Only administrators can assign permissions", 403);
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Get all valid permissions from RBAC config
      const allValidPermissions = new Set(
        Object.values(PERMISSIONS)
          .flatMap((rolePerms) => Object.values(rolePerms))
          .flat()
      );

      // Validate all permissions being assigned
      const invalidPermissions = permissions.filter(
        (perm: string) => !allValidPermissions.has(perm)
      );

      if (invalidPermissions.length > 0) {
        throw new AppError(
          `Invalid permissions detected: ${invalidPermissions.join(", ")}`,
          400
        );
      }

      // Check for privilege escalation
      const adminPermissions = new Set(Object.values(PERMISSIONS.ADMIN));
      const hasAdminPermissions = permissions.some((perm: string) =>
        adminPermissions.has(perm)
      );

      if (hasAdminPermissions) {
        throw new AppError(
          "Cannot assign admin-level permissions through this endpoint",
          403
        );
      }

      const oldPermissions = [...(user.customPermissions || [])];

      // Add custom permissions to user
      user.customPermissions = [
        ...new Set([...(user.customPermissions || []), ...permissions]),
      ];

      // Validate maximum number of custom permissions
      const MAX_CUSTOM_PERMISSIONS = 50;
      if (user.customPermissions.length > MAX_CUSTOM_PERMISSIONS) {
        throw new AppError(
          `Cannot exceed ${MAX_CUSTOM_PERMISSIONS} custom permissions`,
          400
        );
      }

      await user.save();

      // Clear user's permission cache
      permissionCache.clearUserPermissions(userId);

      // Create audit log entry
      await AuditLogModel.create({
        userId: req.user?._id,
        action: "PERMISSION_GRANTED",
        resource: `user/${userId}/permissions`,
        roles: req.user?.roles || [],
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
    }
  );

  static revokePermissions = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { userId, permissions } = req.body;

      // Validate requesting user has admin role
      if (!req.user?.roles.includes(UserRole.ADMIN)) {
        throw new AppError("Only administrators can revoke permissions", 403);
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      const oldPermissions = [...(user.customPermissions || [])];

      // Remove specified permissions
      user.customPermissions = (user.customPermissions || []).filter(
        (perm) => !permissions.includes(perm)
      );

      await user.save();

      // Clear user's permission cache
      permissionCache.clearUserPermissions(userId);

      // Create audit log entry
      await AuditLogModel.create({
        userId: req.user?._id,
        action: "PERMISSION_REVOKED",
        resource: `user/${userId}/permissions`,
        roles: req.user?.roles || [],
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
    }
  );

  static getUserPermissions = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const user = await UserModel.findById(req.params.userId);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Try to get from cache first
      let allPermissions = permissionCache.getPermissions(
        user._id.toString(),
        user.roles
      );

      // If not in cache, calculate and cache
      if (!allPermissions) {
        const rolePermissions = user.roles.flatMap(
          (role: UserRole) => ROLE_PERMISSIONS[role] || []
        );
        allPermissions = [
          ...new Set([...rolePermissions, ...(user.customPermissions || [])]),
        ];
        permissionCache.setPermissions(
          user._id.toString(),
          user.roles,
          allPermissions
        );
      }

      res.status(200).json({
        status: "success",
        data: {
          permissions: allPermissions,
        },
      });
    }
  );

  getAllPermissions = catchAsync(async (_req: Request, res: Response) => {
    const permissions = await this.permissionService.getAllPermissions();
    res.status(200).json({
      status: "success",
      data: permissions,
    });
  });

  getRolePermissions = catchAsync(async (req: Request, res: Response) => {
    const permissions = await this.permissionService.getRolePermissions(
      req.params.role
    );
    res.status(200).json({
      status: "success",
      data: permissions,
    });
  });

  updateRolePermissions = catchAsync(async (req: Request, res: Response) => {
    const permissions = await this.permissionService.updateRolePermissions(
      req.params.role,
      req.body.permissions
    );
    res.status(200).json({
      status: "success",
      data: permissions,
    });
  });
}

export default new PermissionController();
