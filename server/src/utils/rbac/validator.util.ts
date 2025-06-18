import { Permission, UserRole, ResourceType, PermissionAction } from '../../config/rbac/types';
import { ROLE_CONFIG } from '../../config/rbac/roles';
import { AppError } from '../error.util';

export class RBACValidator {
  /**
   * Validates a single permission
   */
  static validatePermission(permission: Permission): boolean {
    if (!Object.values(ResourceType).includes(permission.resource)) {
      throw new AppError(`Invalid resource type: ${permission.resource}`, 400);
    }

    if (!Object.values(PermissionAction).includes(permission.action)) {
      throw new AppError(`Invalid permission action: ${permission.action}`, 400);
    }

    if (permission.conditions && typeof permission.conditions !== 'object') {
      throw new AppError('Permission conditions must be an object', 400);
    }

    return true;
  }

  /**
   * Validates role hierarchy and prevents circular dependencies
   */
  static validateRoleHierarchy(role: UserRole): boolean {
    const visited = new Set<UserRole>();
    
    const checkCycle = (currentRole: UserRole): boolean => {
      if (visited.has(currentRole)) {
        return true; // Cycle detected
      }

      visited.add(currentRole);
      const inherits = ROLE_CONFIG[currentRole]?.inherits || [];
      
      for (const inheritedRole of inherits) {
        if (checkCycle(inheritedRole)) {
          return true;
        }
      }

      visited.delete(currentRole);
      return false;
    };

    if (checkCycle(role)) {
      throw new AppError(`Circular role inheritance detected for role: ${role}`, 400);
    }

    return true;
  }

  /**
   * Validates role constraints (e.g., mutually exclusive roles)
   */
  static validateRoleConstraints(roles: UserRole[]): boolean {
    // Must have at least one role
    if (!roles || roles.length === 0) {
      throw new AppError('User must have at least one role', 400);
    }

    // All roles must be valid
    const invalidRoles = roles.filter(role => !Object.values(UserRole).includes(role));
    if (invalidRoles.length > 0) {
      throw new AppError(`Invalid roles detected: ${invalidRoles.join(', ')}`, 400);
    }

    // Cannot have both ADMIN and other roles
    if (roles.includes(UserRole.ADMIN) && roles.length > 1) {
      throw new AppError('Admin role cannot be combined with other roles', 400);
    }

    // Cannot have both MENTOR and STUDENT roles
    if (roles.includes(UserRole.MENTOR) && roles.includes(UserRole.STUDENT)) {
      throw new AppError('Cannot have both Mentor and Student roles', 400);
    }

    return true;
  }

  /**
   * Validates role transition
   */
  static validateRoleTransition(fromRole: UserRole, toRole: UserRole): boolean {
    // Check if roles are valid
    if (!Object.values(UserRole).includes(fromRole) || !Object.values(UserRole).includes(toRole)) {
      throw new AppError(`Invalid role transition: ${fromRole} -> ${toRole}`, 400);
    }

    // Check if transition is allowed based on role hierarchy
    const allowedTransitions = ROLE_CONFIG[fromRole]?.inherits || [];
    if (!allowedTransitions.includes(toRole)) {
      throw new AppError(`Role transition from ${fromRole} to ${toRole} is not allowed`, 403);
    }

    return true;
  }

  /**
   * Validates a set of permissions against a role
   */
  static validateRolePermissions(role: UserRole, permissions: Permission[]): boolean {
    const roleConfig = ROLE_CONFIG[role];
    if (!roleConfig) {
      throw new AppError(`Invalid role: ${role}`, 400);
    }

    // Get all allowed permissions for the role (including inherited)
    const allowedPermissions = this.getAllowedPermissions(role);

    // Check if all permissions are allowed for this role
    const invalidPermissions = permissions.filter(permission => 
      !this.isPermissionAllowed(permission, allowedPermissions)
    );

    if (invalidPermissions.length > 0) {
      throw new AppError(
        `Role ${role} cannot have these permissions: ${JSON.stringify(invalidPermissions)}`,
        400
      );
    }

    return true;
  }

  /**
   * Gets all allowed permissions for a role (including inherited)
   */
  private static getAllowedPermissions(role: UserRole): Permission[] {
    const roleConfig = ROLE_CONFIG[role];
    if (!roleConfig) return [];

    const permissions = [...roleConfig.permissions];
    
    // Add inherited permissions
    roleConfig.inherits?.forEach(inheritedRole => {
      const inheritedPermissions = this.getAllowedPermissions(inheritedRole);
      permissions.push(...inheritedPermissions);
    });

    return permissions;
  }

  /**
   * Checks if a permission is allowed within a set of permissions
   */
  private static isPermissionAllowed(
    permission: Permission,
    allowedPermissions: Permission[]
  ): boolean {
    return allowedPermissions.some(allowed => 
      allowed.resource === permission.resource &&
      (allowed.action === permission.action || allowed.action === PermissionAction.MANAGE)
    );
  }
} 