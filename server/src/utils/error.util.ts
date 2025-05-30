export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = (err: any) => {
  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return new AppError(`${field} already exists`, 400);
  }

  // MongoDB validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    return new AppError(`Invalid input data. ${errors.join(". ")}`, 400);
  }

  // MongoDB CastError (invalid ID)
  if (err.name === "CastError") {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return new AppError("Invalid token. Please log in again", 401);
  }

  if (err.name === "TokenExpiredError") {
    return new AppError("Your token has expired. Please log in again", 401);
  }

  // Multer errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return new AppError("File too large", 400);
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return new AppError("Too many files", 400);
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return new AppError("Unexpected field", 400);
    }
    return new AppError(err.message, 400);
  }

  // Default to 500 server error
  return err.isOperational ? err : new AppError("Something went wrong", 500);
};

export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 