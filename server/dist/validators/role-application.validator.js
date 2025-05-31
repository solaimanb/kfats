"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoleApplicationSchema = void 0;
const zod_1 = require("zod");
const rbac_config_1 = require("../config/rbac.config");
const documentSchema = zod_1.z.object({
    type: zod_1.z.string().min(1, "Document type is required"),
    url: zod_1.z.string().url("Valid URL is required"),
    name: zod_1.z.string().min(1, "Document name is required"),
    mimeType: zod_1.z.string().min(1, "MIME type is required"),
    size: zod_1.z.number().positive("File size must be positive"),
});
const fieldsSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1, "Reason is required"),
    qualifications: zod_1.z.string().min(1, "Qualifications are required"),
    experience: zod_1.z.string().min(1, "Experience is required"),
    additionalInfo: zod_1.z.string().optional(),
});
exports.createRoleApplicationSchema = zod_1.z.object({
    role: zod_1.z.enum(Object.values(rbac_config_1.UserRole), {
        errorMap: () => ({ message: "Invalid role selected" }),
    }),
    fields: fieldsSchema,
    documents: zod_1.z.array(documentSchema).optional(),
});
//# sourceMappingURL=role-application.validator.js.map