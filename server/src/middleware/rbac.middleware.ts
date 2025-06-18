import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import {
  Permission,
  UserRole,
  ResourceType,
  PermissionAction,
} from "../config/rbac/types";
import { RBACValidator } from "../utils/rbac/validator.util";
import { permissionCache } from "../utils/permission-cache.util";
import { AppError } from "../utils/error.util";
import { AuditLogger } from "../utils/audit-logger.util";
import { IUser } from "../models/user.model";

// Rate limiting configurations for different endpoints
const rateLimitConfigs = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per windowMs
    message: "Too many authentication attempts, please try again later",
  },
  permissions: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 200, // 200 requests per windowMs
    message: "Too many permission checks, please try again later",
  },
  roles: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 50, // 50 requests per windowMs
    message: "Too many role modification attempts, please try again later",
  },
};

// Create rate limiters
const createLimiter = (config: typeof rateLimitConfigs.auth) =>
  rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: { status: "error", message: config.message },
    standardHeaders: true,
    legacyHeaders: false,
  });

export const authLimiter = createLimiter(rateLimitConfigs.auth);
export const permissionsLimiter = createLimiter(rateLimitConfigs.permissions);
export const rolesLimiter = createLimiter(rateLimitConfigs.roles);

// Type for the authenticated request
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

/**
 * Middleware to check if user has required roles
 */
export const hasRoles = (roles: UserRole[]) => {
  return [
    permissionsLimiter,
    async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new AppError("Authentication required", 401);
        }

        // Validate user roles
        RBACValidator.validateRoleConstraints(req.user.roles);

        // Check if user has any of the required roles
        const hasRequiredRole = req.user.roles.some((role) =>
          roles.includes(role)
        );
        if (!hasRequiredRole) {
          throw new AppError("Insufficient role permissions", 403);
        }

        // Log the role check
        await AuditLogger.log({
          userId: req.user._id.toString(),
          action: "ROLE_CHECK",
          status: "success",
          details: {
            requiredRoles: roles,
            userRoles: req.user.roles,
          },
        });

        next();
      } catch (error) {
        next(error);
      }
    },
  ];
};

/**
 * Middleware to check if user has required permission
 */
export const hasPermission = (
  resource: ResourceType,
  action: PermissionAction
) => {
  return [
    permissionsLimiter,
    async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new AppError("Authentication required", 401);
        }

        // Try to get permissions from cache
        let permissions = await permissionCache.getPermissions(
          req.user._id.toString(),
          req.user.roles
        );

        // If not in cache, compute and cache them
        if (!permissions) {
          permissions = await computeUserPermissions(
            req.user._id.toString(),
            req.user.roles
          );
          await permissionCache.setPermissions(
            req.user._id.toString(),
            req.user.roles,
            permissions
          );
        }

        // Check if user has the required permission
        const hasRequired = permissions.some(
          (p) =>
            p.resource === resource &&
            (p.action === action || p.action === PermissionAction.MANAGE)
        );

        if (!hasRequired) {
          throw new AppError(
            `Insufficient permissions for ${action} on ${resource}`,
            403
          );
        }

        // Log the permission check
        await AuditLogger.log({
          userId: req.user._id.toString(),
          action: "PERMISSION_CHECK",
          status: "success",
          details: {
            resource,
            action,
            granted: true,
          },
        });

        next();
      } catch (error) {
        next(error);
      }
    },
  ];
};

/**
 * Middleware to check if user has all required permissions
 */
export const hasAllPermissions = (permissions: Permission[]) => {
  return [
    permissionsLimiter,
    async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new AppError("Authentication required", 401);
        }

        // Validate each permission
        permissions.forEach(RBACValidator.validatePermission);

        // Try to get user permissions from cache
        let userPermissions = await permissionCache.getPermissions(
          req.user._id.toString(),
          req.user.roles
        );

        // If not in cache, compute and cache them
        if (!userPermissions) {
          userPermissions = await computeUserPermissions(
            req.user._id.toString(),
            req.user.roles
          );
          await permissionCache.setPermissions(
            req.user._id.toString(),
            req.user.roles,
            userPermissions
          );
        }

        // Check if user has all required permissions
        const hasAll = permissions.every((required) =>
          userPermissions!.some(
            (p) =>
              p.resource === required.resource &&
              (p.action === required.action ||
                p.action === PermissionAction.MANAGE)
          )
        );

        if (!hasAll) {
          throw new AppError("Insufficient permissions", 403);
        }

        // Log the permission check
        await AuditLogger.log({
          userId: req.user._id.toString(),
          action: "PERMISSION_CHECK_ALL",
          status: "success",
          details: {
            requiredPermissions: permissions,
            granted: true,
          },
        });

        next();
      } catch (error) {
        next(error);
      }
    },
  ];
};

// Helper function to compute user permissions
async function computeUserPermissions(
  userId: string,
  roles: UserRole[]
): Promise<Permission[]> {
  // Implementation will depend on your permission computation logic
  // This should include role-based permissions and any custom user permissions
  return []; // Replace with actual implementation
}
