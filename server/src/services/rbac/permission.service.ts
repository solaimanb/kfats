import { Permission, PermissionAction, ResourceType, UserRole } from '../../config/rbac/types';
import { hasPermission, hasAllPermissions, hasAnyPermission } from '../../config/rbac/permissions';
import { ROLE_CONFIG } from '../../config/rbac/roles';
import { validatePermission, RBACValidationError } from '../../config/rbac/validators';

export class PermissionService {
  /**
   * Check if a user has a specific permission
   */
  static checkPermission(
    userPermissions: Permission[],
    resource: ResourceType,
    action: PermissionAction
  ): boolean {
    return hasPermission(userPermissions, resource, action);
  }

  /**
   * Check if a user has all specified permissions
   */
  static checkAllPermissions(
    userPermissions: Permission[],
    requiredPermissions: Array<{ resource: ResourceType; action: PermissionAction }>
  ): boolean {
    return hasAllPermissions(userPermissions, requiredPermissions);
  }

  /**
   * Check if a user has any of the specified permissions
   */
  static checkAnyPermission(
    userPermissions: Permission[],
    requiredPermissions: Array<{ resource: ResourceType; action: PermissionAction }>
  ): boolean {
    return hasAnyPermission(userPermissions, requiredPermissions);
  }

  /**
   * Get all permissions for a role
   */
  static getRolePermissions(role: UserRole): Permission[] {
    if (!Object.values(UserRole).includes(role)) {
      throw new RBACValidationError(`Invalid role: ${role}`);
    }

    const config = ROLE_CONFIG[role];
    if (!config) {
      return [];
    }

    const permissions = [...config.permissions];
    
    // Add inherited permissions
    config.inherits?.forEach((inheritedRole: UserRole) => {
      const inheritedPermissions = this.getRolePermissions(inheritedRole);
      permissions.push(...inheritedPermissions);
    });

    // Remove duplicates using a more type-safe approach
    const uniquePermissions = new Map<string, Permission>();
    
    permissions.forEach(permission => {
      let permissionKey = `${permission.resource}:${permission.action}`;
      if (permission.conditions) {
        permissionKey += `:${JSON.stringify(permission.conditions)}`;
      }
      uniquePermissions.set(permissionKey, permission);
    });

    return Array.from(uniquePermissions.values());
  }

  /**
   * Get all available permissions for a resource
   */
  static getResourcePermissions(resource: ResourceType): Permission[] {
    if (!Object.values(ResourceType).includes(resource)) {
      throw new RBACValidationError(`Invalid resource: ${resource}`);
    }
    return Object.values(PermissionAction).map(action => ({
      resource,
      action
    }));
  }

  /**
   * Check if a permission has conditions and if they are met
   */
  static checkPermissionConditions(
    permission: Permission,
    conditions: Record<string, unknown> | null | undefined
  ): boolean {
    if (!permission.conditions) {
      return true;
    }

    if (!conditions) {
      return false;
    }

    return Object.entries(permission.conditions).every(([key, expectedValue]) => {
      const actualValue = conditions[key];
      if (actualValue === undefined || actualValue === null) {
        return false;
      }
      if (typeof expectedValue !== typeof actualValue) {
        return false;
      }
      return expectedValue === actualValue;
    });
  }

  /**
   * Get all permissions for a user based on their roles
   */
  static getUserPermissions(roles: UserRole[]): Permission[] {
    // Validate roles
    const invalidRoles = roles.filter(role => !Object.values(UserRole).includes(role));
    if (invalidRoles.length > 0) {
      throw new RBACValidationError(`Invalid roles: ${invalidRoles.join(', ')}`);
    }

    const allPermissions = roles.flatMap(role => this.getRolePermissions(role));
    
    // Remove duplicates using a more type-safe approach
    const uniquePermissions = new Map<string, Permission>();
    
    allPermissions.forEach(permission => {
      let permissionKey = `${permission.resource}:${permission.action}`;
      if (permission.conditions) {
        permissionKey += `:${JSON.stringify(permission.conditions)}`;
      }
      uniquePermissions.set(permissionKey, permission);
    });

    return Array.from(uniquePermissions.values());
  }

  /**
   * Check if a permission is valid for a specific resource
   * @throws {RBACValidationError} If resource or action is invalid
   */
  static isValidResourcePermission(
    resource: ResourceType,
    action: PermissionAction
  ): boolean {
    if (!Object.values(ResourceType).includes(resource)) {
      throw new RBACValidationError(`Invalid resource: ${resource}`);
    }
    if (!Object.values(PermissionAction).includes(action)) {
      throw new RBACValidationError(`Invalid action: ${action}`);
    }
    return validatePermission({ resource, action });
  }
} 