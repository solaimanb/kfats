/**
 * Role-specific data types based on validation schemas
 */

import type { UserRole } from './types';

export interface BaseRoleData {
  reason: string;
  additionalInfo?: string;
}

export interface QualificationData {
  degree: string;
  institution: string;
  year: number;
  field: string;
  certificate?: string;
}

export interface ExperienceData {
  years: number;
  details: string;
}

export interface MentorRoleData extends BaseRoleData {
  qualifications: QualificationData[];
  experience: ExperienceData;
  specialization: string[];
  teachingStyle: string;
  availability: string[];
}

export interface WriterRoleData extends BaseRoleData {
  portfolio: string;
  samples: string[];
  specialization: string[];
  languages: string[];
  experience: ExperienceData;
}

export interface SellerRoleData extends BaseRoleData {
  businessName: string;
  businessType: string;
  categories: string[];
  experience: ExperienceData;
  documents: Array<{
    type: string;
    url: string;
  }>;
}

export type RoleApplicationData = {
  [UserRole.MENTOR]: MentorRoleData;
  [UserRole.WRITER]: WriterRoleData;
  [UserRole.SELLER]: SellerRoleData;
};
