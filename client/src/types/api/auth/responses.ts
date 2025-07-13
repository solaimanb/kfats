/**
 * Auth API response types
 */

import { User } from "@/types/domain/user/types";

export interface AuthResponse {
  user: User;
  accessToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  expiresIn: number;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  expiresIn: number;
}

export interface ValidateTokenResponse {
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
} 