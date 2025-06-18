import { UserRole, Permission } from '../../config/rbac/types';

export interface AuthResponse {
  user: {
    id: string;
    roles: UserRole[];
    permissions: Permission[];
  };
  token: string;
  rbacVersion: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  permissions: Permission[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
} 