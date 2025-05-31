"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.permissionRevocationSchema = exports.permissionAssignmentSchema = exports.applicationReviewSchema = exports.roleApplicationSchema = void 0;
const zod_1 = require("zod");
const rbac_config_1 = require("../config/rbac.config");
const error_util_1 = require("../utils/error.util");
const allValidPermissions = Object.values(rbac_config_1.PERMISSIONS)
    .flatMap((rolePerms) => Object.values(rolePerms))
    .flat();
exports.roleApplicationSchema = zod_1.z.object({
    requestedRole: zod_1.z.enum([
        "admin",
        "mentor",
        "student",
        "writer",
        "seller",
    ]),
    applicationData: zod_1.z.record(zod_1.z.any()),
    documents: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.string(),
        name: zod_1.z.string(),
        url: zod_1.z.string().url(),
    })),
});
exports.applicationReviewSchema = zod_1.z.object({
    status: zod_1.z.enum(["pending", "approved", "rejected"]),
    notes: zod_1.z.string().optional(),
    verificationSteps: zod_1.z
        .array(zod_1.z.object({
        step: zod_1.z.string(),
        completed: zod_1.z.boolean(),
        notes: zod_1.z.string().optional(),
    }))
        .optional(),
});
exports.permissionAssignmentSchema = zod_1.z.object({
    userId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
    permissions: zod_1.z
        .array(zod_1.z.string())
        .refine((permissions) => permissions.every((perm) => allValidPermissions.includes(perm)), {
        message: "One or more permissions are invalid",
    })
        .refine((permissions) => permissions.length <= 50, {
        message: "Cannot assign more than 50 permissions at once",
    })
        .refine((permissions) => !permissions.some((perm) => Object.values(rbac_config_1.PERMISSIONS.ADMIN).includes(perm)), {
        message: "Cannot assign admin permissions through this endpoint",
    }),
});
exports.permissionRevocationSchema = zod_1.z.object({
    userId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
    permissions: zod_1.z
        .array(zod_1.z.string())
        .refine((permissions) => permissions.every((perm) => allValidPermissions.includes(perm)), {
        message: "One or more permissions are invalid",
    }),
});
const validateRequest = (schema) => {
    return (req, res, next) => {
        if (["POST", "PUT", "PATCH"].includes(req.method) &&
            req.headers["content-type"] !== "application/json") {
            return next(new error_util_1.AppError("Content-Type must be application/json", 415));
        }
        const contentLength = parseInt(req.headers["content-length"] || "0", 10);
        if (contentLength > 1024 * 1024) {
            return next(new error_util_1.AppError("Request body too large", 413));
        }
        const sanitizeValue = (value) => {
            if (typeof value === "string") {
                return value.replace(/[<>]/g, "");
            }
            if (Array.isArray(value)) {
                return value.map(sanitizeValue);
            }
            if (typeof value === "object" && value !== null) {
                return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitizeValue(v)]));
            }
            return value;
        };
        req.body = sanitizeValue(req.body);
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    status: "error",
                    message: "Validation failed",
                    errors: error.errors.map(err => ({
                        path: err.path.join("."),
                        message: err.message
                    }))
                });
            }
            else {
                next(error);
            }
        }
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validation.middleware.js.map