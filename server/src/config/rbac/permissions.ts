import { Permission, PermissionAction, ResourceType } from './types';

export class RBACPermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RBACPermissionError';
  }
}

/**
 * Validate a permission object
 * @throws {RBACPermissionError} If permission is invalid
 */
export function validatePermission(permission: Permission): boolean {
  if (!Object.values(ResourceType).includes(permission.resource)) {
    throw new RBACPermissionError(`Invalid resource: ${permission.resource}`);
  }
  if (!Object.values(PermissionAction).includes(permission.action)) {
    throw new RBACPermissionError(`Invalid action: ${permission.action}`);
  }
  if (permission.conditions && typeof permission.conditions !== 'object') {
    throw new RBACPermissionError('Permission conditions must be an object');
  }
  return true;
}

/**
 * Base permissions for each resource type
 */
export const BASE_PERMISSIONS_BY_RESOURCE: Record<ResourceType, Permission[]> = {
  [ResourceType.USER]: [
    { resource: ResourceType.USER, action: PermissionAction.READ },
    { resource: ResourceType.USER, action: PermissionAction.CREATE },
    { resource: ResourceType.USER, action: PermissionAction.UPDATE },
    { resource: ResourceType.USER, action: PermissionAction.DELETE },
    { resource: ResourceType.USER, action: PermissionAction.MANAGE }
  ],
  [ResourceType.COURSE]: [
    { resource: ResourceType.COURSE, action: PermissionAction.READ },
    { resource: ResourceType.COURSE, action: PermissionAction.CREATE },
    { resource: ResourceType.COURSE, action: PermissionAction.UPDATE },
    { resource: ResourceType.COURSE, action: PermissionAction.DELETE },
    { resource: ResourceType.COURSE, action: PermissionAction.MANAGE }
  ],
  [ResourceType.ARTICLE]: [
    { resource: ResourceType.ARTICLE, action: PermissionAction.READ },
    { resource: ResourceType.ARTICLE, action: PermissionAction.CREATE },
    { resource: ResourceType.ARTICLE, action: PermissionAction.UPDATE },
    { resource: ResourceType.ARTICLE, action: PermissionAction.DELETE },
    { resource: ResourceType.ARTICLE, action: PermissionAction.MANAGE }
  ],
  [ResourceType.PRODUCT]: [
    { resource: ResourceType.PRODUCT, action: PermissionAction.READ },
    { resource: ResourceType.PRODUCT, action: PermissionAction.CREATE },
    { resource: ResourceType.PRODUCT, action: PermissionAction.UPDATE },
    { resource: ResourceType.PRODUCT, action: PermissionAction.DELETE },
    { resource: ResourceType.PRODUCT, action: PermissionAction.MANAGE }
  ],
  [ResourceType.CATEGORY]: [
    { resource: ResourceType.CATEGORY, action: PermissionAction.READ },
    { resource: ResourceType.CATEGORY, action: PermissionAction.CREATE },
    { resource: ResourceType.CATEGORY, action: PermissionAction.UPDATE },
    { resource: ResourceType.CATEGORY, action: PermissionAction.DELETE },
    { resource: ResourceType.CATEGORY, action: PermissionAction.MANAGE }
  ],
  [ResourceType.ROLE]: [
    { resource: ResourceType.ROLE, action: PermissionAction.READ },
    { resource: ResourceType.ROLE, action: PermissionAction.CREATE },
    { resource: ResourceType.ROLE, action: PermissionAction.UPDATE },
    { resource: ResourceType.ROLE, action: PermissionAction.DELETE },
    { resource: ResourceType.ROLE, action: PermissionAction.MANAGE }
  ]
};

/**
 * Flattened base permissions array that can be spread
 */
export const BASE_PERMISSIONS: Permission[] = Object.values(BASE_PERMISSIONS_BY_RESOURCE).flat();

/**
 * Permission checking functions
 */
export function hasPermission(
  permissions: Permission[],
  resource: ResourceType,
  action: PermissionAction
): boolean {
  if (!Object.values(ResourceType).includes(resource)) {
    throw new RBACPermissionError(`Invalid resource: ${resource}`);
  }
  if (!Object.values(PermissionAction).includes(action)) {
    throw new RBACPermissionError(`Invalid action: ${action}`);
  }

  return permissions.some(p => 
    p.resource === resource && 
    (p.action === action || p.action === PermissionAction.MANAGE)
  );
}

export function hasAllPermissions(
  permissions: Permission[],
  requiredPermissions: Array<{ resource: ResourceType; action: PermissionAction }>
): boolean {
  return requiredPermissions.every(({ resource, action }) =>
    hasPermission(permissions, resource, action)
  );
}

export function hasAnyPermission(
  permissions: Permission[],
  requiredPermissions: Array<{ resource: ResourceType; action: PermissionAction }>
): boolean {
  return requiredPermissions.some(({ resource, action }) =>
    hasPermission(permissions, resource, action)
  );
}

/**
 * Permission sets for different roles
 */
export const USER_PERMISSIONS: Permission[] = [
  { resource: ResourceType.USER, action: PermissionAction.READ },
  { resource: ResourceType.PRODUCT, action: PermissionAction.READ },
  { resource: ResourceType.CATEGORY, action: PermissionAction.READ }
];

export const STUDENT_PERMISSIONS: Permission[] = [
  ...USER_PERMISSIONS,
  { resource: ResourceType.COURSE, action: PermissionAction.READ },
  { resource: ResourceType.ARTICLE, action: PermissionAction.READ }
];

export const MENTOR_PERMISSIONS: Permission[] = [
  ...STUDENT_PERMISSIONS,
  { resource: ResourceType.COURSE, action: PermissionAction.CREATE },
  { resource: ResourceType.COURSE, action: PermissionAction.UPDATE },
  { resource: ResourceType.COURSE, action: PermissionAction.DELETE }
];

export const WRITER_PERMISSIONS: Permission[] = [
  ...USER_PERMISSIONS,
  { resource: ResourceType.ARTICLE, action: PermissionAction.CREATE },
  { resource: ResourceType.ARTICLE, action: PermissionAction.UPDATE },
  { resource: ResourceType.ARTICLE, action: PermissionAction.DELETE }
];

export const SELLER_PERMISSIONS: Permission[] = [
  ...USER_PERMISSIONS,
  { resource: ResourceType.PRODUCT, action: PermissionAction.CREATE },
  { resource: ResourceType.PRODUCT, action: PermissionAction.UPDATE },
  { resource: ResourceType.PRODUCT, action: PermissionAction.DELETE }
];

export const ADMIN_PERMISSIONS: Permission[] = Object.values(ResourceType).map(
  resource => ({ resource, action: PermissionAction.MANAGE })
); 