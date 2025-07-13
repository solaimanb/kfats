/**
 * Core user domain types
 */

import { Permission, UserRole } from '../../../config/rbac/types';

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
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  socialLinks?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface RoleSpecificData {
  user?: {
    lastActiveAt: Date;
    interests: string[];
    preferences: {
      contentLanguages: string[];
      contentTypes: string[];
      notificationFrequency: "immediate" | "daily" | "weekly" | "never";
    };
  };
  mentor?: {
    expertise: string[];
    qualifications: Array<{
      degree: string;
      institution: string;
      year: number;
      field: string;
      certificate?: string;
    }>;
    experience: number;
    languages: string[];
    rating: number;
    totalStudents: number;
    totalCourses: number;
    verified: boolean;
    verificationDate?: Date;
  };
  seller?: {
    businessName: string;
    businessType: string;
    registrationNumber: string;
    taxId: string;
    businessAddress?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    bankingDetails?: {
      bankName: string;
      accountNumber: string;
      routingNumber: string;
      accountType: string;
    };
    rating: number;
    totalSales: number;
    totalProducts: number;
    verified: boolean;
    verificationDate?: Date;
  };
  writer?: {
    specializations: string[];
    languages: Array<{
      language: string;
      proficiencyLevel: string;
    }>;
    experience: {
      years: number;
      publications?: Array<{
        title: string;
        url?: string;
        date: Date;
      }>;
    };
    portfolio: string[];
    rating: number;
    totalArticles: number;
    verified: boolean;
    verificationDate?: Date;
  };
}

export interface User {
  _id: string;
  email: string;
  roles: UserRole[];
  permissions: Permission[];
  status: UserStatus;
  profile: UserProfile;
  emailVerified: boolean;
  roleSpecificData: RoleSpecificData;
  verificationStatus: {
    email: boolean;
    phone?: boolean;
    documents?: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    theme: "light" | "dark";
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}
