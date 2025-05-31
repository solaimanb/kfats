import winston from "winston";
import { Request, Response, NextFunction } from "express";

// Configure logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  errors: any[];

  constructor(statusCode: number, message: string, errors: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(errors: any[]) {
    super(400, "Validation Error", errors);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(401, message);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Not authorized to perform this action") {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(404, message);
  }
}

export const handleError = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : "anonymous",
  });

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
      errors: err.errors,
    });
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        errors: err.errors,
      });
    } else {
      // Programming or unknown errors: don't leak error details
      logger.error("ERROR 💥", err);
      res.status(500).json({
        status: "error",
        message: "Something went wrong",
      });
    }
  }
};

export const createError = (
  statusCode: number,
  message: string,
  errors: any[] = []
) => new AppError(statusCode, message, errors);

export { logger };
