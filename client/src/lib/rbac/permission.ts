import { Permission, PermissionAction } from '../../config/rbac/types';

/**
 * Check if a list of permissions includes a specific permission
 */
export function hasPermission(
  permissions: Permission[],
  resource: string,
  action: PermissionAction
): boolean {
  return permissions.some(
    p => p.resource === resource && (p.action === action || p.action === PermissionAction.MANAGE)
  );
}

/**
 * Check if a list of permissions includes all specified permissions
 */
export function hasAllPermissions(
  permissions: Permission[],
  requiredPermissions: Array<{ resource: string; action: PermissionAction }>
): boolean {
  return requiredPermissions.every(({ resource, action }) =>
    hasPermission(permissions, resource, action)
  );
}

/**
 * Check if a list of permissions includes any of the specified permissions
 */
export function hasAnyPermission(
  permissions: Permission[],
  requiredPermissions: Array<{ resource: string; action: PermissionAction }>
): boolean {
  return requiredPermissions.some(({ resource, action }) =>
    hasPermission(permissions, resource, action)
  );
}

/**
 * Check if a permission has conditions and if they are met
 */
export function checkPermissionConditions(
  permission: Permission,
  conditions: Record<string, unknown>
): boolean {
  if (!permission.conditions) {
    return true;
  }

  return Object.entries(permission.conditions).every(([key, value]) =>
    conditions[key] === value
  );
} 