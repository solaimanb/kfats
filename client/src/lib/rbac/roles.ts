import { UserRole, ResourceType, PermissionAction, RolePermissions, Permission } from './types';

export const ROLE_DEFINITIONS: Record<UserRole, RolePermissions> = {
  [UserRole.ADMIN]: {
    role: UserRole.ADMIN,
    permissions: [
      { resource: ResourceType.USER, action: PermissionAction.MANAGE },
      { resource: ResourceType.COURSE, action: PermissionAction.MANAGE },
      { resource: ResourceType.ARTICLE, action: PermissionAction.MANAGE },
      { resource: ResourceType.PRODUCT, action: PermissionAction.MANAGE },
      { resource: ResourceType.CATEGORY, action: PermissionAction.MANAGE },
      { resource: ResourceType.ROLE, action: PermissionAction.MANAGE }
    ]
  },
  [UserRole.MENTOR]: {
    role: UserRole.MENTOR,
    permissions: [
      { resource: ResourceType.COURSE, action: PermissionAction.CREATE },
      { resource: ResourceType.COURSE, action: PermissionAction.UPDATE },
      { resource: ResourceType.COURSE, action: PermissionAction.DELETE },
      { resource: ResourceType.ARTICLE, action: PermissionAction.CREATE },
      { resource: ResourceType.ARTICLE, action: PermissionAction.UPDATE }
    ],
    inherits: [UserRole.STUDENT]
  },
  [UserRole.STUDENT]: {
    role: UserRole.STUDENT,
    permissions: [
      { resource: ResourceType.COURSE, action: PermissionAction.READ },
      { resource: ResourceType.ARTICLE, action: PermissionAction.READ }
    ],
    inherits: [UserRole.USER]
  },
  [UserRole.WRITER]: {
    role: UserRole.WRITER,
    permissions: [
      { resource: ResourceType.ARTICLE, action: PermissionAction.CREATE },
      { resource: ResourceType.ARTICLE, action: PermissionAction.UPDATE },
      { resource: ResourceType.ARTICLE, action: PermissionAction.DELETE }
    ],
    inherits: [UserRole.USER]
  },
  [UserRole.SELLER]: {
    role: UserRole.SELLER,
    permissions: [
      { resource: ResourceType.PRODUCT, action: PermissionAction.CREATE },
      { resource: ResourceType.PRODUCT, action: PermissionAction.UPDATE },
      { resource: ResourceType.PRODUCT, action: PermissionAction.DELETE }
    ],
    inherits: [UserRole.USER]
  },
  [UserRole.USER]: {
    role: UserRole.USER,
    permissions: [
      { resource: ResourceType.USER, action: PermissionAction.READ },
      { resource: ResourceType.PRODUCT, action: PermissionAction.READ },
      { resource: ResourceType.CATEGORY, action: PermissionAction.READ }
    ]
  }
};

/**
 * Get all roles that a role inherits from
 */
export function getInheritedRoles(role: UserRole): UserRole[] {
  const roleConfig = ROLE_DEFINITIONS[role];
  if (!roleConfig?.inherits) {
    return [];
  }

  const inheritedRoles = [...roleConfig.inherits];
  roleConfig.inherits.forEach(inheritedRole => {
    inheritedRoles.push(...getInheritedRoles(inheritedRole));
  });

  return Array.from(new Set(inheritedRoles));
}

/**
 * Get possible role upgrades based on current role
 */
export function getPossibleUpgrades(role: UserRole): UserRole[] {
  return Object.values(ROLE_DEFINITIONS)
    .filter(config => config.autoUpgradeFrom?.role === role)
    .map(config => config.role);
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(
  role: UserRole,
  resource: ResourceType,
  action: PermissionAction
): boolean {
  const roleConfig = ROLE_DEFINITIONS[role];
  if (!roleConfig) {
    return false;
  }

  return roleConfig.permissions.some(
    (p: Permission) => p.resource === resource && (p.action === action || p.action === PermissionAction.MANAGE)
  );
}

export class RoleManager {
  private roles: UserRole[];

  constructor(roles: UserRole[]) {
    this.roles = roles;
  }

  hasRole(role: UserRole): boolean {
    return this.roles.includes(role);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return this.roles.some(role => roles.includes(role));
  }

  hasAllRoles(roles: UserRole[]): boolean {
    return roles.every(role => this.roles.includes(role));
  }

  getAllRoles(): UserRole[] {
    const allRoles = new Set<UserRole>();
    
    this.roles.forEach(role => {
      allRoles.add(role);
      getInheritedRoles(role).forEach((r: UserRole) => allRoles.add(r));
    });

    return Array.from(allRoles);
  }

  getPossibleUpgrades(): UserRole[] {
    return this.roles.flatMap(role => getPossibleUpgrades(role));
  }

  canUpgradeToRole(
    targetRole: UserRole,
    resource: ResourceType,
    action: PermissionAction
  ): boolean {
    const roleConfig = ROLE_DEFINITIONS[targetRole];
    if (!roleConfig?.autoUpgradeFrom) {
      return false;
    }

    const { role: requiredRole, conditions } = roleConfig.autoUpgradeFrom;
    
    if (!this.hasRole(requiredRole)) {
      return false;
    }

    return (
      conditions.resources.includes(resource) &&
      conditions.requiredActions.includes(action)
    );
  }

  getHighestRole(): UserRole {
    const rolePriority: Record<UserRole, number> = {
      [UserRole.ADMIN]: 6,
      [UserRole.MENTOR]: 5,
      [UserRole.WRITER]: 4,
      [UserRole.SELLER]: 3,
      [UserRole.STUDENT]: 2,
      [UserRole.USER]: 1
    };

    return this.roles.reduce((highest, current) => 
      rolePriority[current] > rolePriority[highest] ? current : highest
    );
  }

  isRoleHigherThan(role1: UserRole, role2: UserRole): boolean {
    const rolePriority: Record<UserRole, number> = {
      [UserRole.ADMIN]: 6,
      [UserRole.MENTOR]: 5,
      [UserRole.WRITER]: 4,
      [UserRole.SELLER]: 3,
      [UserRole.STUDENT]: 2,
      [UserRole.USER]: 1
    };

    return rolePriority[role1] > rolePriority[role2];
  }
} 