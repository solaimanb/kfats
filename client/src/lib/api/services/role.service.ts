import { api } from "../api-client";
import type { ApiResponse } from "@/types";
import type { IRole, UserRole } from "@/types/domain/role/types";

export interface RoleFilters {
  name?: string;
  level?: number;
  parent?: string;
}

class RoleService {
  // Role Management
  async getAllRoles(filters?: RoleFilters): Promise<ApiResponse<IRole[]>> {
    return api.get("/roles", { params: filters });
  }

  async getRole(id: string): Promise<ApiResponse<IRole>> {
    return api.get(`/roles/${id}`);
  }

  async createRole(role: Partial<IRole>): Promise<ApiResponse<IRole>> {
    return api.post("/roles", role);
  }

  async updateRole(id: string, role: Partial<IRole>): Promise<ApiResponse<IRole>> {
    return api.patch(`/roles/${id}`, role);
  }

  async deleteRole(id: string): Promise<ApiResponse<void>> {
    return api.delete(`/roles/${id}`);
  }

  // Role Hierarchy
  async getRoleHierarchy(): Promise<ApiResponse<IRole[]>> {
    return api.get("/roles/hierarchy");
  }

  async updateRoleHierarchy(roleId: string, parentId: string | null): Promise<ApiResponse<IRole>> {
    return api.patch(`/roles/${roleId}/parent`, { parentId });
  }

  // User Role Management
  async assignRoleToUser(userId: string, roleId: string): Promise<ApiResponse<void>> {
    return api.post(`/users/${userId}/roles/${roleId}`);
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<ApiResponse<void>> {
    return api.delete(`/users/${userId}/roles/${roleId}`);
  }

  async getUserRoles(userId: string): Promise<ApiResponse<UserRole[]>> {
    return api.get(`/users/${userId}/roles`);
  }
}

export const roleService = new RoleService();
