import { Response } from "express";

interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

interface ApiResponse<T> {
  status: "success" | "fail" | "error";
  message?: string;
  data?: T;
  pagination?: PaginationInfo;
}

export const sendResponse = <T>(
  res: Response,
  {
    statusCode = 200,
    status = "success",
    message,
    data,
    pagination,
  }: {
    statusCode?: number;
    status?: "success" | "fail" | "error";
    message?: string;
    data?: T;
    pagination?: PaginationInfo;
  }
): void => {
  const response: ApiResponse<T> = {
    status,
  };

  if (message) response.message = message;
  if (data) response.data = data;
  if (pagination) response.pagination = pagination;

  res.status(statusCode).json(response);
};

export const sendSuccess = <T>(
  res: Response,
  {
    statusCode = 200,
    message,
    data,
    pagination,
  }: {
    statusCode?: number;
    message?: string;
    data?: T;
    pagination?: PaginationInfo;
  }
): void => {
  sendResponse(res, {
    statusCode,
    status: "success",
    message,
    data,
    pagination,
  });
};

export const sendError = (
  res: Response,
  {
    statusCode = 500,
    message = "Internal server error",
  }: {
    statusCode?: number;
    message?: string;
  }
): void => {
  sendResponse(res, {
    statusCode,
    status: "error",
    message,
  });
};

export const sendFail = (
  res: Response,
  {
    statusCode = 400,
    message = "Bad request",
  }: {
    statusCode?: number;
    message?: string;
  }
): void => {
  sendResponse(res, {
    statusCode,
    status: "fail",
    message,
  });
}; 