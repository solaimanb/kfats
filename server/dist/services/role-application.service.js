"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleApplicationService = void 0;
const mongoose_1 = require("mongoose");
const role_application_model_1 = require("../models/role-application.model");
const user_model_1 = require("../models/user.model");
const rbac_config_1 = require("../config/rbac.config");
const error_util_1 = require("../utils/error.util");
const permission_cache_util_1 = require("../utils/permission-cache.util");
const audit_log_model_1 = require("../models/audit-log.model");
class RoleApplicationService {
    static getRequiredVerificationSteps(role) {
        const baseSteps = ["document_verification", "background_check"];
        const steps = (() => {
            switch (role) {
                case rbac_config_1.UserRole.MENTOR:
                    return [
                        ...baseSteps,
                        "qualification_verification",
                        "expertise_validation",
                    ];
                case rbac_config_1.UserRole.SELLER:
                    return [...baseSteps, "business_verification", "tax_verification"];
                case rbac_config_1.UserRole.WRITER:
                    return [
                        ...baseSteps,
                        "portfolio_review",
                        "language_proficiency_check",
                    ];
                default:
                    return baseSteps;
            }
        })();
        return steps.map((step) => ({
            name: step,
            status: "pending",
        }));
    }
    async createApplication(data) {
        if (!data.role) {
            throw new error_util_1.AppError("Role is required", 400);
        }
        const verificationSteps = RoleApplicationService.getRequiredVerificationSteps(data.role);
        return role_application_model_1.RoleApplicationModel.create(Object.assign(Object.assign({}, data), { verificationSteps }));
    }
    async getMyApplications(userId) {
        return role_application_model_1.RoleApplicationModel.find({ user: new mongoose_1.Types.ObjectId(userId) });
    }
    async getAllApplications() {
        return role_application_model_1.RoleApplicationModel.find().populate("user", "firstName lastName email");
    }
    async getApplication(id) {
        const application = await role_application_model_1.RoleApplicationModel.findById(id).populate("user", "firstName lastName email");
        if (!application) {
            throw new error_util_1.AppError("Application not found", 404);
        }
        return application;
    }
    async approveApplication(id) {
        const application = await role_application_model_1.RoleApplicationModel.findByIdAndUpdate(id, { status: "approved", reviewedAt: new Date() }, { new: true });
        if (!application) {
            throw new error_util_1.AppError("Application not found", 404);
        }
        return application;
    }
    async rejectApplication(id) {
        const application = await role_application_model_1.RoleApplicationModel.findByIdAndUpdate(id, { status: "rejected", reviewedAt: new Date() }, { new: true });
        if (!application) {
            throw new error_util_1.AppError("Application not found", 404);
        }
        return application;
    }
    static async getApplications(filters = {}) {
        return role_application_model_1.RoleApplicationModel.find(filters)
            .populate("userId", "email profile")
            .sort({ submittedAt: -1 });
    }
    static async getApplicationById(id) {
        const application = await role_application_model_1.RoleApplicationModel.findById(new mongoose_1.Schema.Types.ObjectId(id)).populate("userId", "email profile");
        if (!application) {
            throw new error_util_1.AppError("Application not found", 404);
        }
        return application;
    }
    static async updateVerificationStep(applicationId, reviewerId, stepName, status, notes) {
        var _a, _b, _c;
        const application = await role_application_model_1.RoleApplicationModel.findById(new mongoose_1.Schema.Types.ObjectId(applicationId));
        if (!application) {
            throw new error_util_1.AppError("Application not found", 404);
        }
        const step = (_a = application.verificationSteps) === null || _a === void 0 ? void 0 : _a.find((s) => s.name === stepName);
        if (!step) {
            throw new error_util_1.AppError("Verification step not found", 404);
        }
        step.status = status;
        step.completedAt = new Date();
        step.completedBy = new mongoose_1.Schema.Types.ObjectId(reviewerId);
        step.notes = notes;
        const allStepsCompleted = (_b = application.verificationSteps) === null || _b === void 0 ? void 0 : _b.every((s) => s.status === "completed" || s.status === "failed");
        if (allStepsCompleted) {
            const anyStepFailed = (_c = application.verificationSteps) === null || _c === void 0 ? void 0 : _c.some((s) => s.status === "failed");
            application.status = anyStepFailed
                ? rbac_config_1.ApplicationStatus.REJECTED
                : rbac_config_1.ApplicationStatus.APPROVED;
            if (application.status === rbac_config_1.ApplicationStatus.APPROVED) {
                const user = await user_model_1.UserModel.findById(application.user);
                if (user) {
                    user.roles = [...user.roles, application.role];
                    await user.save();
                    permission_cache_util_1.permissionCache.clearUserPermissions(user._id.toString());
                }
            }
        }
        else {
            application.status = rbac_config_1.ApplicationStatus.IN_REVIEW;
        }
        await application.save();
        await audit_log_model_1.AuditLogModel.create({
            userId: new mongoose_1.Schema.Types.ObjectId(reviewerId),
            action: step.status === "completed"
                ? "VERIFICATION_STEP_COMPLETED"
                : "VERIFICATION_STEP_FAILED",
            resource: `role-application/${applicationId}/verification/${stepName}`,
            metadata: {
                applicationId,
                stepName,
                status,
                notes,
            },
            status: "success",
        });
        return application;
    }
    static async getApplicationStats() {
        return role_application_model_1.RoleApplicationModel.aggregate([
            {
                $group: {
                    _id: {
                        status: "$status",
                        role: "$requestedRole",
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: "$_id.role",
                    stats: {
                        $push: {
                            status: "$_id.status",
                            count: "$count",
                        },
                    },
                    total: { $sum: "$count" },
                },
            },
        ]);
    }
}
exports.RoleApplicationService = RoleApplicationService;
exports.default = new RoleApplicationService();
//# sourceMappingURL=role-application.service.js.map