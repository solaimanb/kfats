import { UserRole } from '../../config/rbac/types';
import { ROLE_CONFIG, ROLE_TRANSITIONS } from '../../config/rbac/roles';

/**
 * Check if a role inherits from another role
 */
export function inheritsRole(role: UserRole, inheritedRole: UserRole): boolean {
  const config = ROLE_CONFIG[role];
  if (!config?.inherits) {
    return false;
  }

  if (config.inherits.includes(inheritedRole)) {
    return true;
  }

  return config.inherits.some(r => inheritsRole(r, inheritedRole));
}

/**
 * Get all roles that inherit from a role
 */
export function getInheritingRoles(role: UserRole): UserRole[] {
  return Object.entries(ROLE_CONFIG)
    .filter(([_, config]) => config.inherits?.includes(role))
    .map(([r]) => r as UserRole);
}

/**
 * Get all roles that a role inherits from
 */
export function getInheritedRoles(role: UserRole): UserRole[] {
  const config = ROLE_CONFIG[role];
  if (!config?.inherits) {
    return [];
  }

  const inheritedRoles = [...config.inherits];
  config.inherits.forEach(inheritedRole => {
    inheritedRoles.push(...getInheritedRoles(inheritedRole));
  });

  return Array.from(new Set(inheritedRoles));
}

/**
 * Check if a role can transition to another role
 */
export function canTransitionToRole(fromRole: UserRole, toRole: UserRole): boolean {
  return ROLE_TRANSITIONS[fromRole]?.includes(toRole) || false;
}

/**
 * Get all possible role transitions for a role
 */
export function getPossibleTransitions(role: UserRole): UserRole[] {
  return ROLE_TRANSITIONS[role] || [];
} 