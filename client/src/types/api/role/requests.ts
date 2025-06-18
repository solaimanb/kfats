/**
 * Role API request types
 */

import type { UserRole } from '../../domain/role/types';
import type { Document } from '../../domain/role/application';
import type { RoleApplicationData } from '../../domain/role/data';

export interface RoleApplicationRequest {
  role: UserRole;
  fields: RoleApplicationData[keyof RoleApplicationData];
  documents?: Document[];
}

export interface UpdateRoleApplicationRequest {
  status: "approved" | "rejected";
  notes?: string;
  rejectionReason?: string;
} 