/**
 * Client-side RBAC type system
 */

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  PENDING_VERIFICATION = 'pending_verification'
}

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
    filters?: Record<string, unknown>;
  };
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  inherits?: UserRole[];
  autoUpgradeFrom?: {
    role: UserRole;
    conditions: {
      resources: ResourceType[];
      requiredActions: PermissionAction[];
    };
  };
}

// Type guard to check if a role is valid
export function isValidRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

// Type guard for permission action
export function isValidAction(action: string): action is PermissionAction {
  return Object.values(PermissionAction).includes(action as PermissionAction);
}

// Type guard for resource type
export function isValidResource(resource: string): resource is ResourceType {
  return Object.values(ResourceType).includes(resource as ResourceType);
}

// Core RBAC interfaces
export interface User {
  id: string;
  roles: UserRole[];
  permissions?: Permission[];
} 