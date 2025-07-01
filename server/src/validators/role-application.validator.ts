import { z } from "zod";
import { UserRole } from "../config/rbac/types";
import { isValidRoleTransition } from "../config/rbac/roles";
import { ApplicationStatus } from "../models/role-application.model";

const documentSchema = z.object({
  type: z.string().min(1, "Document type is required"),
  url: z.string().url("Valid URL is required"),
  name: z.string().min(1, "Document name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  size: z.number().positive("File size must be positive"),
});

const baseFieldsSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  additionalInfo: z.string().optional(),
});

const studentFieldsSchema = baseFieldsSchema.extend({
  educationLevel: z.enum(
    ["high_school", "undergraduate", "graduate", "other"],
    {
      errorMap: () => ({ message: "Invalid education level" }),
    }
  ),
  institution: z.string().min(1, "Institution name is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  expectedGraduation: z
    .string()
    .regex(/^\d{4}(-\d{2})?$/, "Invalid graduation date format"),
  academicInterests: z
    .array(z.string())
    .min(1, "At least one academic interest is required")
    .max(5, "Maximum 5 academic interests allowed"),
  learningGoals: z
    .string()
    .min(100, "Learning goals must be at least 100 characters")
    .max(1000, "Learning goals must not exceed 1000 characters"),
});

const mentorFieldsSchema = baseFieldsSchema.extend({
  qualifications: z
    .array(
      z.object({
        degree: z.string().min(1, "Degree is required"),
        institution: z.string().min(1, "Institution is required"),
        year: z.number().min(1900, "Invalid year"),
        field: z.string().min(1, "Field of study is required"),
      })
    )
    .min(1, "At least one qualification is required"),
  experience: z.object({
    years: z.number().min(1, "Must have at least 1 year of teaching experience"),
    details: z.string().min(1, "Experience details are required")
  }),
  specialization: z
    .array(
      z
        .string()
        .regex(
          /^[a-zA-Z0-9\s]{3,50}$/,
          "Each expertise must be 3-50 characters long"
        )
    )
    .min(1, "At least one area of expertise is required")
    .max(5, "Maximum 5 areas of expertise allowed"),
  teachingStyle: z
    .string()
    .min(100, "Teaching methodology must be at least 100 characters")
    .max(1000, "Teaching methodology must not exceed 1000 characters"),
  availability: z
    .array(z.string())
    .min(1, "At least one teaching language is required")
});

const writerFieldsSchema = baseFieldsSchema.extend({
  specializations: z
    .array(z.string())
    .min(1, "At least one specialization is required")
    .max(5, "Maximum 5 specializations allowed"),
  languages: z
    .array(
      z.object({
        language: z.string().min(1, "Language is required"),
        proficiencyLevel: z.string().min(1, "Proficiency level is required"),
      })
    )
    .min(1, "At least one language is required"),
  experience: z.object({
    years: z.number().min(1, "At least 1 year of experience is required"),
    publications: z.array(z.string().url("Must be valid URLs")).optional(),
  }),
  writingStyle: z
    .string()
    .min(200, "Writing style description must be at least 200 characters")
    .max(1000, "Writing style description must not exceed 1000 characters"),
  portfolio: z.array(z.string().url("Must be valid URLs")).optional(),
});

const sellerFieldsSchema = baseFieldsSchema.extend({
  businessDetails: z.object({
    businessName: z.string().min(1, "Business name is required"),
    businessType: z.string().min(1, "Business type is required")
  }),
  businessAddress: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  productCategories: z
    .array(z.string())
    .min(1, "At least one product category is required")
    .max(10, "Maximum 10 product categories allowed"),
  businessPlan: z
    .string()
    .min(300, "Business plan must be at least 300 characters")
    .max(2000, "Business plan must not exceed 2000 characters"),
});

type DocumentRequirements = {
  [K in Exclude<UserRole, UserRole.ADMIN | UserRole.USER>]: readonly string[];
};

const roleSpecificDocumentRequirements: DocumentRequirements = {
  [UserRole.STUDENT]: ["student_id", "enrollment_proof"],
  [UserRole.MENTOR]: [
    "cv",
    "identity_proof"
  ],
  [UserRole.WRITER]: ["portfolio", "language_certificates", "identity_proof"],
  [UserRole.SELLER]: [
    "identity_proof"
  ],
} as const;

export const createRoleApplicationSchema = z
  .object({
    role: z.enum(Object.values(UserRole) as [string, ...string[]], {
      errorMap: () => ({ message: "Invalid role selected" }),
    }),
    fields: z
      .union([
        baseFieldsSchema,
        studentFieldsSchema,
        mentorFieldsSchema,
        writerFieldsSchema,
        sellerFieldsSchema,
      ])
      .refine(
        (data: any) => {
          if (data.role === UserRole.STUDENT && !("educationLevel" in data)) {
            return false;
          }
          if (data.role === UserRole.MENTOR && !("expertise" in data)) {
            return false;
          }
          if (data.role === UserRole.WRITER && !("specializations" in data)) {
            return false;
          }
          if (data.role === UserRole.SELLER && !("businessDetails" in data)) {
            return false;
          }
          return true;
        },
        {
          message: "Missing required fields for the selected role",
        }
      ),
    documents: z.array(documentSchema).optional().default([]),
  })
  .superRefine((data, ctx) => {
    if (data.role === UserRole.ADMIN || data.role === UserRole.USER || data.role === UserRole.STUDENT) {
      return;
    }

    if (!data.documents || data.documents.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one document is required for this role",
      });
      return;
    }

    const role = data.role as Exclude<UserRole, UserRole.ADMIN | UserRole.USER | UserRole.STUDENT>;
    const requiredTypes = roleSpecificDocumentRequirements[role];
    const providedTypes = data.documents.map((doc) => doc.type);

    // Check for required documents
    const missingTypes = requiredTypes.filter(
      (type) => !providedTypes.includes(type)
    );

    if (missingTypes.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Missing required documents: ${missingTypes.join(", ")}`,
      });
      return;
    }

    // Validate document types based on role
    if (data.role === UserRole.MENTOR) {
      // Allow optional teaching_certification for mentors
      const allowedTypes = [...requiredTypes, "teaching_certification"];
      const invalidTypes = providedTypes.filter(
        (type) => !allowedTypes.includes(type)
      );

      if (invalidTypes.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid document types: ${invalidTypes.join(", ")}`,
        });
        return;
      }
    } else {
      // For other roles, only allow the required types
      const invalidTypes = providedTypes.filter(
        (type) => !requiredTypes.includes(type)
      );

      if (invalidTypes.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid document types: ${invalidTypes.join(", ")}`,
        });
        return;
      }
    }
  })
  .refine(
    (data) => {
      return isValidRoleTransition(UserRole.USER, data.role as UserRole);
    },
    {
      message:
        "Invalid role transition. This role cannot be applied for from your current role.",
    }
  );

export type CreateRoleApplicationInput = z.infer<
  typeof createRoleApplicationSchema
>;

export const updateApplicationSchema = z
  .object({
    status: z.enum(["approved", "rejected"]),
    notes: z.string().optional(),
    rejectionReason: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.status === "rejected" && !data.rejectionReason) {
        return false;
      }
      return true;
    },
    {
      message: "Rejection reason is required when rejecting an application",
    }
  );

export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

export const withdrawApplicationSchema = z.object({}).strict();

export type WithdrawApplicationInput = z.infer<typeof withdrawApplicationSchema>;
