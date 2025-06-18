import { Schema, startSession, Types } from "mongoose";
import {
  RoleApplicationModel,
  IRoleApplication,
  ApplicationStatus,
} from "../models/role-application.model";
import { UserModel } from "../models/user.model";
import {
  UserRole,
} from "../config/rbac/types";
import {
  validateRoleConstraints,
} from "../config/rbac/validators";
import { ROLE_TRANSITIONS } from "../config/rbac/roles";
import { AppError } from "../utils/error.util";
import { permissionCache } from "../utils/permission-cache.util";
import { AuditLogModel } from "../models/audit-log.model";
import { CreateRoleApplicationInput } from "../validators/role-application.validator";
import { emailService } from "../utils/email.util";
import { Request } from "express";

interface VerificationStep {
  name: string;
  status: "pending" | "completed" | "failed";
  completedAt?: Date;
  completedBy?: Schema.Types.ObjectId;
  notes?: string;
}

export interface CreateApplicationData extends CreateRoleApplicationInput {
  user: string | Schema.Types.ObjectId;
}

export class RoleApplicationService {
  private static getRequiredVerificationSteps(
    role: UserRole
  ): VerificationStep[] {
    const baseSteps = ["document_verification", "background_check"];

    const steps = (() => {
      switch (role) {
        case UserRole.MENTOR:
          return [
            ...baseSteps,
            "qualification_verification",
            "expertise_validation",
            "teaching_experience_check",
          ];
        case UserRole.SELLER:
          return [
            ...baseSteps,
            "business_verification",
            "tax_verification",
            "bank_account_verification",
          ];
        case UserRole.WRITER:
          return [
            ...baseSteps,
            "portfolio_review",
            "language_proficiency_check",
            "plagiarism_history_check",
          ];
        case UserRole.STUDENT:
          return [];
        default:
          return baseSteps;
      }
    })();

    return steps.map((step) => ({
      name: step,
      status: "pending",
    }));
  }

