import { z } from "zod";
import { UserRole } from "../config/rbac.config";

const documentSchema = z.object({
  type: z.string().min(1, "Document type is required"),
  url: z.string().url("Valid URL is required"),
  name: z.string().min(1, "Document name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  size: z.number().positive("File size must be positive"),
});

const fieldsSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  qualifications: z.string().min(1, "Qualifications are required"),
  experience: z.string().min(1, "Experience is required"),
  additionalInfo: z.string().optional(),
});

export const createRoleApplicationSchema = z.object({
  role: z.enum(Object.values(UserRole) as [string, ...string[]], {
    errorMap: () => ({ message: "Invalid role selected" }),
  }),
  fields: fieldsSchema,
  documents: z.array(documentSchema).optional(),
});

export type CreateRoleApplicationInput = z.infer<
  typeof createRoleApplicationSchema
>;
