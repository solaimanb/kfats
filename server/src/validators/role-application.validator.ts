import { z } from "zod";
import { UserRole } from "../config/rbac.config";

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

const mentorFieldsSchema = baseFieldsSchema.extend({
  expertise: z
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
  experience: z
    .number()
    .min(1, "Must have at least 1 year of teaching experience"),
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
  teachingMethodology: z
    .string()
    .min(100, "Teaching methodology must be at least 100 characters")
    .max(1000, "Teaching methodology must not exceed 1000 characters"),
  languages: z
    .array(z.string())
    .min(1, "At least one teaching language is required"),
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
    businessType: z.string().min(1, "Business type is required"),
    registrationNumber: z.string().min(1, "Registration number is required"),
    taxId: z.string().min(1, "Tax ID is required"),
  }),
  businessAddress: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  bankingDetails: z.object({
    bankName: z.string().min(1, "Bank name is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    routingNumber: z.string().min(1, "Routing number is required"),
    accountType: z.string().min(1, "Account type is required"),
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

export const createRoleApplicationSchema = z.object({
  role: z.enum(Object.values(UserRole) as [string, ...string[]], {
    errorMap: () => ({ message: "Invalid role selected" }),
  }),
  fields: z
    .union([
      baseFieldsSchema,
      mentorFieldsSchema,
      writerFieldsSchema,
      sellerFieldsSchema,
    ])
    .refine(
      (data: any) => {
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
  documents: z.array(documentSchema),
});

export type CreateRoleApplicationInput = z.infer<
  typeof createRoleApplicationSchema
>;
