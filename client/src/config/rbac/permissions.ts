import { ResourceType, PermissionAction, Permission } from './types';

// Define available resources
export const RESOURCES = {
  USER: 'user',
  COURSE: 'course',
  ARTICLE: 'article',
  PRODUCT: 'product',
  CATEGORY: 'category',
  ROLE: 'role'
} as const;

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
export const BASE_PERMISSIONS: Permission[] = [
  { resource: RESOURCES.USER, action: PermissionAction.READ },
  { resource: RESOURCES.PRODUCT, action: PermissionAction.READ },
  { resource: RESOURCES.CATEGORY, action: PermissionAction.READ }
];

/**
 * Check if a permission exists in an array of permissions
 */
export function hasPermission(
  permissions: Permission[],
  resource: ResourceType,
  action: PermissionAction
): boolean {
  return permissions.some(p => 
    p.resource === resource && 
    (p.action === action || p.action === PermissionAction.MANAGE)
  );
}

/**
 * Check if all permissions exist in an array of permissions
 */
export function hasAllPermissions(
  permissions: Permission[],
  requiredPermissions: Array<{ resource: ResourceType; action: PermissionAction }>
): boolean {
  return requiredPermissions.every(({ resource, action }) =>
    hasPermission(permissions, resource, action)
  );
}

/**
 * Check if any of the permissions exist in an array of permissions
 */
export function hasAnyPermission(
  permissions: Permission[],
  requiredPermissions: Array<{ resource: ResourceType; action: PermissionAction }>
): boolean {
  return requiredPermissions.some(({ resource, action }) =>
    hasPermission(permissions, resource, action)
  );
}

// Define base permissions
export const BASE_PERMISSIONS_NEW: Permission[] = [
  { resource: RESOURCES.USER, action: PermissionAction.READ },
  { resource: RESOURCES.PRODUCT, action: PermissionAction.READ },
  { resource: RESOURCES.CATEGORY, action: PermissionAction.READ }
];

// Define content management permissions
export const CONTENT_PERMISSIONS: Permission[] = [
  { resource: RESOURCES.ARTICLE, action: PermissionAction.CREATE },
  { resource: RESOURCES.ARTICLE, action: PermissionAction.READ },
  { resource: RESOURCES.ARTICLE, action: PermissionAction.UPDATE },
  { resource: RESOURCES.ARTICLE, action: PermissionAction.DELETE }
];

// Define course management permissions
export const COURSE_PERMISSIONS: Permission[] = [
  { resource: RESOURCES.COURSE, action: PermissionAction.CREATE },
  { resource: RESOURCES.COURSE, action: PermissionAction.READ },
  { resource: RESOURCES.COURSE, action: PermissionAction.UPDATE },
  { resource: RESOURCES.COURSE, action: PermissionAction.DELETE }
];

// Define product management permissions
export const PRODUCT_PERMISSIONS: Permission[] = [
  { resource: RESOURCES.PRODUCT, action: PermissionAction.CREATE },
  { resource: RESOURCES.PRODUCT, action: PermissionAction.READ },
  { resource: RESOURCES.PRODUCT, action: PermissionAction.UPDATE },
  { resource: RESOURCES.PRODUCT, action: PermissionAction.DELETE }
];

// Define admin permissions
export const ADMIN_PERMISSIONS: Permission[] = [
  { resource: RESOURCES.USER, action: PermissionAction.MANAGE },
  { resource: RESOURCES.COURSE, action: PermissionAction.MANAGE },
  { resource: RESOURCES.ARTICLE, action: PermissionAction.MANAGE },
  { resource: RESOURCES.PRODUCT, action: PermissionAction.MANAGE },
  { resource: RESOURCES.CATEGORY, action: PermissionAction.MANAGE },
  { resource: RESOURCES.ROLE, action: PermissionAction.MANAGE }
]; 