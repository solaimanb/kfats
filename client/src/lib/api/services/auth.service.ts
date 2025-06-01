import api from "../config/axios";
import { ApiResponse } from "@/types/api/common";
import { RegisterRequest, LoginRequest } from "@/types/api/requests";
import { IUser } from "@/types/auth/roles";

export interface AuthResponse {
  user: IUser;
  token: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return api.post("/auth/login", credentials);
  }

  async register(
    userData: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> {
    return api.post("/auth/register", userData);
  }

  async logout(): Promise<ApiResponse<void>> {
    localStorage.removeItem("token");
    return api.post("/auth/logout");
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return api.post("/auth/forgot-password", { email });
  }

  async resetPassword(
    token: string,
    password: string,
    passwordConfirm: string
  ): Promise<ApiResponse<void>> {
    return api.post(`/auth/reset-password/${token}`, {
      password,
      passwordConfirm,
    });
  }

  async validateToken(token: string): Promise<ApiResponse<AuthResponse>> {
    return api.get("/auth/validate", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return api.post("/auth/refresh-token");
  }

  getStoredToken(): string | null {
    return localStorage.getItem("token");
  }

  setToken(token: string): void {
    localStorage.setItem("token", token);
  }

  removeToken(): void {
    localStorage.removeItem("token");
  }
}

export const authService = new AuthService();
