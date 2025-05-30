import rateLimit from "express-rate-limit";
import { AppError } from "../utils/error.util";

// Base rate limiter configuration
const createLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new AppError(options.message, 429));
    },
  });
};

// Role application rate limiter (2 applications per day per IP)
export const roleApplicationLimiter = createLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 2,
  message: "Too many role applications. Please try again after 24 hours.",
});

// Login attempt rate limiter (5 attempts per 15 minutes)
export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many login attempts. Please try again after 15 minutes.",
});

// Registration rate limiter (3 accounts per day per IP)
export const registrationLimiter = createLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3,
  message: "Too many accounts created. Please try again after 24 hours.",
});

// Password reset rate limiter (3 requests per hour)
export const passwordResetLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: "Too many password reset requests. Please try again after an hour.",
});
