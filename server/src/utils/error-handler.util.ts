import { Request, Response, NextFunction } from 'express';
import { logger } from './logger.util';
import { AppError } from './error.util';

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