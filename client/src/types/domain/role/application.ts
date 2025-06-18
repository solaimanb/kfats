/**
 * Role application domain types
 */

import type { UserRole, ApplicationStatus } from './types';

export interface Document {
  type: string;
  url: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface VerificationStep {
  name: string;
  status: "pending" | "completed" | "failed";
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface RoleApplication {
  id: string;
  userId: string;
  role: UserRole;
  status: ApplicationStatus;
  documents: Document[];
  fields: Record<string, unknown>;
  verificationSteps: VerificationStep[];
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
} 