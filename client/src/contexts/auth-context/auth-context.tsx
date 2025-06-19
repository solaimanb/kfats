"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AuthContextType, AuthState } from "@/types";
import {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/types/api/auth/requests";
import { RoleApplicationRequest } from "@/types";
import { UserRole } from "@/types";
import { UserStatus } from "@/types";
import { ResourceType, PermissionAction } from "@/types";

import { DEFAULT_REDIRECTS } from "@/config/routes";
import { roleHasPermission } from "@/config/rbac/roles";
import {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
} from "@/lib/utils/token";
import { authService } from "@/lib/api/services";

// Storage utilities
const Storage = {
  USER_KEY: "auth_user_cache",

  getUser: () => {
    try {
      const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(Storage.USER_KEY + '='));
      if (!userCookie) return null;
      const value = decodeURIComponent(userCookie.split('=')[1]);
      return JSON.parse(value);
    } catch {
      return null;
    }
  },

  setUser: (user: AuthState["user"]) => {
    try {
      const value = encodeURIComponent(JSON.stringify(user));
      document.cookie = `${Storage.USER_KEY}=${value}; path=/; secure; samesite=lax; max-age=3600`;
    } catch {
      // Ignore storage errors
    }
  },

  clearUser: () => {
    try {
      document.cookie = `${Storage.USER_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    } catch {
      // Ignore storage errors
    }
  },
};

// Role and permission utilities
const RoleUtils = {
  getRedirectPath: (roles: UserRole[]): string => {
    const priorityOrder = [
      UserRole.ADMIN,
      UserRole.MENTOR,
      UserRole.WRITER,
      UserRole.SELLER,
      UserRole.STUDENT,
      UserRole.USER,
    ];

    const highestRole = priorityOrder.find((role) => roles.includes(role));
    return DEFAULT_REDIRECTS[highestRole || UserRole.USER];
  },

  checkPermission: (
    user: AuthState["user"],
    resource: ResourceType,
    action: PermissionAction
  ): boolean => {
    if (!user) return false;
    return user.roles.some((role) =>
      roleHasPermission(role, resource, action)
    );
  },

  checkRole: (user: AuthState["user"], role: UserRole): boolean =>
    user?.roles?.includes(role) || false,

  checkAnyRole: (user: AuthState["user"], roles: UserRole[]): boolean =>
    user?.roles?.some((r) => roles.includes(r)) || false,

  checkAllRoles: (user: AuthState["user"], roles: UserRole[]): boolean =>
    user?.roles?.every((r) => roles.includes(r)) || false,
};

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: true,
  error: null,
};

// Context creation
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const router = useRouter();

  // Initialize auth state from storage
  useEffect(() => {
    const user = Storage.getUser();
    const accessToken = getAccessToken();

    setState({
      user,
      accessToken,
      isLoading: false,
      error: null,
    });
  }, []);

  // Error handling utility
  const handleError = (error: unknown, defaultMessage: string) => {
    const errorMessage =
      error instanceof Error ? error.message : defaultMessage;
    setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
    toast.error(errorMessage);
  };

  // State management utilities
  const startLoading = () =>
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
  const stopLoading = () => setState((prev) => ({ ...prev, isLoading: false }));
  const clearError = () => setState((prev) => ({ ...prev, error: null }));

  // Auth state management
  const updateAuthState = (user: AuthState["user"], accessToken: string) => {
    setAccessToken(accessToken);
    Storage.setUser(user);

    setState({
      user,
      accessToken,
      isLoading: false,
      error: null,
    });
  };

  const clearAuthState = useCallback(() => {
    removeAccessToken();
    Storage.clearUser();
    setState(initialState);
  }, []);

  // Auth handlers
  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors
    } finally {
      clearAuthState();
      router.push("/login");
    }
  }, [router, clearAuthState]);

  const handleLogin = async (credentials: LoginRequest) => {
    try {
      startLoading();
      const response = await authService.login(credentials);

      if (!response.data?.accessToken || !response.data?.user) {
        throw new Error("Invalid response from server");
      }

      const user = {
        ...response.data.user,
        roles: response.data.user.roles as UserRole[]
      };

      updateAuthState(user, response.data.accessToken);
      
      const redirectPath = RoleUtils.getRedirectPath(user.roles);
      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      handleError(error, "Login failed");
    }
  };

  const handleRegister = async (data: RegisterRequest) => {
    try {
      startLoading();
      const response = await authService.register(data);

      if (!response.data?.accessToken || !response.data?.user) {
        throw new Error("Invalid response from server");
      }

      const user = {
        ...response.data.user,
        roles: response.data.user.roles as UserRole[]
      };

      updateAuthState(user, response.data.accessToken);
      router.push(RoleUtils.getRedirectPath(user.roles));
      router.refresh();
    } catch (error) {
      handleError(error, "Registration failed");
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordRequest) => {
    try {
      startLoading();
      await authService.forgotPassword(data.email);
      stopLoading();
      toast.success("Password reset instructions sent to your email");
    } catch (error) {
      handleError(error, "Password reset request failed");
    }
  };

  const handleResetPassword = async (data: ResetPasswordRequest) => {
    try {
      startLoading();
      await authService.resetPassword(
        data.token,
        data.password,
        data.confirmPassword
      );
      stopLoading();
      toast.success("Password reset successful");
      router.push("/login");
    } catch (error) {
      handleError(error, "Password reset failed");
    }
  };

  const handleRoleApplication = async (data: RoleApplicationRequest) => {
    try {
      startLoading();
      await authService.applyForRole(data);
      stopLoading();
      toast.success("Role application submitted successfully");
    } catch (error) {
      handleError(error, "Role application failed");
    }
  };

  // Context value
  const value: AuthContextType = {
    ...state,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    applyForRole: handleRoleApplication,
    hasPermission: (resource, action) =>
      RoleUtils.checkPermission(state.user, resource, action),
    hasRole: (role) => RoleUtils.checkRole(state.user, role),
    hasAnyRole: (roles) => RoleUtils.checkAnyRole(state.user, roles),
    hasAllRoles: (roles) => RoleUtils.checkAllRoles(state.user, roles),
    isActive: () => state.user?.status === UserStatus.ACTIVE,
    isEmailVerified: () => state.user?.emailVerified || false,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
