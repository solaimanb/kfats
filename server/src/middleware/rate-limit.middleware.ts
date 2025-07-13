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
    message: { status: "error", message: options.message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new AppError(options.message, 429));
    },
    skipSuccessfulRequests: false,
    keyGenerator: (req) => {
      const realIp = req.headers['x-forwarded-for'] || req.ip;
      return (Array.isArray(realIp) ? realIp[0] : realIp) + ':' + req.originalUrl;
    }
  });
};

// Login attempt rate limiter (15 attempts per 15 minutes)
export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: "Too many login attempts. Please try again in a few minutes.",
});
