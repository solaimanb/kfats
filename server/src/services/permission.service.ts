import { ROLE_PERMISSIONS, UserRole } from "../config/rbac.config";
import { AppError } from "../utils/app-error.util";
import { PermissionOverrideModel } from "../models/permission-override.model";
import { permissionCache } from "../utils/permission-cache.util";

export class PermissionService {
  getAllPermissions(): string[] {
    return Object.values(ROLE_PERMISSIONS).flat();
  }

  /**
   * Validates that permissions belong to the specific role
   * Each role can only have its own permissions
   */
  private validateRolePermissions(
    role: UserRole,
    permissions: string[]
  ): string[] {
    // Admin is handled separately
    if (role === UserRole.ADMIN) {
      return permissions;
    }

    const basePermissions = ROLE_PERMISSIONS[role] || [];
    const invalidPermissions = permissions.filter(
      (p) => !basePermissions.includes(p)
    );

    if (invalidPermissions.length > 0) {
      throw new AppError(
        `Role ${role} cannot have these permissions: ${invalidPermissions.join(
          ", "
        )}`,
        400
      );
    }

    return permissions;
  }

  async getRolePermissions(role: string) {
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new AppError("Invalid role", 400);
    }

    // First check cache
    const cachedPermissions = permissionCache.getPermissions("system", [
      role as UserRole,
    ]);
    if (cachedPermissions) {
      return cachedPermissions;
    }

    // Get base permissions
    const basePermissions = ROLE_PERMISSIONS[role as UserRole] || [];

    // Check for overrides
    const override = await PermissionOverrideModel.findOne({ role });

    // Validate that override permissions belong to this role
    const finalPermissions = override
      ? this.validateRolePermissions(role as UserRole, override.permissions)
      : basePermissions;

    // Cache the result
    permissionCache.setPermissions(
      "system",
      [role as UserRole],
      finalPermissions
    );

    return finalPermissions;
  }

  async updateRolePermissions(
    role: string,
    permissions: string[],
    userId: string
  ) {
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new AppError("Invalid role", 400);
    }

    // Validate permissions belong to this role
    const validatedPermissions = this.validateRolePermissions(
      role as UserRole,
      permissions
    );

    // Update or create permission override
    const override = await PermissionOverrideModel.findOneAndUpdate(
      { role },
      {
        permissions: validatedPermissions,
        createdBy: userId,
      },
      {
        new: true,
        upsert: true,
      }
    );

    // Clear cache for this role
    permissionCache.clearUserPermissions("system");

    return override.permissions;
  }

  async resetRolePermissions(role: string) {
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new AppError("Invalid role", 400);
    }

    // Delete any overrides
    await PermissionOverrideModel.deleteOne({ role });

    // Clear cache for this role
    permissionCache.clearUserPermissions("system");

    // Return base permissions
    return ROLE_PERMISSIONS[role as UserRole] || [];
  }
}

export default new PermissionService();
