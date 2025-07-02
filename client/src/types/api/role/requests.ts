/**
 * Role API request types
 */

import type { UserRole } from '../../domain/role/types';

export interface RoleApplicationRequest {
  role: UserRole;
  fields: {
    reason: string;
    qualifications: {
      degree: string;
      institution: string;
      year: number;
      field: string;
    }[];
    experience: {
      years: number;
      details: string;
    };
    specialization: string[];
    teachingStyle: string;
    availability: string[];
  };
  documents: {
    type: string;
    url: string;
    name: string;
    mimeType: string;
    size: number;
  }[];
}

export interface UpdateRoleApplicationRequest {
  status: "approved" | "rejected";
  notes?: string;
  rejectionReason?: string;
}
