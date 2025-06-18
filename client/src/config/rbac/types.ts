/**
 * Core RBAC types
 * @version 1.0.0
 */

export enum UserRole {
  ADMIN = "admin",
  MENTOR = "mentor",
  STUDENT = "student",
  WRITER = "writer",
  SELLER = "seller",
  USER = "user",
}

export enum ResourceType {
  USER = "user",
  COURSE = "course",
  ARTICLE = "article",
  PRODUCT = "product",
  CATEGORY = "category",
  ROLE = "role",
}

export enum PermissionAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  MANAGE = "manage",
}

export interface Permission {
  resource: ResourceType;
  action: PermissionAction;
  conditions?: Record<string, unknown>;
}

export interface RoleConfig {
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

export interface RBACContextType {
  checkPermission: (
    resource: ResourceType,
    action: PermissionAction
  ) => boolean;
  checkAnyPermission: (permissions: Permission[]) => boolean;
  checkAllPermissions: (permissions: Permission[]) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllRoles: (roles: UserRole[]) => boolean;
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

// Version control - must match server version
export const RBAC_VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  toString() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
};
