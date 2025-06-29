/**
 * Auth-related domain types
 */

import type { User } from "./types";
import type {
  ResourceType,
  PermissionAction,
} from "../permission/types";
import type { UserRole } from "../role/types";
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "../../api/auth/requests";
import type { RoleApplicationRequest } from "../../api/role/requests";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<void>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  applyForRole: (data: RoleApplicationRequest) => Promise<void>;
  hasPermission: (resource: ResourceType, action: PermissionAction) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllRoles: (roles: UserRole[]) => boolean;
  isActive: () => boolean;
  isEmailVerified: () => boolean;
  clearError: () => void;
}
