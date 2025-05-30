import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { PERMISSIONS } from "../config/rbac.config";
import { AppError } from "../utils/error.util";

// Get all valid permissions
const allValidPermissions = Object.values(PERMISSIONS)
  .flatMap((rolePerms) => Object.values(rolePerms))
  .flat();

// Role Application Validation Schema
export const roleApplicationSchema = z.object({
  requestedRole: z.enum([
    "admin",
    "mentor",
    "student",
    "writer",
    "seller",
  ] as const),
  applicationData: z.record(z.any()),
  documents: z.array(
    z.object({
      type: z.string(),
      name: z.string(),
      url: z.string().url(),
    })
  ),
});

// Role Application Review Validation Schema
export const applicationReviewSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"] as const),
  notes: z.string().optional(),
  verificationSteps: z
    .array(
      z.object({
        step: z.string(),
        completed: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .optional(),
});

// Permission Assignment Validation Schema
export const permissionAssignmentSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  permissions: z
    .array(z.string())
    .refine(
      (permissions) =>
        permissions.every((perm) => allValidPermissions.includes(perm)),
      {
        message: "One or more permissions are invalid",
      }
    )
    .refine((permissions) => permissions.length <= 50, {
      message: "Cannot assign more than 50 permissions at once",
    })
    .refine(
      (permissions) =>
        !permissions.some((perm) =>
          Object.values(PERMISSIONS.ADMIN).includes(perm)
        ),
      {
        message: "Cannot assign admin permissions through this endpoint",
      }
    ),
});

export const permissionRevocationSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  permissions: z
    .array(z.string())
    .refine(
      (permissions) =>
        permissions.every((perm) => allValidPermissions.includes(perm)),
      {
        message: "One or more permissions are invalid",
      }
    ),
});

// Unified validation middleware factory
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check for content-type on POST/PUT/PATCH requests
    if (["POST", "PUT", "PATCH"].includes(req.method) && 
        req.headers["content-type"] !== "application/json") {
      return next(new AppError("Content-Type must be application/json", 415));
    }

    // Check request size
    const contentLength = parseInt(req.headers["content-length"] || "0", 10);
    if (contentLength > 1024 * 1024) { // 1MB limit
      return next(new AppError("Request body too large", 413));
    }

    // Sanitize input
    const sanitizeValue = (value: any): any => {
      if (typeof value === "string") {
        // Remove any potential XSS or injection attempts
        return value.replace(/[<>]/g, "");
      }
      if (Array.isArray(value)) {
        return value.map(sanitizeValue);
      }
      if (typeof value === "object" && value !== null) {
        return Object.fromEntries(
          Object.entries(value).map(([k, v]) => [k, sanitizeValue(v)])
        );
      }
      return value;
    };

    req.body = sanitizeValue(req.body);

    // Validate against schema
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: error.errors.map(err => ({
            path: err.path.join("."),
            message: err.message
          }))
        });
      } else {
        next(error);
      }
    }
  };
};
