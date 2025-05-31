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
    async createApplication(data, req) {
        if (!data.role) {
            throw new error_util_1.AppError("Role is required", 400);
        }
        const session = await (0, mongoose_1.startSession)();
        try {
            session.startTransaction();
            const userId = typeof data.user === "string"
                ? new mongoose_1.Types.ObjectId(data.user)
                : data.user;
            const existingApplication = await role_application_model_1.RoleApplicationModel.findOne({
                user: userId,
                role: data.role,
                status: {
                    $in: [rbac_config_1.ApplicationStatus.PENDING, rbac_config_1.ApplicationStatus.IN_REVIEW],
                },
            }).session(session);
            if (existingApplication) {
                throw new error_util_1.AppError(`You already have a pending application for ${data.role} role`, 400);
            }
            const verificationSteps = RoleApplicationService.getRequiredVerificationSteps(data.role);
            const applicationData = {
                role: data.role,
                fields: data.fields,
                documents: data.documents,
                user: userId,
                verificationSteps,
                status: rbac_config_1.ApplicationStatus.PENDING,
            };
            const application = await role_application_model_1.RoleApplicationModel.create([applicationData], {
                session,
            });
            await audit_log_model_1.AuditLogModel.create([
                {
                    userId: userId,
                    action: "ROLE_APPLICATION",
                    resource: `role-application/${application[0]._id}`,
                    metadata: {
                        role: data.role,
                        status: rbac_config_1.ApplicationStatus.PENDING,
                    },
                    status: "success",
                    userAgent: req.headers["user-agent"] || "unknown",
                    ip: req.ip || "unknown",
                },
            ], { session });
            await session.commitTransaction();
            return application[0];
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async getMyApplications(userId) {
        return role_application_model_1.RoleApplicationModel.find({
            user: userId,
        }).sort({ createdAt: -1 });
    }
    async getAllApplications() {
        return role_application_model_1.RoleApplicationModel.find()
            .populate("user", "firstName lastName email")
            .sort({ createdAt: -1 });
    }
    async getApplication(id) {
        const application = await role_application_model_1.RoleApplicationModel.findById(id).populate("user", "firstName lastName email");
        if (!application) {
            throw new error_util_1.AppError(`Application with ID ${id} not found`, 404);
        }
        return application;
    }
    async approveApplication(id, reviewerId) {
        var _a;
        const session = await (0, mongoose_1.startSession)();
        try {
            session.startTransaction();
            const application = await role_application_model_1.RoleApplicationModel.findById(id).session(session);
            if (!application) {
                throw new error_util_1.AppError(`Application with ID ${id} not found`, 404);
            }
            const pendingSteps = (_a = application.verificationSteps) === null || _a === void 0 ? void 0 : _a.filter((step) => step.status === "pending");
            if (pendingSteps === null || pendingSteps === void 0 ? void 0 : pendingSteps.length) {
                throw new error_util_1.AppError(`Cannot approve application: ${pendingSteps.length} verification steps are still pending`, 400);
            }
            const updateResult = await user_model_1.UserModel.updateOne({ _id: application.user }, {
                $addToSet: { roles: application.role },
                $set: {
                    [`roleSpecificData.${application.role}.verified`]: true,
                    [`roleSpecificData.${application.role}.verificationDate`]: new Date(),
                },
            }, { session });
            if (!updateResult.matchedCount) {
                throw new error_util_1.AppError(`User not found for application ${id}`, 404);
            }
            application.status = rbac_config_1.ApplicationStatus.APPROVED;
            application.reviewedAt = new Date();
            application.reviewedBy = new mongoose_1.Types.ObjectId(reviewerId);
            await application.save({ session });
            await audit_log_model_1.AuditLogModel.create([
                {
                    userId: new mongoose_1.Types.ObjectId(reviewerId),
                    action: "ROLE_APPROVED",
                    resource: `role-application/${id}`,
                    metadata: {
                        applicationId: id,
                        role: application.role,
                        userId: application.user,
                    },
                    status: "success",
                    userAgent: "system",
                    ip: "127.0.0.1",
                },
            ], { session });
            permission_cache_util_1.permissionCache.clearUserPermissions(application.user.toString());
            await session.commitTransaction();
            return application;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async rejectApplication(id, reviewerId, reason) {
        const session = await (0, mongoose_1.startSession)();
        try {
            session.startTransaction();
            const application = await role_application_model_1.RoleApplicationModel.findById(id).session(session);
            if (!application) {
                throw new error_util_1.AppError(`Application with ID ${id} not found`, 404);
            }
            application.status = rbac_config_1.ApplicationStatus.REJECTED;
            application.reviewedAt = new Date();
            application.reviewedBy = new mongoose_1.Types.ObjectId(reviewerId);
            application.rejectionReason = reason;
            await application.save({ session });
            await audit_log_model_1.AuditLogModel.create([
                {
                    userId: new mongoose_1.Types.ObjectId(reviewerId),
                    action: "ROLE_REJECTED",
                    resource: `role-application/${id}`,
                    metadata: {
                        applicationId: id,
                        role: application.role,
                        userId: application.user,
                        reason,
                    },
                    status: "success",
                    userAgent: "system",
                    ip: "127.0.0.1",
                },
            ], { session });
            await session.commitTransaction();
            return application;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    static async updateVerificationStep(applicationId, reviewerId, stepName, status, notes) {
        var _a, _b;
        const session = await (0, mongoose_1.startSession)();
        try {
            session.startTransaction();
            const application = await role_application_model_1.RoleApplicationModel.findOneAndUpdate({
                _id: applicationId,
                "verificationSteps.name": stepName,
            }, {
                $set: {
                    "verificationSteps.$.status": status,
                    "verificationSteps.$.completedAt": new Date(),
                    "verificationSteps.$.completedBy": reviewerId,
                    "verificationSteps.$.notes": notes,
                },
            }, {
                new: true,
                session,
                runValidators: true,
            });
            if (!application) {
                throw new error_util_1.AppError(`Application with ID ${applicationId} not found or step ${stepName} not found`, 404);
            }
            const allStepsCompleted = (_a = application.verificationSteps) === null || _a === void 0 ? void 0 : _a.every((s) => s.status === "completed" || s.status === "failed");
            if (allStepsCompleted) {
                const anyStepFailed = (_b = application.verificationSteps) === null || _b === void 0 ? void 0 : _b.some((s) => s.status === "failed");
                application.status = anyStepFailed
                    ? rbac_config_1.ApplicationStatus.REJECTED
                    : rbac_config_1.ApplicationStatus.APPROVED;
                if (application.status === rbac_config_1.ApplicationStatus.APPROVED) {
                    const updateResult = await user_model_1.UserModel.updateOne({ _id: application.user }, {
                        $addToSet: { roles: application.role },
                        $set: {
                            [`roleSpecificData.${application.role}.verified`]: true,
                            [`roleSpecificData.${application.role}.verificationDate`]: new Date(),
                        },
                    }, { session });
                    if (!updateResult.matchedCount) {
                        throw new error_util_1.AppError(`User not found for application ${applicationId}`, 404);
                    }
                    permission_cache_util_1.permissionCache.clearUserPermissions(application.user.toString());
                }
            }
            else {
                application.status = rbac_config_1.ApplicationStatus.IN_REVIEW;
            }
            await application.save({ session });
            await audit_log_model_1.AuditLogModel.create([
                {
                    userId: reviewerId,
                    action: status === "completed" ? "ROLE_APPROVED" : "ROLE_REJECTED",
                    resource: `role-application/${applicationId}/verification/${stepName}`,
                    metadata: {
                        applicationId,
                        stepName,
                        status,
                        notes,
                    },
                    status: "success",
                    userAgent: "system",
                    ip: "127.0.0.1",
                },
            ], { session });
            await session.commitTransaction();
            return application;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    static async getApplicationStats() {
        return role_application_model_1.RoleApplicationModel.aggregate([
            {
                $group: {
                    _id: {
                        status: "$status",
                        role: "$role",
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