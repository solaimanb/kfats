/**
 * Feature component types
 */

import type { ReactNode } from "react";
import type { RoleApplicationRequest } from "../api/role/requests";
import type {
  MentorRoleData,
  WriterRoleData,
  SellerRoleData,
} from "../domain/role/data";
import type { UserRole } from "../domain/role/types";

export interface RoleFormProps<
  T extends MentorRoleData | WriterRoleData | SellerRoleData
> {
  onSubmit: (
    data: Omit<RoleApplicationRequest, "fields"> & { fields: T }
  ) => Promise<void>;
  role: UserRole;
  isLoading?: boolean;
}

export type MentorFormProps = RoleFormProps<MentorRoleData>;
export type WriterFormProps = RoleFormProps<WriterRoleData>;
export type SellerFormProps = RoleFormProps<SellerRoleData>;

export interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface ProfileCardProps {
  user: {
    name: string;
    avatar?: string;
    role: string;
    bio?: string;
  };
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
}
