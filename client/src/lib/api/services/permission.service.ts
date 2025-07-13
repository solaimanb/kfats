import { api } from "../api-client";
import type { ApiResponse } from "@/types";
import type { Permission } from "@/types";
import type { IRole } from "@/types/domain/role/types";

export interface PermissionFilters {
  role?: string;
  resource?: string;
  action?: string;
}

class PermissionService {
  // Permission Management
  async getAllPermissions(
    filters?: PermissionFilters
  ): Promise<ApiResponse<Permission[]>> {
    return api.get("/permissions", { params: filters });
  }

  async createPermission(
    permission: Partial<Permission>
  ): Promise<ApiResponse<Permission>> {
    return api.post("/permissions", permission);
  }

  async updatePermission(
    id: string,
    permission: Partial<Permission>
  ): Promise<ApiResponse<Permission>> {
    return api.patch(`/permissions/${id}`, permission);
  }

  async deletePermission(id: string): Promise<ApiResponse<void>> {
    return api.delete(`/permissions/${id}`);
  }

  // Role Permissions
  async getRolePermissions(roleId: string): Promise<ApiResponse<Permission[]>> {
    return api.get(`/roles/${roleId}/permissions`);
  }

  async assignPermissionToRole(
    roleId: string,
    permissionId: string
  ): Promise<ApiResponse<IRole>> {
    return api.post(`/roles/${roleId}/permissions/${permissionId}`);
  }

  async removePermissionFromRole(
    roleId: string,
    permissionId: string
  ): Promise<ApiResponse<IRole>> {
    return api.delete(`/roles/${roleId}/permissions/${permissionId}`);
  }

  // User Permissions
  async getUserPermissions(userId: string): Promise<ApiResponse<Permission[]>> {
    return api.get(`/users/${userId}/permissions`);
  }

  async checkPermission(
    resource: string,
    action: string
  ): Promise<ApiResponse<boolean>> {
    return api.get(`/permissions/check`, {
      params: { resource, action },
    });
  }

  // Bulk Operations
  async bulkAssignPermissions(
    roleId: string,
    permissionIds: string[]
  ): Promise<ApiResponse<IRole>> {
    return api.post(`/roles/${roleId}/permissions/bulk`, { permissionIds });
  }

  async bulkRemovePermissions(
    roleId: string,
    permissionIds: string[]
  ): Promise<ApiResponse<IRole>> {
    return api.delete(`/roles/${roleId}/permissions/bulk`, {
      data: { permissionIds },
    });
  }
}

export const permissionService = new PermissionService();
