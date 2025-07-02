/**
 * Role application domain types
 */

import { Document } from "../common/types";

export interface VerificationStep {
  name: string;
  status: "pending" | "completed" | "failed";
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface RoleApplication {
  _id: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  documents: Document[];
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}
