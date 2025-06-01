// Core Enums
export enum UserRole {
  USER = "user",
  STUDENT = "student",
  MENTOR = "mentor",
  WRITER = "writer",
  SELLER = "seller",
  ADMIN = "admin",
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
  documents: {
    type: string;
    url: string;
    name: string;
    mimeType: string;
    size: number;
  }[];
  fields: Record<string, string | number | boolean | object>;
  verificationSteps: {
    name: string;
    status: "pending" | "completed" | "failed";
    completedAt?: Date;
    completedBy?: string;
    notes?: string;
  }[];
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Permission Interface
export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  attributes?: string[];
  conditions?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Role Interface
export interface IRole {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Role-specific Data Interfaces
export interface StudentRoleData {
  studentId: string;
  batch: string;
  department: string;
  semester: number;
  verified?: boolean;
  verificationDate?: Date;
}

export interface TeacherRoleData {
  employeeId: string;
  department: string;
  designation: string;
  joiningDate: Date;
  verified?: boolean;
  verificationDate?: Date;
}

export interface WriterRoleData {
  specializations: string[];
  languages: string[];
  experience: string;
  portfolio: string;
  verified?: boolean;
  verificationDate?: Date;
}

export interface SellerRoleData {
  businessName: string;
  businessType: string;
  productCategories: string[];
  experience: string;
  verified?: boolean;
  verificationDate?: Date;
}

// Role-specific Data Type
export type RoleSpecificData = {
  [UserRole.STUDENT]?: StudentRoleData;
  [UserRole.MENTOR]?: TeacherRoleData;
  [UserRole.WRITER]?: WriterRoleData;
  [UserRole.SELLER]?: SellerRoleData;
};
