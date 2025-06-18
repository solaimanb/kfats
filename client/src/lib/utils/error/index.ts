import { AxiosError } from "axios";

/**
 * Base error class for application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Handles API errors in a consistent way
 * @param error - Error from API call
 */
export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    // Handle Axios specific errors
    if (error.response) {
      // Server responded with error
      return error.response.data?.message || error.message;
    } else if (error.request) {
      // Request made but no response
      return "No response from server. Please check your connection.";
    }
  }

  // Generic error handling
  return "An unexpected error occurred. Please try again.";
}

/**
 * Creates a user-friendly error message
 * @param error - Error object
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}

/**
 * Checks if an error is a specific type
 * @param error - Error to check
 * @param code - Error code to check for
 */
export function isErrorType(error: unknown, code: string): boolean {
  return error instanceof AppError && error.code === code;
}
