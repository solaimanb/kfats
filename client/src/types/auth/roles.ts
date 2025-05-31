// Core Enums
export enum UserRole {
  ADMIN = "admin",
  MENTOR = "mentor",
  STUDENT = "student",
  WRITER = "writer",
  SELLER = "seller",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING_VERIFICATION = "pending_verification",
  BANNED = "banned",
}

export enum ApplicationStatus {
  PENDING = "pending",
  IN_REVIEW = "in_review",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

// Core User Interface
export interface IUser {
  _id: string;
  email: string;
  roles: UserRole[];
  status: UserStatus;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    bio?: string;
  };
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Role Application Interface
export interface RoleApplication {
  id: string;
  userId: string;
  role: UserRole;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  data: {
    [UserRole.WRITER]?: {
      specializations: string[];
      languages: string[];
      experience: string;
      portfolio: string;
      bio: string;
    };
    [UserRole.MENTOR]?: {
      specializations: string[];
      experience: string;
      qualifications: string[];
      teachingStyle: string;
      bio: string;
    };
    [UserRole.SELLER]?: {
      businessName: string;
      businessType: string;
      productCategories: string[];
      experience: string;
      bio: string;
    };
  };
}
