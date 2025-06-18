import {
  UserRole,
  ResourceType,
  PermissionAction,
  RoleConfig,
  Permission,
} from "./types";
import {
  BASE_PERMISSIONS,
  CONTENT_PERMISSIONS,
  COURSE_PERMISSIONS,
  PRODUCT_PERMISSIONS,
  ADMIN_PERMISSIONS,
} from "./permissions";

/**
 * Role definitions with their permissions and inheritance
 * IMPORTANT: Must match server configuration exactly
 */
export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  [UserRole.ADMIN]: {
    permissions: ADMIN_PERMISSIONS,
  },
  [UserRole.MENTOR]: {
    permissions: [...BASE_PERMISSIONS, ...COURSE_PERMISSIONS],
    inherits: [UserRole.USER],
  },
  [UserRole.STUDENT]: {
    permissions: [
      ...BASE_PERMISSIONS,
      { resource: ResourceType.COURSE, action: PermissionAction.READ },
      { resource: ResourceType.ARTICLE, action: PermissionAction.READ },
    ],
    inherits: [UserRole.USER],
  },
  [UserRole.WRITER]: {
    permissions: [...BASE_PERMISSIONS, ...CONTENT_PERMISSIONS],
    inherits: [UserRole.USER],
  },
  [UserRole.SELLER]: {
    permissions: [...BASE_PERMISSIONS, ...PRODUCT_PERMISSIONS],
    inherits: [UserRole.USER],
  },
  [UserRole.USER]: {
    permissions: BASE_PERMISSIONS,
  },
};

/**
 * Role transition rules
 * Each role can only transition to specific roles directly from USER role
 */
export const ROLE_TRANSITIONS: Record<UserRole, UserRole[]> = {
  [UserRole.USER]: [
    UserRole.STUDENT,
    UserRole.WRITER,
    UserRole.SELLER,
    UserRole.MENTOR,
  ],
  [UserRole.STUDENT]: [],
  [UserRole.WRITER]: [],
  [UserRole.SELLER]: [],
  [UserRole.MENTOR]: [],
  [UserRole.ADMIN]: [],
};

/**
 * Get all roles that can be upgraded to from a given role
 */
export function getPossibleUpgrades(role: UserRole): UserRole[] {
  return ROLE_TRANSITIONS[role] || [];
}

/**
 * Get all inherited roles for a given role
 */
export function getInheritedRoles(role: UserRole): UserRole[] {
  const config = ROLE_CONFIG[role];
  if (!config?.inherits?.length) {
    return [];
  }

  const inheritedRoles = [...config.inherits];
  config.inherits.forEach((inheritedRole: UserRole) => {
    inheritedRoles.push(...getInheritedRoles(inheritedRole));
  });

  // Remove duplicates
  return Array.from(new Set(inheritedRoles));
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(
  role: UserRole,
  resource: ResourceType,
  action: PermissionAction
): boolean {
  const config = ROLE_CONFIG[role];
  if (!config) return false;

  // Check direct permissions
  const hasDirectPermission = config.permissions.some(
    (p) =>
      p.resource === resource &&
      (p.action === action || p.action === PermissionAction.MANAGE)
  );

  if (hasDirectPermission) return true;

  // Check inherited permissions
  return (
    config.inherits?.some((inheritedRole) =>
      roleHasPermission(inheritedRole, resource, action)
    ) || false
  );
}

/**
 * Get all permissions for a role including inherited ones
 */
export function getAllRolePermissions(role: UserRole): Permission[] {
  const config = ROLE_CONFIG[role];
  if (!config) return [];

  const permissions = new Set<string>();

  // Add direct permissions
  config.permissions.forEach((p) => {
    permissions.add(JSON.stringify(p));
  });

  // Add inherited permissions
  if (config.inherits) {
    config.inherits.forEach((inheritedRole) => {
      getAllRolePermissions(inheritedRole).forEach((p) => {
        permissions.add(JSON.stringify(p));
      });
    });
  }

  return Array.from(permissions).map((p) => JSON.parse(p));
}

/**
 * Validate role inheritance to prevent cycles
 */
export function validateRoleInheritance(
  role: UserRole,
  visited = new Set<UserRole>()
): boolean {
  if (visited.has(role)) {
    return false; // Cycle detected
  }

  visited.add(role);
  const config = ROLE_CONFIG[role];

  if (!config?.inherits) {
    return true;
  }

  return config.inherits.every((inheritedRole) =>
    validateRoleInheritance(inheritedRole, new Set(visited))
  );
}
