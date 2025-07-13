"use client";

import React, { createContext, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AuthContextType,
  AuthState,
  UserRole,
  UserStatus,
  ResourceType,
  PermissionAction
} from "@/types";
import {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from "@/types/api/auth/requests";
import { RoleApplicationRequest } from "@/types/api/role/requests";
import { ApiResponse, SuccessResponse } from "@/types/api/common/types";
import { User } from "@/types/domain/user/types";

import { DEFAULT_REDIRECTS } from "@/config/routes";
import { roleHasPermission } from "@/config/rbac/roles";
import { authService } from "@/lib/api/services";
import { AuthStorage, AuthError, NetworkError } from "@/lib/auth/utils";

// Role utilities
const RoleUtils = {
  getRedirectPath: (roles: UserRole[]): string => {
    if (!roles || roles.length === 0) return DEFAULT_REDIRECTS.user;
    const primaryRole = roles[0];
    return DEFAULT_REDIRECTS[primaryRole] || DEFAULT_REDIRECTS.user;
  },

  checkRole: (user: User | null, role: UserRole): boolean => {
    return user?.roles?.includes(role) || false;
  },

  checkAnyRole: (user: User | null, roles: UserRole[]): boolean => {
    return user?.roles?.some(role => roles.includes(role)) || false;
  },

  checkAllRoles: (user: User | null, roles: UserRole[]): boolean => {
    return user?.roles?.every(role => roles.includes(role)) || false;
  },

  checkPermission: (
    user: User | null,
    resource: ResourceType,
    action: PermissionAction
  ): boolean => {
    if (!user?.roles) return false;
    return user.roles.some(role => roleHasPermission(role, resource, action));
  },
};

function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
  return response.status === 'success';
}

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
};

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    ...initialState,
    user: AuthStorage.getUser(),
  }));
  const router = useRouter();

  // Error handling utility
  const handleError = (error: unknown, defaultMessage: string) => {
    let errorMessage = defaultMessage;

    if (error instanceof AuthError) {
      errorMessage = error.message;
    } else if (error instanceof NetworkError) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
    throw error;
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = AuthStorage.getUser();
        if (!storedUser) {
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const response = await authService.validateSession();
        if (!isSuccessResponse(response)) {
          throw new AuthError('Session validation failed');
        }

        AuthStorage.setUser(response.data.user);
        setState({
          user: response.data.user,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        AuthStorage.clearAuth();
        setState(initialState);
      }
    };

    initializeAuth();
  }, []);

  // Auth handlers
  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      AuthStorage.clearAuth();
      setState(initialState);
      router.push("/login");
    }
  }, [router]);

  const handleLogin = async (credentials: LoginRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await authService.login(credentials);
      if (!isSuccessResponse(response)) {
        throw new AuthError(response.message || 'Login failed');
      }

      setState({
        user: response.data.user,
        isLoading: false,
        error: null,
      });

      const redirectPath = RoleUtils.getRedirectPath(response.data.user.roles);
      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      handleError(error, 'Login failed');
    }
  };

  const handleRegister = async (data: RegisterRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await authService.register(data);
      if (!isSuccessResponse(response)) {
        throw new AuthError(response.message || 'Registration failed');
      }

      setState({
        user: response.data.user,
        isLoading: false,
        error: null,
      });

      toast.success('Registration successful!');
      const redirectPath = RoleUtils.getRedirectPath(response.data.user.roles);
      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      handleError(error, 'Registration failed');
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.forgotPassword(data.email);
      setState(prev => ({ ...prev, isLoading: false }));
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      handleError(error, 'Failed to process forgot password request');
    }
  };

  const handleResetPassword = async (data: ResetPasswordRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.resetPassword(data.token, data.password, data.confirmPassword);
      setState(prev => ({ ...prev, isLoading: false }));
      toast.success('Password reset successful');
      router.push('/login');
    } catch (error) {
      handleError(error, 'Password reset failed');
    }
  };

  const handleRoleApplication = async (data: RoleApplicationRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.applyForRole(data);
      setState(prev => ({ ...prev, isLoading: false }));
      toast.success('Role application submitted successfully');
    } catch (error) {
      handleError(error, 'Role application failed');
    }
  };

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
    clearError: () => setState(prev => ({ ...prev, error: null })),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
