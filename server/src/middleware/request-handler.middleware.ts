import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.util';

// Add request ID and timing
export const requestTracker = (req: Request, res: Response, next: NextFunction) => {
  req.id = uuidv4();
  req.startTime = Date.now();

  // Add response listener to log request completion
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    logger.info({
      requestId: req.id,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};

// Request timeout middleware
export const requestTimeout = (timeout: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setTimeout(timeout, () => {
      logger.error({
        requestId: req.id,
        message: 'Request timeout',
        url: req.url,
        method: req.method,
      });

      res.status(408).json({
        status: 'error',
        code: 'REQUEST_TIMEOUT',
        message: 'Request took too long to process',
      });
    });
    next();
  };
};

// Error codes mapping
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  DATABASE_ERROR: 'DATABASE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT: 'INVALID_INPUT',
  SERVER_ERROR: 'SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
} as const;

// Error handler middleware
export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  // Log error details
  logger.error({
    requestId: req.id,
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
    request: {
      method: req.method,
      url: req.url,
      body: req.body,
      params: req.params,
      query: req.query,
    },
  });

  // Determine error type and code
  let statusCode = 500;
  let errorCode: ErrorCode = ErrorCodes.SERVER_ERROR;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = ErrorCodes.VALIDATION_ERROR;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = ErrorCodes.AUTHENTICATION_ERROR;
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    errorCode = ErrorCodes.AUTHORIZATION_ERROR;
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    errorCode = ErrorCodes.RESOURCE_NOT_FOUND;
  } else if (err.code === 11000) {
    statusCode = 409;
    errorCode = ErrorCodes.DUPLICATE_ENTRY;
  }

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    code: errorCode,
    message: err.message,
    errors: err.errors,
    requestId: req.id,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      id: string;
      startTime: number;
    }
  }
} 