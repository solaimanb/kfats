/**
 * Common API types
 */

export interface ApiResponse<T = unknown> {
  status: "success" | "fail" | "error";
  message?: string;
  data?: T;
  error?: ApiError;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ValidationError {
  field: string;
  message: string;
} 