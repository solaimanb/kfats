/**
 * Role validation schemas
 */

import { z } from "zod";
import { UserRole } from "../domain/role/types";

export const documentSchema = z.object({
  type: z.string().min(1, "Document type is required"),
  url: z.string().url("Valid URL is required"),
  name: z.string().min(1, "Document name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  size: z.number().positive("File size must be positive"),
});

export type DocumentSchema = z.infer<typeof documentSchema>;

export const roleApplicationSchemas = {
  [UserRole.MENTOR]: z.object({
    qualifications: z.array(
      z.object({
        degree: z.string(),
        institution: z.string(),
        year: z.number(),
        field: z.string(),
        certificate: z.string().optional(),
      })
    ),
    experience: z.object({
      years: z.number(),
      details: z.string(),
    }),
    specialization: z.array(z.string()),
    teachingStyle: z.string(),
    availability: z.array(z.string()),
  }),
  [UserRole.WRITER]: z.object({
    portfolio: z.string().url(),
    samples: z.array(z.string()),
    specialization: z.array(z.string()),
    languages: z.array(z.string()),
    experience: z.object({
      years: z.number(),
      details: z.string(),
    }),
  }),
  [UserRole.SELLER]: z.object({
    businessName: z.string(),
    businessType: z.string(),
    categories: z.array(z.string()),
    experience: z.object({
      years: z.number(),
      details: z.string(),
    }),
    documents: z.array(documentSchema),
  }),
} as const;

export type MentorApplicationSchema = z.infer<
  (typeof roleApplicationSchemas)[UserRole.MENTOR]
>;
export type WriterApplicationSchema = z.infer<
  (typeof roleApplicationSchemas)[UserRole.WRITER]
>;
export type SellerApplicationSchema = z.infer<
  (typeof roleApplicationSchemas)[UserRole.SELLER]
>;

export type RoleApplicationSchema =
  | MentorApplicationSchema
  | WriterApplicationSchema
  | SellerApplicationSchema;
