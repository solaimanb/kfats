import { Request } from "express";
import { IUser } from "../models/user.model";
import { UserRole, Permission } from "../config/rbac/types";

// =================== Core Auth Types ===================
export type AuthUser = IUser; // Base authenticated user type

export interface AuthenticatedRequest extends Request {
  user: AuthUser | undefined;
  token: string | undefined;
}

// =================== JWT Types ===================
export interface JWTPayload {
  id: string;
  roles: UserRole[]; // Use proper UserRole type
  email: string;
  iat?: number;
  exp?: number;
}

// =================== API Types ===================
export interface AuthResponse {
  user: {
    id: string;
    roles: UserRole[];
    permissions: Permission[];
  };
  token: string;
  rbacVersion: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
}

// =================== Rate Limiting ===================
export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

export interface RateLimitRequest extends Request {
  rateLimit?: {
    remaining: number;
    limit: number;
    reset: Date;
  };
}
