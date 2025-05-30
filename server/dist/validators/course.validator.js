"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingSchema = exports.updateCourseSchema = exports.createCourseSchema = void 0;
const zod_1 = require("zod");
const { COURSE, ERROR_MESSAGES } = require("../constants");
const baseSchemas = {
    objectId: zod_1.z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, ERROR_MESSAGES.COURSE.INVALID_CATEGORY),
    url: zod_1.z.string().url("Invalid URL format"),
    rating: zod_1.z
        .number()
        .min(COURSE.RATING.MIN, `Rating must be at least ${COURSE.RATING.MIN}`)
        .max(COURSE.RATING.MAX, `Rating cannot exceed ${COURSE.RATING.MAX}`),
};
const contentItemSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(1, "Content title is required")
        .max(COURSE.LIMITS.CONTENT.TITLE, `Content title cannot be more than ${COURSE.LIMITS.CONTENT.TITLE} characters`),
    description: zod_1.z
        .string()
        .max(COURSE.LIMITS.CONTENT.DESCRIPTION, `Content description cannot be more than ${COURSE.LIMITS.CONTENT.DESCRIPTION} characters`)
        .optional(),
    videoUrl: baseSchemas.url,
    duration: zod_1.z
        .number()
        .min(COURSE.LIMITS.CONTENT.MIN_DURATION, `Content duration must be at least ${COURSE.LIMITS.CONTENT.MIN_DURATION} minute`),
});
const courseBaseSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(COURSE.LIMITS.MIN_TITLE, `Title must be at least ${COURSE.LIMITS.MIN_TITLE} characters`)
        .max(COURSE.LIMITS.TITLE, `Title cannot be more than ${COURSE.LIMITS.TITLE} characters`),
    description: zod_1.z
        .string()
        .min(1, "Description is required")
        .max(COURSE.LIMITS.DESCRIPTION, `Description cannot be more than ${COURSE.LIMITS.DESCRIPTION} characters`),
    thumbnail: baseSchemas.url,
    price: zod_1.z
        .number()
        .min(COURSE.LIMITS.PRICE.MIN, `Price must be at least ${COURSE.LIMITS.PRICE.MIN}`)
        .max(COURSE.LIMITS.PRICE.MAX, `Price cannot exceed ${COURSE.LIMITS.PRICE.MAX}`),
    category: baseSchemas.objectId,
    level: zod_1.z.enum(Object.values(COURSE.LEVELS), {
        errorMap: () => ({ message: ERROR_MESSAGES.COURSE.INVALID_LEVEL }),
    }),
    duration: zod_1.z
        .number()
        .min(COURSE.LIMITS.MIN_DURATION, `Duration must be at least ${COURSE.LIMITS.MIN_DURATION} minute`),
    content: zod_1.z
        .array(contentItemSchema)
        .min(1, "At least one content item is required"),
    isPublished: zod_1.z.boolean().default(false),
    status: zod_1.z
        .enum(Object.values(COURSE.STATUS), {
        errorMap: () => ({ message: "Invalid course status" }),
    })
        .default(COURSE.STATUS.DRAFT),
});
exports.createCourseSchema = courseBaseSchema.required({
    title: true,
    description: true,
    thumbnail: true,
    price: true,
    category: true,
    level: true,
    duration: true,
    content: true,
});
exports.updateCourseSchema = courseBaseSchema.partial();
exports.ratingSchema = zod_1.z.object({
    rating: baseSchemas.rating,
    review: zod_1.z
        .string()
        .max(COURSE.LIMITS.REVIEW, `Review cannot be more than ${COURSE.LIMITS.REVIEW} characters`)
        .optional(),
});
//# sourceMappingURL=course.validator.js.map