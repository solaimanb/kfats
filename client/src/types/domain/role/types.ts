/**
 * Core role domain types
 */

export enum UserRole {
  USER = "user",
  STUDENT = "student",
  MENTOR = "mentor",
  WRITER = "writer",
  SELLER = "seller",
  ADMIN = "admin",
}

export enum ApplicationStatus {
  PENDING = "pending",
  IN_REVIEW = "in_review",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export interface IRole {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}
