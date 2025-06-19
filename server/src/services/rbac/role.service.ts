import { UserRole, ResourceType, PermissionAction, Permission } from '../../config/rbac/types';
import { ROLE_CONFIG } from '../../config/rbac/roles';
import { validateRoleTransition, RBACValidationError } from '../../config/rbac/validators';

export class RoleService {
  /**
   * Check if a user has a specific role
   */
  static hasRole(roles: UserRole[], role: UserRole): boolean {
    if (!this.validateRole(role)) {
      throw new RBACValidationError(`Invalid role: ${role}`);
    }
    return roles.includes(role);
  }

  /**
   * Check if a user has any of the specified roles
   */
  static hasAnyRole(roles: UserRole[], targetRoles: UserRole[]): boolean {
    const validateRole = this.validateRole.bind(this);
    if (!targetRoles.every(validateRole)) {
      throw new RBACValidationError('One or more invalid roles specified');
    }
    return targetRoles.some(role => roles.includes(role));
  }

  /**
   * Check if a user has all specified roles
   */
  static hasAllRoles(roles: UserRole[], targetRoles: UserRole[]): boolean {
    const validateRole = this.validateRole.bind(this);
    if (!targetRoles.every(validateRole)) {
      throw new RBACValidationError('One or more invalid roles specified');
    }
    return targetRoles.every(role => roles.includes(role));
  }

  /**
   * Check if a role can be upgraded to another role
   */
  static canUpgradeRole(currentRole: UserRole, targetRole: UserRole): boolean {
    try {
      return validateRoleTransition(currentRole, targetRole);
    } catch (error) {
      if (error instanceof RBACValidationError) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get all roles that can be upgraded to from a given role
   */
  static getAvailableUpgrades(currentRole: UserRole): UserRole[] {
    if (!this.validateRole(currentRole)) {
      throw new RBACValidationError(`Invalid role: ${currentRole}`);
    }
    return Object.values(UserRole).filter(role => 
      this.canUpgradeRole(currentRole, role)
    );
  }

  /**
   * Get all roles that inherit from a given role
   */
  static getInheritedRoles(role: UserRole): UserRole[] {
    if (!this.validateRole(role)) {
      throw new RBACValidationError(`Invalid role: ${role}`);
    }

    const config = ROLE_CONFIG[role];
    if (!config || !config.inherits) {
      return [];
    }

    const inheritedRoles = [...config.inherits];
    
    // Add nested inherited roles
    config.inherits.forEach((inheritedRole: UserRole) => {
      const nestedRoles = this.getInheritedRoles(inheritedRole);
      inheritedRoles.push(...nestedRoles);
    });

    // Remove duplicates
    return Array.from(new Set(inheritedRoles));
  }

  /**
   * Check if a role inherits from another role
   */
  static inheritsFrom(role: UserRole, inheritedRole: UserRole): boolean {
    if (!this.validateRole(role) || !this.validateRole(inheritedRole)) {
      throw new RBACValidationError('Invalid role specified');
    }
    const inheritedRoles = this.getInheritedRoles(role);
    return inheritedRoles.includes(inheritedRole);
  }

  /**
   * Get all roles that a role can inherit from
   */
  static getPotentialInheritance(role: UserRole): UserRole[] {
    if (!this.validateRole(role)) {
      throw new RBACValidationError(`Invalid role: ${role}`);
    }
    return Object.values(UserRole).filter(potentialRole => 
      // A role cannot inherit from itself
      role !== potentialRole &&
      // Cannot create circular inheritance
      !this.inheritsFrom(potentialRole, role)
    );
  }

  /**
   * Validate a role exists
   */
  static validateRole(role: UserRole): boolean {
    return Object.values(UserRole).includes(role);
  }

  /**
   * Get role configuration
   */
  static getRoleConfig(role: UserRole) {
    if (!this.validateRole(role)) {
      throw new RBACValidationError(`Invalid role: ${role}`);
    }
    return ROLE_CONFIG[role];
  }

  /**
   * Get all available roles
   */
  static getAllRoles(): UserRole[] {
    return Object.values(UserRole);
  }

  /**
   * Get all roles that have access to a specific resource and action
   */
  static getRolesWithAccess(
    resource: ResourceType,
    action: PermissionAction
  ): UserRole[] {
    if (!Object.values(ResourceType).includes(resource)) {
      throw new RBACValidationError(`Invalid resource: ${resource}`);
    }
    if (!Object.values(PermissionAction).includes(action)) {
      throw new RBACValidationError(`Invalid action: ${action}`);
    }

    return Object.entries(ROLE_CONFIG)
      .filter(([_, config]) => 
        config.permissions.some((p: Permission) => 
          p.resource === resource && 
          (p.action === action || p.action === PermissionAction.MANAGE)
        )
      )
      .map(([role]) => role as UserRole);
  }
} 