import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserModel, IUser } from "../models/user.model";
import { AppError } from "../utils/error.util";
import {
  UserRole,
  UserStatus,
  getAllPermissionsForRole,
  PERMISSIONS,
} from "../config/rbac.config";
import { permissionCache } from "../utils/permission-cache.util";
import { Document } from "mongoose";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { RefreshTokenModel } from "../models/refresh-token.model";

dotenv.config();

interface JWTPayload {
  id: string;
  roles: UserRole[];
  email: string;
  iat?: number;
}

type AuthUser = IUser & Document;

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
    token?: string;
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Get token
    let token: string | undefined;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AppError("Not authenticated. Please log in.", 401);
    }

    try {
      // 2. Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JWTPayload;

      // 3. Check if user exists
      const user = (await UserModel.findById(decoded.id).select(
        "+security"
      )) as AuthUser;
      if (!user) {
        throw new AppError("User no longer exists", 404);
      }

      // 4. Check if user changed password after token was issued
      if (user.security?.passwordChangedAt && decoded.iat) {
        const changedTimestamp =
          user.security.passwordChangedAt.getTime() / 1000;
        if (decoded.iat < changedTimestamp) {
          throw new AppError(
            "Password recently changed. Please log in again.",
            401
          );
        }
      }

      // 5. Check if user is active
      if (user.status !== UserStatus.ACTIVE) {
        throw new AppError(
          "Account is not active. Please contact support.",
          401
        );
      }

      // 6. Attach user and token to request
      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // Get refresh token from cookies
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
          throw new AppError("Session expired. Please log in again.", 401);
        }

        // Find valid refresh token
        const validToken = await RefreshTokenModel.findOne({
          token: refreshToken,
          isRevoked: false,
          expiresAt: { $gt: new Date() },
        });

        if (!validToken) {
          throw new AppError(
            "Invalid refresh token. Please log in again.",
            401
          );
        }

        // Get user and verify status
        const user = await UserModel.findById(validToken.user).select(
          "+security"
        );
        if (!user || user.status !== UserStatus.ACTIVE) {
          throw new AppError("User not found or inactive", 401);
        }

        // Generate new access token
        const newToken = jwt.sign(
          { id: user._id, roles: user.roles, email: user.email },
          process.env.JWT_SECRET as string,
          { expiresIn: "15m" }
        );

        // Revoke used refresh token and generate new one
        validToken.isRevoked = true;
        await validToken.save();

        // Generate new refresh token
        const newRefreshToken = await RefreshTokenModel.create({
          user: user._id,
          token: crypto.randomBytes(40).toString("hex"),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          deviceInfo: {
            ip: req.ip || req.socket.remoteAddress || "unknown",
            userAgent: req.headers["user-agent"] || "",
          },
        });

        // Set new refresh token in cookie
        res.cookie("refreshToken", newRefreshToken.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        // Set new access token in header
        res.setHeader("X-New-Access-Token", newToken);

        // Attach user and new token to request
        req.user = user;
        req.token = newToken;
        next();
      } else {
        throw new AppError("Invalid token. Please log in again.", 401);
      }
    }
  } catch (error) {
    next(error);
  }
};

// Rate limiter for permission checks
const permissionCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 permission checks per windowMs
  message: "Too many permission checks from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// RBAC Middleware with rate limiting and enhanced validation
export const restrictTo = (...roles: UserRole[]) => {
  return [
    permissionCheckLimiter,
    (req: Request, _res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new AppError("Not authenticated", 401);
        }

        // Validate that all user roles are valid enum values
        const validRoles = Object.values(UserRole);
        const hasInvalidRole = req.user.roles.some(
          (role) => !validRoles.includes(role as UserRole)
        );

        if (hasInvalidRole) {
          throw new AppError("Invalid user role", 403);
        }

        // Check if user has any of the required roles
        const hasRequiredRole = req.user.roles.some((role) =>
          roles.includes(role as UserRole)
        );

        if (!hasRequiredRole) {
          throw new AppError(
            "You do not have permission to perform this action",
            403
          );
        }

        next();
      } catch (error) {
        next(error);
      }
    },
  ];
};

// Enhanced permission check middleware with rate limiting
export const hasPermission = (permission: string) => {
  return [
    permissionCheckLimiter,
    async (req: Request, _res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new AppError("Not authenticated", 401);
        }

        // Bypass permission checks in development mode
        // TODO: Remove this before deploying to production
        if (process.env.NODE_ENV === "development") {
          return next();
        }

        const userId = req.user._id.toString();
        const userRoles = req.user.roles;

        // Validate all user roles
        const validRoles = Object.values(UserRole);
        const hasInvalidRole = userRoles.some(
          (role) => !validRoles.includes(role as UserRole)
        );

        if (hasInvalidRole) {
          throw new AppError("Invalid role detected", 403);
        }

        // Get permissions from cache or compute them
        let userPermissions = permissionCache.getPermissions(userId, userRoles);
        if (!userPermissions) {
          userPermissions = userRoles.flatMap((role) =>
            getAllPermissionsForRole(role as UserRole)
          );
          permissionCache.setPermissions(userId, userRoles, userPermissions);
        }

        // Validate custom permissions against allowed set
        const customPermissions = req.user.customPermissions || [];
        const allValidPermissions = new Set(
          Object.values(PERMISSIONS)
            .flatMap((rolePerms) => Object.values(rolePerms))
            .flat()
        );

        const hasInvalidCustomPermission = customPermissions.some(
          (perm) => !allValidPermissions.has(perm)
        );

        if (hasInvalidCustomPermission) {
          throw new AppError("Invalid custom permission detected", 403);
        }

        // Combine role-based and valid custom permissions
        const allUserPermissions = [...userPermissions, ...customPermissions];

        if (!allUserPermissions.includes(permission)) {
          throw new AppError("You do not have the required permission", 403);
        }

        next();
      } catch (error) {
        next(error);
      }
    },
  ];
};

interface RateLimitRequest extends Request {
  ip: string;
}

// Rate limiting middleware
export const customRateLimit = (
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  max: number = 100 // limit each IP to 100 requests per windowMs
) => {
  const requests = new Map<string, number>();

  return (req: RateLimitRequest, _res: Response, next: NextFunction) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old requests
    requests.forEach((timestamp, key) => {
      if (timestamp < windowStart) {
        requests.delete(key);
      }
    });

    // Count requests in window
    const requestCount = Array.from(requests.values()).filter(
      (timestamp) => timestamp > windowStart
    ).length;

    if (requestCount >= max) {
      throw new AppError("Too many requests. Please try again later.", 429);
    }

    requests.set(ip, now);
    next();
  };
};
