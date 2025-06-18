import { z } from "zod";
const { COURSE, ERROR_MESSAGES } = require("../constants");

// Base schemas
const baseSchemas = {
  objectId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, ERROR_MESSAGES.COURSE.INVALID_CATEGORY),
  url: z.string().url("Invalid URL format"),
  rating: z
    .number()
    .min(COURSE.RATING.MIN, `Rating must be at least ${COURSE.RATING.MIN}`)
    .max(COURSE.RATING.MAX, `Rating cannot exceed ${COURSE.RATING.MAX}`),
};

// Content item schema
const contentItemSchema = z.object({
  title: z
    .string()
    .min(1, "Content title is required")
    .max(
      COURSE.LIMITS.CONTENT.TITLE,
      `Content title cannot be more than ${COURSE.LIMITS.CONTENT.TITLE} characters`
    ),
  description: z
    .string()
    .max(
      COURSE.LIMITS.CONTENT.DESCRIPTION,
      `Content description cannot be more than ${COURSE.LIMITS.CONTENT.DESCRIPTION} characters`
    )
    .optional(),
  videoUrl: baseSchemas.url,
  duration: z
    .number()
    .min(
      COURSE.LIMITS.CONTENT.MIN_DURATION,
      `Content duration must be at least ${COURSE.LIMITS.CONTENT.MIN_DURATION} minute`
    ),
});

// Course base schema
const courseBaseSchema = z.object({
  title: z
    .string()
    .min(
      COURSE.LIMITS.MIN_TITLE,
      `Title must be at least ${COURSE.LIMITS.MIN_TITLE} characters`
    )
    .max(
      COURSE.LIMITS.TITLE,
      `Title cannot be more than ${COURSE.LIMITS.TITLE} characters`
    ),
  description: z
    .string()
    .min(1, "Description is required")
    .max(
      COURSE.LIMITS.DESCRIPTION,
      `Description cannot be more than ${COURSE.LIMITS.DESCRIPTION} characters`
    ),
  thumbnail: baseSchemas.url,
  price: z
    .number()
    .min(
      COURSE.LIMITS.PRICE.MIN,
      `Price must be at least ${COURSE.LIMITS.PRICE.MIN}`
    )
    .max(
      COURSE.LIMITS.PRICE.MAX,
      `Price cannot exceed ${COURSE.LIMITS.PRICE.MAX}`
    ),
  category: baseSchemas.objectId,
  level: z.enum(Object.values(COURSE.LEVELS) as [string, ...string[]], {
    errorMap: () => ({ message: ERROR_MESSAGES.COURSE.INVALID_LEVEL }),
  }),
  duration: z
    .number()
    .min(
      COURSE.LIMITS.MIN_DURATION,
      `Duration must be at least ${COURSE.LIMITS.MIN_DURATION} minute`
    ),
  content: z
    .array(contentItemSchema)
    .min(1, "At least one content item is required"),
  isPublished: z.boolean().default(false),
  status: z
    .enum(Object.values(COURSE.STATUS) as [string, ...string[]], {
      errorMap: () => ({ message: "Invalid course status" }),
    })
    .default(COURSE.STATUS.DRAFT),
});

// Create course schema - all fields required
export const createCourseSchema = courseBaseSchema.required({
  title: true,
  description: true,
  thumbnail: true,
  price: true,
  category: true,
  level: true,
  duration: true,
  content: true,
});

// Update course schema - all fields optional
export const updateCourseSchema = courseBaseSchema.partial();

// Rating schema
export const ratingSchema = z.object({
  rating: baseSchemas.rating,
  review: z
    .string()
    .max(
      COURSE.LIMITS.REVIEW,
      `Review cannot be more than ${COURSE.LIMITS.REVIEW} characters`
    )
    .optional(),
});
