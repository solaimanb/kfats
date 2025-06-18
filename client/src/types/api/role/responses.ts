/**
 * Role API response types
 */

import type { RoleApplication } from '../../domain/role/application';

export type RoleApplicationResponse = RoleApplication;

export interface RoleStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byRole: Record<string, number>;
} 