import type { ApiResponse } from "@/types";
import type { LoginRequest, RegisterRequest } from "@/types";
import type {
  LoginResponse,
  RegisterResponse,
  ValidateTokenResponse,
  RefreshTokenResponse,
} from "@/types";
import type { RoleApplicationRequest } from "@/types";
import { api } from "../api-client";

class AuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return api.post("/auth/login", credentials);
  }

  async register(
    data: RegisterRequest
  ): Promise<ApiResponse<RegisterResponse>> {
    return api.post("/auth/register", data);
  }

  async logout(): Promise<ApiResponse<void>> {
    return api.post("/auth/logout");
  }

  async validateToken(): Promise<ApiResponse<ValidateTokenResponse>> {
    return api.get("/auth/validate");
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return api.post("/auth/forgot-password", { email });
  }

  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<ApiResponse<void>> {
    return api.post("/auth/reset-password", {
      token,
      password,
      confirmPassword,
    });
  }

  async applyForRole(
    application: RoleApplicationRequest
  ): Promise<ApiResponse<void>> {
    return api.post("/auth/role-application", application);
  }

  async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    return api.post("/auth/refresh-token");
  }
}

export const authService = new AuthService();
