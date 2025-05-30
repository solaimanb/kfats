import { Request, Response, NextFunction } from "express";
import { z } from "zod";
const { CATEGORY } = require("../constants");

// Base category schema
const categoryBaseSchema = z.object({
  name: z
    .string()
    .min(
      CATEGORY.LIMITS.MIN_NAME,
      `Category name must be at least ${CATEGORY.LIMITS.MIN_NAME} characters`
    )
    .max(
      CATEGORY.LIMITS.NAME,
      `Category name cannot exceed ${CATEGORY.LIMITS.NAME} characters`
    )
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(
      CATEGORY.LIMITS.DESCRIPTION,
      `Category description cannot exceed ${CATEGORY.LIMITS.DESCRIPTION} characters`
    )
    .optional(),
  parentCategory: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid parent category ID")
    .optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Create category schema - name is required
export const createCategorySchema = categoryBaseSchema.required({
  name: true,
});

// Update category schema - all fields optional
export const updateCategorySchema = categoryBaseSchema.partial();

/**
 * Middleware to validate category data
 */
export const validateCategory = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const { error } = categoryBaseSchema.safeParse(req.body);

  if (error) {
    const errorMessages = error.issues.map((issue) => issue.message);
    return res.status(400).json({
      status: "fail",
      message: errorMessages.join(", "),
    });
  }

  return next();
};
