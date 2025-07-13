import type { ApiResponse } from "@/types";
import type {
  LoginRequest,
  RegisterRequest,
} from "@/types/api/auth/requests";
import type {
  LoginResponse,
  RegisterResponse,
  ValidateTokenResponse,
  RefreshTokenResponse,
} from "@/types/api/auth/responses";
import type { RoleApplicationRequest } from "@/types/api/role/requests";
import type { ApiErrorResponse } from "@/types/api/common/types";
import { api } from "../api-client";
import { AuthError, NetworkError, AuthStorage } from "@/lib/auth/utils";

class AuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      console.log("[AuthService] Making login request");
      const response = await api.post<LoginResponse>("/auth/login", credentials);
      console.log("[AuthService] API Response:", response);

      if (response.status === 'success' && response.data?.user) {
        AuthStorage.setUser(response.data.user);
        return response;
      }

      throw new AuthError(response.message || 'Login failed');

    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      console.log("[AuthService] Error details:", {
        response: apiError.response?.data,
        status: apiError.response?.status,
        message: apiError.message,
        error: apiError
      });

      throw new AuthError(apiError.message || 'Login failed');
    }
  }

  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    try {
      console.log("[AuthService] Making register request");
      const response = await api.post<RegisterResponse>("/auth/register", data);
      console.log("[AuthService] API Response:", response);

      if (response.status === 'success' && response.data?.user) {
        AuthStorage.setUser(response.data.user);
        return response;
      }

      throw new AuthError(response.message || 'Registration failed');

    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      console.log("[AuthService] Error details:", {
        response: apiError.response?.data,
        status: apiError.response?.status,
        message: apiError.response?.data?.message || apiError.message,
        error: apiError
      });

      if (apiError.response?.data?.message) {
        throw new AuthError(apiError.response.data.message);
      }

      if (apiError.message) {
        throw new AuthError(apiError.message);
      }

      throw new AuthError('Registration failed. Please try again.');
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await api.post<void>("/auth/logout");
      AuthStorage.clearAuth();
      return response;
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      if (!apiError.response) {
        throw new NetworkError();
      }
      throw new AuthError(apiError.response?.data?.message || 'Logout failed');
    }
  }

  async validateSession(): Promise<ApiResponse<ValidateTokenResponse>> {
    try {
      return await api.get<ValidateTokenResponse>("/auth/validate");
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      if (!apiError.response) {
        throw new NetworkError();
      }
      throw new AuthError(apiError.response?.data?.message || 'Session validation failed');
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    try {
      return await api.post<void>("/auth/forgot-password", { email });
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      if (!apiError.response) {
        throw new NetworkError();
      }
      throw new AuthError(apiError.response?.data?.message || 'Failed to process forgot password request');
    }
  }

  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<ApiResponse<void>> {
    try {
      return await api.post<void>("/auth/reset-password", {
        token,
        password,
        confirmPassword,
      });
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      if (!apiError.response) {
        throw new NetworkError();
      }
      throw new AuthError(apiError.response?.data?.message || 'Password reset failed');
    }
  }

  async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    try {
      return await api.post<RefreshTokenResponse>("/auth/refresh-token");
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      if (!apiError.response) {
        throw new NetworkError();
      }
      throw new AuthError(apiError.response?.data?.message || 'Token refresh failed');
    }
  }

  async applyForRole(
    application: RoleApplicationRequest
  ): Promise<ApiResponse<void>> {
    try {
      return await api.post<void>("/auth/role-application", application);
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      if (!apiError.response) {
        throw new NetworkError();
      }
      throw new AuthError(apiError.response?.data?.message || 'Role application failed');
    }
  }

  async resendVerificationEmail(email: string): Promise<ApiResponse<void>> {
    try {
      return await api.post<void>("/auth/resend-verification", { email });
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      if (!apiError.response) {
        throw new NetworkError();
      }
      throw new AuthError(apiError.response?.data?.message || 'Failed to resend verification email');
    }
  }
}

export const authService = new AuthService();
