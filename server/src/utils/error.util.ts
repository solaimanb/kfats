import { Request, Response, NextFunction } from "express";
import { MongooseError } from "mongoose";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";
import { MulterError } from "multer";

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

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (process.env.NODE_ENV === "development") {
    console.error("ERROR 💥", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...(err instanceof AppError && { errors: err.errors }),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  if (err instanceof MongooseError && err.name === "ValidationError") {
    const errors = Object.values(err as any).reduce(
      (acc: Record<string, string>, val: any) => {
        acc[val.path] = val.message;
        return acc;
      },
      {}
    );
    return res.status(400).json({
      status: "fail",
      message: "Validation Error",
      errors,
    });
  }

  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    return res.status(409).json({
      status: "fail",
      message: `Duplicate ${field}`,
    });
  }

  if (err instanceof JsonWebTokenError) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid token",
    });
  }

  if (err instanceof TokenExpiredError) {
    return res.status(401).json({
      status: "fail",
      message: "Token expired",
    });
  }

  if (err instanceof ZodError) {
    const errors = err.errors.reduce(
      (acc: Record<string, string>, curr) => {
        acc[curr.path.join(".")] = curr.message;
        return acc;
      },
      {}
    );
    return res.status(400).json({
      status: "fail",
      message: "Validation Error",
      errors,
    });
  }

  if (err instanceof MulterError) {
    return res.status(400).json({
      status: "fail",
      message: "File Upload Error",
      error: err.message,
    });
  }

  return res.status(500).json({
    status: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const createError = (statusCode: number, message: string, errors?: Record<string, any>) => {
  return new AppError(message, statusCode, errors);
};
