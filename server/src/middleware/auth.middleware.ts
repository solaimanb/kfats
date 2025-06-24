import { Request, Response, NextFunction } from "express";
import {
  UserRole,
  Permission,
  ResourceType,
  PermissionAction,
} from "../config/rbac/types";
import { roleHasPermission, isValidRoleTransition } from "../config/rbac/roles";
import {
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  catchAsync,
} from "../utils/error.util";
import rateLimit from "express-rate-limit";
import passport from "passport";
import {
  AuthenticatedRequest,
  RateLimitRequest,
  AuthUser,
  RateLimitOptions,
} from "../types/auth.types";

// Rate Limiters
const createLimiter = (options: RateLimitOptions) =>
  rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || "Too many requests",
    handler: (_req, _res, next) => {
      next(new RateLimitError(options.message));
    },
  });

const authRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many authentication attempts, please try again later",
});

// Authentication Middleware
export const protect = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Apply rate limiter
    await new Promise((resolve) =>
      authRateLimiter(req as RateLimitRequest, res, resolve as NextFunction)
    );

    // Check for access token in cookie
    if (!req.cookies.accessToken && !req.headers.authorization) {
      return next(new AuthenticationError("Not authenticated"));
    }

    // Authenticate using Passport JWT strategy
    passport.authenticate(
      "jwt",
      { session: false },
      (err: Error | null, user: AuthUser | false) => {
        if (err || !user) {
          return next(new AuthenticationError("Not authenticated"));
        }
        req.user = user;
        next();
      }
    )(req, res, next);
  }
);

// Role Authorization Middleware
export const restrictTo = (...roles: UserRole[]) => {
  return [
    authRateLimiter,
    catchAsync(
      async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
        if (!req.user) {
          throw new AuthenticationError();
        }

        // Validate that all user roles are valid enum values
        const validRoles = Object.values(UserRole);
        const { roles: userRoles } = req.user;
        const hasInvalidRole = userRoles.some(
          (role) => !validRoles.includes(role)
        );

        if (hasInvalidRole) {
          throw new AuthorizationError("Invalid user role");
        }

        // Check if user has any of the required roles
        const hasRequiredRole = userRoles.some((role) => roles.includes(role));

        if (!hasRequiredRole) {
          throw new AuthorizationError(
            "You do not have permission to perform this action"
          );
        }

        next();
      }
    ),
  ];
};

// Permission Authorization Middleware
export const requirePermission = (
  resource: ResourceType,
  action: PermissionAction
) => {
  return [
    authRateLimiter,
    catchAsync(
      async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
        if (!req.user) {
          throw new AuthenticationError();
        }

        // Validate all user roles
        const validRoles = Object.values(UserRole);
        const { roles: userRoles } = req.user;
        const hasInvalidRole = userRoles.some(
          (role) => !validRoles.includes(role)
        );

        if (hasInvalidRole) {
          throw new AuthorizationError("Invalid role detected");
        }

        // Check if user has the required permission
        const hasPermission = userRoles.some((role) =>
          roleHasPermission(role, { resource, action })
        );

        if (!hasPermission) {
          throw new AuthorizationError(
            "You do not have the required permission"
          );
        }

        next();
      }
    ),
  ];
};

// Multiple Permissions Check Middleware
export const requireAllPermissions = (permissions: Permission[]) => {
  return [
    authRateLimiter,
    catchAsync(
      async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
        if (!req.user) {
          throw new AuthenticationError();
        }

        const { roles: userRoles } = req.user;
        const hasAllPermissions = permissions.every((permission) =>
          userRoles.some((role) => roleHasPermission(role, permission))
        );

        if (!hasAllPermissions) {
          throw new AuthorizationError(
            "You do not have all required permissions"
          );
        }

        next();
      }
    ),
  ];
};

// Any Permission Check Middleware
export const requireAnyPermission = (permissions: Permission[]) => {
  return [
    authRateLimiter,
    catchAsync(
      async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
        if (!req.user) {
          throw new AuthenticationError();
        }

        const { roles: userRoles } = req.user;
        const hasAnyPermission = permissions.some((permission) =>
          userRoles.some((role) => roleHasPermission(role, permission))
        );

        if (!hasAnyPermission) {
          throw new AuthorizationError(
            "You do not have any of the required permissions"
          );
        }

        next();
      }
    ),
  ];
};

// Role Transition Check Middleware
export const checkRoleTransition = (fromRole: UserRole, toRole: UserRole) => {
  return [
    authRateLimiter,
    catchAsync(async (_req: Request, _res: Response, next: NextFunction) => {
      if (!isValidRoleTransition(fromRole, toRole)) {
        throw new AuthorizationError("Invalid role transition");
      }
      next();
    }),
  ];
};

// Rate Limiting Factory
export const createRateLimit = (
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  max: number = 100, // limit each IP to 100 requests per windowMs
  message: string = "Too many requests. Please try again later."
) => {
  return rateLimit({
    windowMs,
    max,
    message,
    handler: (_req, _res, next) => {
      next(new RateLimitError(message));
    },
  });
};
