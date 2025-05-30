"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoleApplicationSchema = void 0;
const zod_1 = require("zod");
const rbac_config_1 = require("../config/rbac.config");
exports.createRoleApplicationSchema = zod_1.z.object({
    role: zod_1.z.enum(Object.values(rbac_config_1.UserRole), {
        errorMap: () => ({ message: "Invalid role selected" }),
    }),
    reason: zod_1.z.string().min(1, "Reason is required"),
    qualifications: zod_1.z.string().min(1, "Qualifications are required"),
    experience: zod_1.z.string().min(1, "Experience is required"),
    additionalInfo: zod_1.z.string().optional(),
});
//# sourceMappingURL=role-application.validator.js.map