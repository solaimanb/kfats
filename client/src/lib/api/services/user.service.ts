import { api } from "../api-client";
import type { ApiResponse } from "@/types";
import type { User, RoleSpecificData } from "@/types/domain/user/types";
import type { UserRole } from "@/types/domain/role/types";

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface UpdatePreferencesRequest {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: "light" | "dark";
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
    preferences: Partial<User['preferences']>
  ): Promise<ApiResponse<User['preferences']>> {
    return api.patch("/users/preferences", preferences);
  }

  async getPreferences(): Promise<ApiResponse<User['preferences']>> {
    return api.get("/users/preferences");
  }

  // Role-specific data
  async getRoleSpecificData(
    role: UserRole
  ): Promise<ApiResponse<RoleSpecificData>> {
    return api.get(`/users/role-data/${role}`);
  }

  async updateRoleSpecificData(
    role: UserRole,
    data: RoleSpecificData
  ): Promise<ApiResponse<RoleSpecificData>> {
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