  async createApplication(data: CreateApplicationData, req: Request) {
    if (!data.role) {
      throw new AppError("Role is required", 400);
    }

    const session = await startSession();
    try {
      session.startTransaction();

      // Convert user ID to ObjectId if it's a string
      const userId =
        typeof data.user === "string"
          ? new Types.ObjectId(data.user)
          : data.user;

      // Get user and validate role transition
      const user = await UserModel.findById(userId).session(session);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Validate base USER role
      if (!user.roles.includes(UserRole.USER)) {
        throw new AppError("Base USER role is required", 400);
      }

      // Check if user already has any specialized role or pending application
      const hasSpecializedRole = user.roles.some((role) =>
        [
          UserRole.STUDENT,
          UserRole.MENTOR,
          UserRole.WRITER,
          UserRole.SELLER,
        ].includes(role as UserRole)
      );

      if (hasSpecializedRole) {
        throw new AppError(
          "You already have a specialized role. Cannot apply for additional roles.",
          403
        );
      }

      // Check for any existing applications regardless of status
      const existingApplication = await RoleApplicationModel.findOne({
        user: userId,
        status: {
          $in: [ApplicationStatus.PENDING, ApplicationStatus.IN_REVIEW],
        },
      }).session(session);

      if (existingApplication) {
        throw new AppError(
          `You already have a pending application for ${existingApplication.role} role. Please wait for it to be processed.`,
          400
        );
      }

      // Validate role transition
      if (!ROLE_TRANSITIONS[UserRole.USER].possible.includes(data.role as UserRole)) {
        throw new AppError(
          `Cannot apply for ${data.role} role from current roles`,
          400
        );
      }

      // Validate role combination
      const potentialRoles = [...user.roles, data.role as UserRole];
      if (!validateRoleConstraints(potentialRoles)) {
        throw new AppError(
          "The requested role combination is not allowed",
          400
        );
      }

      // Initialize verification steps based on role
      const verificationSteps =
        RoleApplicationService.getRequiredVerificationSteps(
          data.role as UserRole
        );

      // Create application data
      const applicationData = {
        role: data.role,
        fields: data.fields,
        documents: data.documents,
        user: userId,
        verificationSteps,
        status:
          data.role === UserRole.STUDENT
            ? ApplicationStatus.APPROVED // Auto-approve student applications
            : ApplicationStatus.PENDING,
        currentRoles: user.roles,
      };

      const application = await RoleApplicationModel.create([applicationData], {
        session,
      });

      // If it's a student application, update user roles immediately
      if (data.role === UserRole.STUDENT) {
        await UserModel.findByIdAndUpdate(
          userId,
          { $addToSet: { roles: UserRole.STUDENT } },
          { session }
        );

        // Create audit log for role update
        await AuditLogModel.create(
          [
            {
              userId: userId,
              action: "ROLE_APPROVED",
              resource: `user/${userId}`,
              metadata: {
                addedRole: UserRole.STUDENT,
                automatic: true,
              },
              roles: user.roles,
              status: "success",
              userAgent: req.headers["user-agent"] || "unknown",
              ip: req.ip || "unknown",
            },
          ],
          { session }
        );
      }

      // Create audit log for application
      await AuditLogModel.create(
        [
          {
            userId: userId,
            action: "ROLE_APPLICATION",
            resource: `role-application/${application[0]._id}`,
            metadata: {
              role: data.role,
              status: applicationData.status,
              currentRoles: user.roles,
              autoApproved: data.role === UserRole.STUDENT,
            },
            roles: user.roles,
            status: "success",
            userAgent: req.headers["user-agent"] || "unknown",
            ip: req.ip || "unknown",
          },
        ],
        { session }
      );

      // Notify admins (only for non-student applications)
      if (data.role !== UserRole.STUDENT) {
        try {
          await emailService.sendAdminNotification(
            "New Role Application",
            `User ${user.email} has applied for ${data.role} role.`
          );
        } catch (error) {
          console.error("Failed to send admin notification:", error);
        }
      }

      await session.commitTransaction();
      return application[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getMyApplications(userId: string) {
    return RoleApplicationModel.find({
      user: userId,
    }).sort({ createdAt: -1 });
  }

  async getAllApplications() {
    return RoleApplicationModel.find()
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });
  }

  async getApplication(id: string) {
    const application = await RoleApplicationModel.findById(id).populate(
      "user",
      "firstName lastName email"
    );
    if (!application) {
      throw new AppError(`Application with ID ${id} not found`, 404);
    }
    return application;
  }

  async approveApplication(id: string, reviewerId: string) {
    const session = await startSession();
    try {
      session.startTransaction();

      const application = await RoleApplicationModel.findById(id)
        .populate("user", "email roles")
        .session(session);

      if (!application) {
        throw new AppError(`Application with ID ${id} not found`, 404);
      }

      // Verify all steps are completed
      const pendingSteps = application.verificationSteps?.filter(
        (step) => step.status === "pending"
      );
      if (pendingSteps?.length) {
        throw new AppError(
          `Cannot approve application: ${pendingSteps.length} verification steps are still pending`,
          400
        );
      }

      // Validate current roles and new role combination
      const user = application.user as any; // Type assertion for populated user
      const newRoles = [...user.roles, application.role];
      if (!validateRoleConstraints(newRoles)) {
        throw new AppError(
          "The resulting role combination would not be valid",
          400
        );
      }

      // Update user roles and role-specific data
      const updateResult = await UserModel.updateOne(
        { _id: application.user },
        {
          $addToSet: { roles: application.role },
          $set: {
            [`roleSpecificData.${application.role}.verified`]: true,
            [`roleSpecificData.${application.role}.verificationDate`]:
              new Date(),
          },
        },
        { session }
      );

      if (!updateResult.matchedCount) {
        throw new AppError(`User not found for application ${id}`, 404);
      }

      // Update application status
      application.status = ApplicationStatus.APPROVED;
      application.reviewedAt = new Date();
      application.reviewedBy = new Types.ObjectId(reviewerId);
      await application.save({ session });

      // Create audit log
      await AuditLogModel.create(
        [
          {
            userId: new Types.ObjectId(reviewerId),
            action: "ROLE_APPROVED",
            resource: `role-application/${id}`,
            metadata: {
              applicationId: id,
              role: application.role,
              userId: application.user,
              previousRoles: user.roles,
              newRoles,
            },
            status: "success",
            userAgent: "system",
            ip: "127.0.0.1",
          },
        ],
        { session }
      );

      // Clear permission cache
      permissionCache.clearUserPermissions(application.user.toString());

      // Send notification to user
      try {
        await emailService.sendRoleApprovalEmail(user.email, application.role);
      } catch (error) {
        console.error("Failed to send approval notification:", error);
      }

      await session.commitTransaction();
      return application;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async rejectApplication(id: string, reviewerId: string, reason: string) {
    const session = await startSession();
    try {
      session.startTransaction();

      const application = await RoleApplicationModel.findById(id).session(
        session
      );
      if (!application) {
        throw new AppError(`Application with ID ${id} not found`, 404);
      }

      application.status = ApplicationStatus.REJECTED;
      application.reviewedAt = new Date();
      application.reviewedBy = new Types.ObjectId(reviewerId);
      application.rejectionReason = reason;
      await application.save({ session });

      await AuditLogModel.create(
        [
          {
            userId: new Types.ObjectId(reviewerId),
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
        ],
        { session }
      );

      await session.commitTransaction();
      return application;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async updateVerificationStep(
    applicationId: string,
    reviewerId: string,
    stepName: string,
    status: "completed" | "failed",
    notes?: string
  ): Promise<IRoleApplication> {
    const session = await startSession();
    try {
      session.startTransaction();

      // Update the application and get the updated document
      const application = await RoleApplicationModel.findOneAndUpdate(
        {
          _id: applicationId,
          "verificationSteps.name": stepName,
        },
        {
          $set: {
            "verificationSteps.$.status": status,
            "verificationSteps.$.completedAt": new Date(),
            "verificationSteps.$.completedBy": reviewerId,
            "verificationSteps.$.notes": notes,
          },
        },
        {
          new: true,
          session,
          runValidators: true,
        }
      );

      if (!application) {
        throw new AppError(
          `Application with ID ${applicationId} not found or step ${stepName} not found`,
          404
        );
      }

      // Check if all steps are completed
      const allStepsCompleted = application.verificationSteps?.every(
        (s) => s.status === "completed" || s.status === "failed"
      );

      if (allStepsCompleted) {
        const anyStepFailed = application.verificationSteps?.some(
          (s) => s.status === "failed"
        );
        application.status = anyStepFailed
          ? ApplicationStatus.REJECTED
          : ApplicationStatus.APPROVED;

        if (application.status === ApplicationStatus.APPROVED) {
          const updateResult = await UserModel.updateOne(
            { _id: application.user },
            {
              $addToSet: { roles: application.role },
              $set: {
                [`roleSpecificData.${application.role}.verified`]: true,
                [`roleSpecificData.${application.role}.verificationDate`]:
                  new Date(),
              },
            },
            { session }
          );

          if (!updateResult.matchedCount) {
            throw new AppError(
              `User not found for application ${applicationId}`,
              404
            );
          }

          // Clear permission cache
          permissionCache.clearUserPermissions(application.user.toString());
        }
      } else {
        application.status = ApplicationStatus.IN_REVIEW;
      }

      await application.save({ session });

      // Create audit log
      await AuditLogModel.create(
        [
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
        ],
        { session }
      );

      await session.commitTransaction();
      return application;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getApplicationStats() {
    return RoleApplicationModel.aggregate([
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

export default new RoleApplicationService();
