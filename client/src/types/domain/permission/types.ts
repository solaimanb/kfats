/**
 * Permission-related domain types
 */

export enum PermissionAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  MANAGE = "manage",
}

export enum ResourceType {
  COURSE = "course",
  USER = "user",
  CATEGORY = "category",
  ROLE = "role",
  PRODUCT = "product",
  ARTICLE = "article",
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: ResourceType;
  action: PermissionAction;
  attributes?: string[];
  conditions?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
} 