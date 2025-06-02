import { api } from "../api-client";
import type { ApiResponse } from "@/types";
import type { User, UserRole } from "@/types";
import type {
  UserPreferencesResponse,
  RoleApplicationData,
} from "@/types";

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
}

class UserService {
  // Profile Management
  async getProfile(): Promise<ApiResponse<User>> {
    return api.get("/users/profile");
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    return api.patch("/users/profile", data);
  }

  async updatePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    return api.patch("/users/password", {
      currentPassword,
      newPassword,
    });
  }

  // Preferences
  async updatePreferences(
    preferences: Partial<UserPreferencesResponse>
  ): Promise<ApiResponse<UserPreferencesResponse>> {
    return api.patch("/users/preferences", preferences);
  }

  async getPreferences(): Promise<ApiResponse<UserPreferencesResponse>> {
    return api.get("/users/preferences");
  }

  // Role-specific data
  async getRoleSpecificData(
    role: UserRole
  ): Promise<ApiResponse<RoleApplicationData>> {
    return api.get(`/users/role-data/${role}`);
  }

  async updateRoleSpecificData(
    role: UserRole,
    data: RoleApplicationData
  ): Promise<ApiResponse<RoleApplicationData>> {
    return api.patch(`/users/role-data/${role}`, data);
  }

  // Email verification
  async sendVerificationEmail(): Promise<ApiResponse<void>> {
    return api.post("/users/send-verification");
  }

  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return api.post(`/users/verify-email/${token}`);
  }
}

export const userService = new UserService();
