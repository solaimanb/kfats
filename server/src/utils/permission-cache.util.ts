import {
  UserRole,
  Permission,
  CachedPermissions,
  RBAC_VERSION,
} from "../config/rbac/types";
import { ROLE_CONFIG } from "../config/rbac/roles";
import { RBACValidator } from "./rbac/validator.util";

class PermissionCache {
  private cache: Map<string, CachedPermissions>;
  private rolePermissionCache: Map<UserRole, Permission[]>;
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.cache = new Map();
    this.rolePermissionCache = new Map();
    this.initializeRolePermissionCache();
  }

  /**
   * Initialize pre-computed role permissions
   */
  private initializeRolePermissionCache(): void {
    Object.values(UserRole).forEach((role) => {
      const permissions = this.computeRolePermissions(role);
      this.rolePermissionCache.set(role, permissions);
    });
  }

  /**
   * Get permissions for a user
   */
  getPermissions(userId: string, roles: UserRole[]): Permission[] | null {
    const cached = this.cache.get(userId);
    if (!cached) return null;

    // Check if cache is expired or roles have changed
    if (
      Date.now() - cached.timestamp > this.TTL ||
      !this.areRolesEqual(cached.roles, roles)
    ) {
      this.cache.delete(userId);
      return null;
    }

    return cached.permissions;
  }

  /**
   * Set permissions for a user
   */
  setPermissions(
    userId: string,
    roles: UserRole[],
    permissions: Permission[]
  ): void {
    // Validate roles and permissions
    RBACValidator.validateRoleConstraints(roles);
    permissions.forEach(RBACValidator.validatePermission);

    this.cache.set(userId, {
      permissions,
      roles,
      timestamp: Date.now(),
      version: RBAC_VERSION.toString(),
    });
  }

  /**
   * Get pre-computed permissions for a role
   */
  getRolePermissions(role: UserRole): Permission[] {
    const cached = this.rolePermissionCache.get(role);
    if (!cached) {
      const permissions = this.computeRolePermissions(role);
      this.rolePermissionCache.set(role, permissions);
      return permissions;
    }
    return cached;
  }

  /**
   * Compute all permissions for a role including inherited ones
   */
  private computeRolePermissions(role: UserRole): Permission[] {
    const roleConfig = ROLE_CONFIG[role];
    if (!roleConfig) return [];

    const permissions = [...roleConfig.permissions];

    // Add inherited permissions
    roleConfig.inherits?.forEach((inheritedRole) => {
      const inheritedPermissions = this.computeRolePermissions(inheritedRole);
      permissions.push(...inheritedPermissions);
    });

    // Remove duplicates
    return Array.from(
      new Map(
        permissions.map((p) => [
          `${p.resource}:${p.action}:${JSON.stringify(p.conditions)}`,
          p,
        ])
      ).values()
    );
  }

  /**
   * Clear cache for a specific user or all users
   */
  clearCache(userId?: string): void {
    if (userId) {
      this.cache.delete(userId);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Clear cache for a specific user (alias for clearCache)
   */
  clearUserPermissions(userId: string): void {
    this.clearCache(userId);
  }

  /**
   * Clear role permission cache and recompute
   */
  recomputeRolePermissions(): void {
    this.rolePermissionCache.clear();
    this.initializeRolePermissionCache();
    this.cache.clear(); // Clear user cache as role permissions have changed
  }

  /**
   * Check if two role arrays are equal
   */
  private areRolesEqual(a: UserRole[], b: UserRole[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((role, i) => role === b[i]);
  }
}

// Export singleton instance
export const permissionCache = new PermissionCache();
