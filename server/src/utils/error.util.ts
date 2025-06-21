import { Request, Response, NextFunction } from "express";
import { MongooseError } from "mongoose";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";
import { MulterError } from "multer";
import { logger } from './logger.util';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  errors?: Record<string, any>;

  constructor(message: string, statusCode: number, errors?: Record<string, any>) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(errors: Record<string, string>) {
    super("Validation Error", 400, errors);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Not authorized") {
    super(message, 403);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Not authenticated") {
    super(message, 401);
  }
}

export class ResourceNotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class DuplicateResourceError extends AppError {
  constructor(resource: string) {
    super(`${resource} already exists`, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429);
  }
}

export class FileUploadError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

interface ErrorResponse {
  status: string;
  message: string;
  requestId?: string;
  errors?: Record<string, any>;
}

export const handleError = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  const response: ErrorResponse = {
    status: 'error',
    message: 'Something went wrong!',
    requestId: req.id
  };

  // Handle known error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    response.status = err.status;
    response.message = err.message;
    if (err.errors) {
      response.errors = err.errors;
    }
  } 
  // Handle Mongoose validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    response.status = 'fail';
    response.message = 'Invalid input data';
    response.errors = Object.values((err as any).errors).reduce(
      (acc: Record<string, string>, val: any) => {
        acc[val.path] = val.message;
        return acc;
      },
      {}
    );
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    response.status = 'fail';
    response.message = 'Invalid token. Please log in again!';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    response.status = 'fail';
    response.message = 'Your token has expired! Please log in again.';
  }

  // Log error for debugging in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    logger.error({
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
        statusCode
      },
      requestId: req.id,
      path: req.path,
      method: req.method
    });
  } else {
    // In production, log minimal error details
    logger.error({
      error: {
        name: err.name,
        statusCode
      },
      requestId: req.id,
      path: req.path
    });
  }

  res.status(statusCode).json(response);
};

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const createError = (statusCode: number, message: string, errors?: Record<string, any>) => {
  return new AppError(message, statusCode, errors);
};
