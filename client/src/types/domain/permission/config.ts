/**
 * Permission configuration types
 */

import type { ResourceType, PermissionAction } from "./types";
import type { UserRole } from "../role/types";

export type ResourcePermissions = {
  [K in ResourceType]?: PermissionAction[];
};

export type RoleConfig = {
  routes: string[];
  resources: ResourcePermissions;
};

export type RolePermissions = {
  [K in UserRole]: RoleConfig;
};
