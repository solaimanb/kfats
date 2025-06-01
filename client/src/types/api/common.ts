// Common API Response Type
export interface ApiResponse<T = unknown> {
  status: "success" | "fail" | "error";
  message?: string;
  data?: T;
  pagination?: PaginationInfo;
}

// Pagination Info
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Common Error Response
export interface ApiError {
  status: "fail" | "error";
  message: string;
  code?: string;
  errors?: ValidationError[];
}

// Validation Error
export interface ValidationError {
  field: string;
  message: string;
}
