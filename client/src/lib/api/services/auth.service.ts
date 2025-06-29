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
import { setCookie, deleteCookie } from "@/lib/utils/cookie";

class AuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    console.log("[AuthService] Making login request");
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    console.log("[AuthService] Login response:", {
      status: response.status,
      hasData: !!response.data,
      hasAccessToken: !!response.data?.accessToken
    });

    if (response.status === "success" && response.data?.accessToken) {
      setCookie("accessToken", response.data.accessToken);
    }

    return response;
  }

  async register(
    data: RegisterRequest
  ): Promise<ApiResponse<RegisterResponse>> {
    console.log("[AuthService] Making register request");
    return api.post("/auth/register", data);
  }

  async logout(): Promise<ApiResponse<void>> {
    console.log("[AuthService] Making logout request");
    deleteCookie("accessToken");
    return api.post("/auth/logout");
  }

  async validateToken(): Promise<ApiResponse<ValidateTokenResponse>> {
    console.log("[AuthService] Validating token");
    return api.get("/auth/validate");
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    console.log("[AuthService] Making forgot password request");
    return api.post("/auth/forgot-password", { email });
  }

  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<ApiResponse<void>> {
    console.log("[AuthService] Making reset password request");
    return api.post("/auth/reset-password", {
      token,
      password,
      confirmPassword,
    });
  }

  async applyForRole(
    application: RoleApplicationRequest
  ): Promise<ApiResponse<void>> {
    console.log("[AuthService] Making role application request");
    return api.post("/auth/role-application", application);
  }

  async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    console.log("[AuthService] Making refresh token request");
    return api.post("/auth/refresh-token");
  }
}

export const authService = new AuthService();
