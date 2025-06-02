/**
 * Core user domain types
 */

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING_VERIFICATION = "pending_verification",
  BANNED = "banned",
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  bio?: string;
}

export interface User {
  _id: string;
  email: string;
  roles: string[]; // Will be typed as UserRole[] when imported
  status: UserStatus;
  profile: UserProfile;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
} 