import { User } from '../domain/user/types';

export interface AuthResponse {
  user: User;
  token: string;
  rbacVersion: string;
}

// Simplified user type for auth context
export type AuthUser = User;

// Re-export request types
export type { 
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest 
} from './auth/requests'; 