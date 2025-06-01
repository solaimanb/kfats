import api from "../config/axios";
import { ApiResponse } from "@/types/api/common";
import { IUser, UserRole } from "@/types/auth/roles";

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: "light" | "dark";
}

export interface RoleSpecificData {
  [key: string]: string | number | boolean | object;
}

class UserService {
  // Profile Management
  async getProfile(): Promise<ApiResponse<IUser>> {
    return api.get("/users/profile");
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<IUser>> {
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
    preferences: Partial<UserPreferences>
  ): Promise<ApiResponse<UserPreferences>> {
    return api.patch("/users/preferences", preferences);
  }

  async getPreferences(): Promise<ApiResponse<UserPreferences>> {
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
