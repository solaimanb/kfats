/**
 * Auth API response types
 */

import type { User } from '../../domain/user/types';

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export type LoginResponse = AuthResponse;
export type RegisterResponse = AuthResponse;

export interface ValidateTokenResponse {
  user: User;
}

export interface UserPreferencesResponse {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: "light" | "dark";
}

export interface RefreshTokenResponse {
  accessToken: string;
} 