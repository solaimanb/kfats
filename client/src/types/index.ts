/**
 * Main types barrel file
 * Single source of truth for all type exports
 */

// API Types
export * from "./api/common/types";
export type { 
  AuthUser, 
  AuthResponse
} from "./api/auth";

// Auth Types
export type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from "./api/auth/requests";
export type {
  LoginResponse,
  RegisterResponse,
  ValidateTokenResponse,
  RefreshTokenResponse
} from "./api/auth/responses";
export type { RoleApplicationRequest } from "./api/role/requests";

// Domain Types
export * from "./domain/user/types";
export * from "./domain/user/auth";

// Component Types
export * from "./components/auth";
export * from "./components/common";
export * from "./components/features";

// RBAC Types
export * from "@/config/rbac/types";
