"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.handleError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const handleError = (err) => {
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return new AppError(`${field} already exists`, 400);
    }
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((el) => el.message);
        return new AppError(`Invalid input data. ${errors.join(". ")}`, 400);
    }
    if (err.name === "CastError") {
        return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
    }
    if (err.name === "JsonWebTokenError") {
        return new AppError("Invalid token. Please log in again", 401);
    }
    if (err.name === "TokenExpiredError") {
        return new AppError("Your token has expired. Please log in again", 401);
    }
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
    return err.isOperational ? err : new AppError("Something went wrong", 500);
};
exports.handleError = handleError;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=error.util.js.map