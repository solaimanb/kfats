import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ResourceType, PermissionAction } from "../config/rbac/types";
import { AppError } from "../utils/error.util";

// Common validation schemas
const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");
const permissionSchema = z.object({
  resource: z.nativeEnum(ResourceType),
  action: z.nativeEnum(PermissionAction),
});
const documentSchema = z.object({
  type: z.string(),
  name: z.string(),
  url: z.string().url(),
});
const verificationStepSchema = z.object({
  step: z.string(),
  completed: z.boolean(),
  notes: z.string().optional(),
});

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
  documents: z.array(documentSchema),
});

// Role Application Review Validation Schema
export const applicationReviewSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"] as const),
  notes: z.string().optional(),
  verificationSteps: z.array(verificationStepSchema).optional(),
});

// Permission Assignment Validation Schema
export const permissionAssignmentSchema = z.object({
  userId: mongoIdSchema,
  permissions: z
    .array(permissionSchema)
    .refine((permissions) => permissions.length <= 50, {
      message: "Cannot assign more than 50 permissions at once",
    }),
});

export const permissionRevocationSchema = z.object({
  userId: mongoIdSchema,
  permissions: z.array(permissionSchema),
});

// Unified validation middleware factory
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Only validate the body by default
      const validatedBody = schema.parse(req.body);
      req.body = validatedBody;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError(error.errors[0].message, 400));
      } else {
        next(new AppError("Validation failed", 400));
      }
    }
  };
};
