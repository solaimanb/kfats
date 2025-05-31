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
const baseFieldsSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1, "Reason is required"),
    additionalInfo: zod_1.z.string().optional(),
});
const mentorFieldsSchema = baseFieldsSchema.extend({
    expertise: zod_1.z
        .array(zod_1.z
        .string()
        .regex(/^[a-zA-Z0-9\s]{3,50}$/, "Each expertise must be 3-50 characters long"))
        .min(1, "At least one area of expertise is required")
        .max(5, "Maximum 5 areas of expertise allowed"),
    experience: zod_1.z
        .number()
        .min(1, "Must have at least 1 year of teaching experience"),
    qualifications: zod_1.z
        .array(zod_1.z.object({
        degree: zod_1.z.string().min(1, "Degree is required"),
        institution: zod_1.z.string().min(1, "Institution is required"),
        year: zod_1.z.number().min(1900, "Invalid year"),
        field: zod_1.z.string().min(1, "Field of study is required"),
    }))
        .min(1, "At least one qualification is required"),
    teachingMethodology: zod_1.z
        .string()
        .min(100, "Teaching methodology must be at least 100 characters")
        .max(1000, "Teaching methodology must not exceed 1000 characters"),
    languages: zod_1.z
        .array(zod_1.z.string())
        .min(1, "At least one teaching language is required"),
});
const writerFieldsSchema = baseFieldsSchema.extend({
    specializations: zod_1.z
        .array(zod_1.z.string())
        .min(1, "At least one specialization is required")
        .max(5, "Maximum 5 specializations allowed"),
    languages: zod_1.z
        .array(zod_1.z.object({
        language: zod_1.z.string().min(1, "Language is required"),
        proficiencyLevel: zod_1.z.string().min(1, "Proficiency level is required"),
    }))
        .min(1, "At least one language is required"),
    experience: zod_1.z.object({
        years: zod_1.z.number().min(1, "At least 1 year of experience is required"),
        publications: zod_1.z.array(zod_1.z.string().url("Must be valid URLs")).optional(),
    }),
    writingStyle: zod_1.z
        .string()
        .min(200, "Writing style description must be at least 200 characters")
        .max(1000, "Writing style description must not exceed 1000 characters"),
    portfolio: zod_1.z.array(zod_1.z.string().url("Must be valid URLs")).optional(),
});
const sellerFieldsSchema = baseFieldsSchema.extend({
    businessDetails: zod_1.z.object({
        businessName: zod_1.z.string().min(1, "Business name is required"),
        businessType: zod_1.z.string().min(1, "Business type is required"),
        registrationNumber: zod_1.z.string().min(1, "Registration number is required"),
        taxId: zod_1.z.string().min(1, "Tax ID is required"),
    }),
    businessAddress: zod_1.z.object({
        street: zod_1.z.string().min(1, "Street is required"),
        city: zod_1.z.string().min(1, "City is required"),
        state: zod_1.z.string().min(1, "State is required"),
        postalCode: zod_1.z.string().min(1, "Postal code is required"),
        country: zod_1.z.string().min(1, "Country is required"),
    }),
    bankingDetails: zod_1.z.object({
        bankName: zod_1.z.string().min(1, "Bank name is required"),
        accountNumber: zod_1.z.string().min(1, "Account number is required"),
        routingNumber: zod_1.z.string().min(1, "Routing number is required"),
        accountType: zod_1.z.string().min(1, "Account type is required"),
    }),
    productCategories: zod_1.z
        .array(zod_1.z.string())
        .min(1, "At least one product category is required")
        .max(10, "Maximum 10 product categories allowed"),
    businessPlan: zod_1.z
        .string()
        .min(300, "Business plan must be at least 300 characters")
        .max(2000, "Business plan must not exceed 2000 characters"),
});
exports.createRoleApplicationSchema = zod_1.z.object({
    role: zod_1.z.enum(Object.values(rbac_config_1.UserRole), {
        errorMap: () => ({ message: "Invalid role selected" }),
    }),
    fields: zod_1.z
        .union([
        baseFieldsSchema,
        mentorFieldsSchema,
        writerFieldsSchema,
        sellerFieldsSchema,
    ])
        .refine((data) => {
        if (data.role === rbac_config_1.UserRole.MENTOR && !("expertise" in data)) {
            return false;
        }
        if (data.role === rbac_config_1.UserRole.WRITER && !("specializations" in data)) {
            return false;
        }
        if (data.role === rbac_config_1.UserRole.SELLER && !("businessDetails" in data)) {
            return false;
        }
        return true;
    }, {
        message: "Missing required fields for the selected role",
    }),
    documents: zod_1.z.array(documentSchema),
});
//# sourceMappingURL=role-application.validator.js.map