import { apiClient } from "./client";
import { PaginatedResponse, ApiResponse } from "@/lib/types/api";

export interface RoleApplicationCreate {
  requested_role: "MENTOR" | "SELLER" | "WRITER";
  reason: string;
  application_data?: Record<string, unknown>;
}

export interface RoleApplicationUpdate {
  status: "APPROVED" | "REJECTED";
  admin_notes?: string;
}

export interface RoleApplication {
  id: number;
  user_id: number;
  requested_role: string;
  reason: string;
  application_data?: Record<string, unknown>;
  status: "PENDING" | "APPROVED" | "REJECTED";
  applied_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
  admin_notes?: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
  };
  reviewed_by_user?: {
    id: number;
    full_name: string;
    email: string;
  };
}

export interface RoleApplicationStats {
  total_applications: number;
  pending_applications: number;
  approved_applications: number;
  rejected_applications: number;
  by_role: Record<string, number>;
  by_status: Record<string, number>;
}

export class RoleApplicationsAPI {
  /**
   * Apply for a role (MENTOR, SELLER, WRITER)
   */
  static async applyForRole(
    applicationData: RoleApplicationCreate
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(
      "/role-applications/apply",
      applicationData
    );
    return response.data;
  }

  /**
   * Get current user's role applications
   */
  static async getMyApplications(
    filters: {
      page?: number;
      size?: number;
    } = {}
  ): Promise<PaginatedResponse<RoleApplication>> {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.size) params.append("size", filters.size.toString());

    const response = await apiClient.get<PaginatedResponse<RoleApplication>>(
      `/role-applications/my-applications?${params}`
    );
    return response.data;
  }

  /**
   * Get all role applications (Admin only)
   */
  static async getAllApplications(
    filters: {
      status?: "PENDING" | "APPROVED" | "REJECTED";
      role?: "MENTOR" | "SELLER" | "WRITER";
      page?: number;
      size?: number;
    } = {}
  ): Promise<PaginatedResponse<RoleApplication>> {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.role) params.append("role", filters.role);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.size) params.append("size", filters.size.toString());

    const response = await apiClient.get<PaginatedResponse<RoleApplication>>(
      `/role-applications/?${params}`
    );
    return response.data;
  }

  /**
   * Review a role application (Admin only)
   */
  static async reviewApplication(
    applicationId: number,
    reviewData: RoleApplicationUpdate
  ): Promise<ApiResponse> {
    const response = await apiClient.put<ApiResponse>(
      `/role-applications/${applicationId}/review`,
      reviewData
    );
    return response.data;
  }

  /**
   * Get role application statistics (Admin only)
   */
  static async getApplicationStats(): Promise<RoleApplicationStats> {
    const response = await apiClient.get<RoleApplicationStats>(
      "/role-applications/stats"
    );
    return response.data;
  }

  /**
   * Withdraw a pending role application
   */
  static async withdrawApplication(
    applicationId: number
  ): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `/role-applications/${applicationId}`
    );
    return response.data;
  }
}
