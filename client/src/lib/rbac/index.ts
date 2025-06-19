import { UserRole, ResourceType, PermissionAction, Permission } from './types';

// Core RBAC types and interfaces
export interface RoleConfig {
  permissions: Permission[];
  inherits?: UserRole[];
}

// Role definitions with inheritance
export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  [UserRole.ADMIN]: {
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
    permissions: [
      { resource: ResourceType.COURSE, action: PermissionAction.CREATE },
      { resource: ResourceType.COURSE, action: PermissionAction.UPDATE },
      { resource: ResourceType.COURSE, action: PermissionAction.DELETE }
    ],
    inherits: [UserRole.STUDENT]
  },
  [UserRole.STUDENT]: {
    permissions: [
      { resource: ResourceType.COURSE, action: PermissionAction.READ },
      { resource: ResourceType.ARTICLE, action: PermissionAction.READ }
    ],
    inherits: [UserRole.USER]
  },
  [UserRole.WRITER]: {
    permissions: [
      { resource: ResourceType.ARTICLE, action: PermissionAction.CREATE },
      { resource: ResourceType.ARTICLE, action: PermissionAction.UPDATE },
      { resource: ResourceType.ARTICLE, action: PermissionAction.DELETE }
    ],
    inherits: [UserRole.USER]
  },
  [UserRole.SELLER]: {
    permissions: [
      { resource: ResourceType.PRODUCT, action: PermissionAction.CREATE },
      { resource: ResourceType.PRODUCT, action: PermissionAction.UPDATE },
      { resource: ResourceType.PRODUCT, action: PermissionAction.DELETE }
    ],
    inherits: [UserRole.USER]
  },
  [UserRole.USER]: {
    permissions: [
      { resource: ResourceType.USER, action: PermissionAction.READ },
      { resource: ResourceType.PRODUCT, action: PermissionAction.READ },
      { resource: ResourceType.CATEGORY, action: PermissionAction.READ }
    ]
  }
};

// Core permission checking functions
export function hasPermission(
  userRoles: UserRole[],
  resource: ResourceType,
  action: PermissionAction
): boolean {
  return userRoles.some(role => {
    const config = ROLE_CONFIG[role];
    if (!config) return false;

    // Check direct permissions
    const hasDirectPermission = config.permissions.some(
      p => p.resource === resource && (p.action === action || p.action === PermissionAction.MANAGE)
    );
    if (hasDirectPermission) return true;

    // Check inherited permissions
    if (config.inherits) {
      return config.inherits.some(inheritedRole =>
        hasPermission([inheritedRole], resource, action)
      );
    }

    return false;
  });
}

export function getAllPermissions(userRoles: UserRole[]): Permission[] {
  const permissions = new Set<string>();

  userRoles.forEach(role => {
    const config = ROLE_CONFIG[role];
    if (!config) return;

    // Add direct permissions
    config.permissions.forEach(p => {
      permissions.add(JSON.stringify(p));
    });

    // Add inherited permissions
    if (config.inherits) {
      config.inherits.forEach(inheritedRole => {
        getAllPermissions([inheritedRole]).forEach(p => {
          permissions.add(JSON.stringify(p));
        });
      });
    }
  });

  return Array.from(permissions).map(p => JSON.parse(p));
}

// Version control
export const RBAC_VERSION = '1.0.0';

export function validateRBACVersion(serverVersion: string): boolean {
  return serverVersion === RBAC_VERSION;
} 