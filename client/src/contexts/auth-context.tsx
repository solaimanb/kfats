"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { IUser, UserRole, UserStatus } from "@/types/auth/roles";
import { authService } from "@/lib/services/auth.service";
import { RegisterRequest } from "@/types/api/requests";
import { ApiResponse } from "@/types/api/common";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthResponse {
  user: IUser;
  token: string;
}

interface AuthError extends Error {
  message: string;
  code?: string;
  status?: number;
}

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllRoles: (roles: UserRole[]) => boolean;
  isActive: () => boolean;
  isEmailVerified: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await authService.validateToken(token);
      if (response.success && response.data) {
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
      } else {
        localStorage.removeItem("token");
      }
    } catch (err) {
      localStorage.removeItem("token");
      console.error("Token validation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response: ApiResponse<AuthResponse> = await authService.login({
        email,
        password,
      });
      if (response.success && response.data) {
        const { user, token } = response.data;
        localStorage.setItem("token", token);
        setUser(user);
        router.push("/dashboard");
        toast.success("Login successful!");
      } else {
        toast.error(response.error?.message || "Login failed");
      }
    } catch (err) {
      const apiError = err as AuthError;
      setError(apiError.message || "An error occurred during login");
      toast.error(apiError.message || "An error occurred during login");
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setError(null);
      const response: ApiResponse<AuthResponse> = await authService.register(
        userData
      );
      if (response.success && response.data) {
        const { user, token } = response.data;
        localStorage.setItem("token", token);
        setUser(user);
        router.push("/dashboard");
        toast.success("Registration successful!");
      } else {
        toast.error(response.error?.message || "Registration failed");
      }
    } catch (err) {
      const apiError = err as AuthError;
      setError(apiError.message || "An error occurred during registration");
      toast.error(apiError.message || "An error occurred during registration");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    router.push("/login");
    toast.success("Logged out successfully");
  };

  // Role checking methods
  const hasRole = (role: UserRole): boolean => {
    return user?.roles.includes(role) || false;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user?.roles.some((role) => roles.includes(role)) || false;
  };

  const hasAllRoles = (roles: UserRole[]): boolean => {
    return roles.every((role) => user?.roles.includes(role)) || false;
  };

  // Status checking methods
  const isActive = (): boolean => {
    return user?.status === UserStatus.ACTIVE;
  };

  const isEmailVerified = (): boolean => {
    return user?.emailVerified || false;
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isActive,
    isEmailVerified,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
