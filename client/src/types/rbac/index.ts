/**
 * Client-side RBAC types that mirror server implementation
 */

export enum UserRole {
  ADMIN = 'admin',
  MENTOR = 'mentor',
  STUDENT = 'student',
  WRITER = 'writer',
  SELLER = 'seller',
  USER = 'user'
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage'
}

export enum ResourceType {
  USER = 'user',
  COURSE = 'course',
  ARTICLE = 'article',
  PRODUCT = 'product',
  CATEGORY = 'category',
  ROLE = 'role'
}

export interface Permission {
  resource: ResourceType;
  action: PermissionAction;
  conditions?: {
    fields?: string[];
    filters?: Record<string, any>;
  };
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  inherits?: UserRole[];
}

// Type guard functions
export function isValidRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

export function isValidAction(action: string): action is PermissionAction {
  return Object.values(PermissionAction).includes(action as PermissionAction);
}

export function isValidResource(resource: string): resource is ResourceType {
  return Object.values(ResourceType).includes(resource as ResourceType);
}

// Types for auth context
export interface AuthUser {
  id: string;
  roles: UserRole[];
  permissions: Permission[];
}

export interface RBACContextType {
  checkPermission: (resource: ResourceType, action: PermissionAction) => boolean;
  checkAnyPermission: (permissions: Permission[]) => boolean;
  checkAllPermissions: (permissions: Permission[]) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllRoles: (roles: UserRole[]) => boolean;
} 