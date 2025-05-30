import { z } from "zod";
import { UserRole } from "../config/rbac.config";

export const createRoleApplicationSchema = z.object({
  role: z.enum(Object.values(UserRole) as [string, ...string[]], {
    errorMap: () => ({ message: "Invalid role selected" }),
  }),
  reason: z.string().min(1, "Reason is required"),
  qualifications: z.string().min(1, "Qualifications are required"),
  experience: z.string().min(1, "Experience is required"),
  additionalInfo: z.string().optional(),
});
