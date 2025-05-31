"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCategory = exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
const { CATEGORY } = require("../constants");
const categoryBaseSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(CATEGORY.LIMITS.MIN_NAME, `Category name must be at least ${CATEGORY.LIMITS.MIN_NAME} characters`)
        .max(CATEGORY.LIMITS.NAME, `Category name cannot exceed ${CATEGORY.LIMITS.NAME} characters`)
        .transform((val) => val.trim()),
    description: zod_1.z
        .string()
        .max(CATEGORY.LIMITS.DESCRIPTION, `Category description cannot exceed ${CATEGORY.LIMITS.DESCRIPTION} characters`)
        .optional(),
    parentCategory: zod_1.z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid parent category ID")
        .optional(),
    icon: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().default(true),
});
exports.createCategorySchema = categoryBaseSchema.required({
    name: true,
});
exports.updateCategorySchema = categoryBaseSchema.partial();
const validateCategory = (req, res, next) => {
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
exports.validateCategory = validateCategory;
//# sourceMappingURL=category.validator.js.map