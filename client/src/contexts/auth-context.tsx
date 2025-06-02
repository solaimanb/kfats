"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
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

import { ROLE_PERMISSIONS } from "@/config/rbac.config";
import { DEFAULT_REDIRECTS } from "@/config/routes";
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
      const cached = localStorage.getItem(Storage.USER_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: AuthState["user"]) => {
    try {
      localStorage.setItem(Storage.USER_KEY, JSON.stringify(user));
    } catch {
      // Ignore storage errors
    }
  },

  clearUser: () => {
    try {
      localStorage.removeItem(Storage.USER_KEY);
    } catch {
      // Ignore storage errors
    }
  },
};

// Role and permission utilities
const RoleUtils = {
  getRedirectPath: (roles: string[]): string => {
    const userRoles = roles.map((role) => role as UserRole);
    const priorityOrder = [
      UserRole.ADMIN,
      UserRole.MENTOR,
      UserRole.WRITER,
      UserRole.SELLER,
      UserRole.STUDENT,
      UserRole.USER,
    ];

    const highestRole = priorityOrder.find((role) => userRoles.includes(role));
    return DEFAULT_REDIRECTS[highestRole || UserRole.USER];
  },

  checkPermission: (
    user: AuthState["user"],
    resource: ResourceType,
    action: PermissionAction
  ): boolean => {
    if (!user) return false;
    return user.roles.some((role) => {
      const perms = ROLE_PERMISSIONS[role as UserRole]?.resources[resource];
      return (
        perms?.includes(action) || perms?.includes(PermissionAction.MANAGE)
      );
    });
  },

  checkRole: (user: AuthState["user"], role: UserRole): boolean =>
    user?.roles.includes(role as string) || false,

  checkAnyRole: (user: AuthState["user"], roles: UserRole[]): boolean =>
    user?.roles.some((r) => roles.includes(r as UserRole)) || false,

  checkAllRoles: (user: AuthState["user"], roles: UserRole[]): boolean =>
    user?.roles.every((r) => roles.includes(r as UserRole)) || false,
};

// Initial state
const initialState: AuthState = {
  user: Storage.getUser(),
  accessToken: getAccessToken(),
  isLoading: false,
  error: null,
};

// Context creation
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const router = useRouter();

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
    } catch (error) {
      console.error("Logout error:", error);
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

      updateAuthState(response.data.user, response.data.accessToken);
      router.push(RoleUtils.getRedirectPath(response.data.user.roles));
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

      updateAuthState(response.data.user, response.data.accessToken);
      router.push(RoleUtils.getRedirectPath(response.data.user.roles));
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
