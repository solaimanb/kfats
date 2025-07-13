import { api } from "../api-client";
import type { ApiResponse } from "@/types";
import type { RoleApplicationRequest } from "@/types/api/role/requests";
import type { ApplicationStatus } from "@/types/domain/role/types";
import type { RoleApplication } from "@/types/domain/role/application";

export interface RoleApplicationFilters {
  status?: ApplicationStatus;
  role?: string;
  page?: number;
  limit?: number;
}

export interface RoleStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byRole: Record<string, number>;
}

class RoleApplicationService {
  // Application Submission
  async submitApplication(
    data: RoleApplicationRequest
  ): Promise<ApiResponse<void>> {
    return api.post("/role-applications", data);
  }

  async updateApplication(
    id: string,
    data: Partial<RoleApplication>
  ): Promise<ApiResponse<RoleApplication>> {
    return api.patch(`/role-applications/${id}`, data);
  }

  async withdrawApplication(applicationId: string): Promise<ApiResponse<void>> {
    return api.post(`/role-applications/${applicationId}/withdraw`);
  }

  // Application Status
  async getUserApplications(): Promise<ApiResponse<RoleApplication[]>> {
    return api.get("/role-applications/my-applications");
  }

  async getApplicationStatus(
    id: string
  ): Promise<ApiResponse<RoleApplication>> {
    return api.get(`/role-applications/${id}`);
  }

  // Admin Management
  async getAllApplications(
    filters?: RoleApplicationFilters
  ): Promise<ApiResponse<RoleApplication[]>> {
    return api.get("/role-applications", { params: filters });
  }

  async updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<ApiResponse<RoleApplication>> {
    return api.patch(`/role-applications/${id}/status`, { status, notes });
  }

  // Verification Steps
  async updateVerificationStep(
    id: string,
    stepId: string,
    verified: boolean,
    notes?: string
  ): Promise<ApiResponse<RoleApplication>> {
    return api.patch(`/role-applications/${id}/verification/${stepId}`, {
      verified,
      notes,
    });
  }

  // Statistics
  async getRoleStatistics(): Promise<ApiResponse<RoleStatistics>> {
    return api.get("/role-applications/stats");
  }
}

export const roleApplicationService = new RoleApplicationService();
