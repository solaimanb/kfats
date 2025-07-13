/**
 * Common API types
 */

export interface SuccessResponse<T> {
  status: 'success';
  data: T;
  message?: string;
}

export interface ErrorResponse {
  status: 'error';
  message: string;
  error?: ApiError;
}

export interface FailResponse {
  status: 'fail';
  message: string;
}

export type ApiResponse<T = void> = SuccessResponse<T> | ErrorResponse | FailResponse;

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  response?: {
    data?: {
      status?: "success" | "error" | "fail";
      message: string;
      error?: ApiError;
    };
    status?: number;
  };
  message: string;
} 