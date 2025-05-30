import { Schema, Types, startSession } from "mongoose";
import {
  RoleApplicationModel,
  IRoleApplication,
} from "../models/role-application.model";
import { UserModel } from "../models/user.model";
import { UserRole, ApplicationStatus } from "../config/rbac.config";
import { AppError } from "../utils/error.util";
import { permissionCache } from "../utils/permission-cache.util";
import { AuditLogModel } from "../models/audit-log.model";

interface VerificationStep {
  name: string;
  status: "pending" | "completed" | "failed";
  completedAt?: Date;
  completedBy?: Schema.Types.ObjectId;
  notes?: string;
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
          ];
        case UserRole.SELLER:
          return [...baseSteps, "business_verification", "tax_verification"];
        case UserRole.WRITER:
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

  async createApplication(data: Partial<IRoleApplication>) {
    if (!data.role) {
      throw new AppError("Role is required", 400);
    }

    const session = await startSession();
    try {
      session.startTransaction();

      // Check for existing pending applications
      const existingApplication = await RoleApplicationModel.findOne({
        user: data.user,
        role: data.role,
        status: {
          $in: [ApplicationStatus.PENDING, ApplicationStatus.IN_REVIEW],
        },
      }).session(session);

      if (existingApplication) {
        throw new AppError(
          `You already have a pending application for ${data.role} role`,
          400
        );
      }

      // Initialize verification steps based on role
      const verificationSteps =
        RoleApplicationService.getRequiredVerificationSteps(data.role);

      const application = await RoleApplicationModel.create(
        [
          {
            ...data,
            verificationSteps,
            status: ApplicationStatus.PENDING,
          },
        ],
        { session }
      );

      await AuditLogModel.create(
        [
          {
            userId: data.user,
            action: "ROLE_APPLICATION_CREATED",
            resource: `role-application/${application[0]._id}`,
            metadata: {
              role: data.role,
              status: ApplicationStatus.PENDING,
            },
            status: "success",
          },
        ],
        { session }
      );

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
    return RoleApplicationModel.find({ user: new Types.ObjectId(userId) }).sort(
      { createdAt: -1 }
    );
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

      const application = await RoleApplicationModel.findById(id).session(
        session
      );
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
      application.reviewedBy = new Schema.Types.ObjectId(reviewerId);
      await application.save({ session });

      // Create audit log
      await AuditLogModel.create(
        [
          {
            userId: new Schema.Types.ObjectId(reviewerId),
            action: "ROLE_APPLICATION_APPROVED",
            resource: `role-application/${id}`,
            metadata: {
              applicationId: id,
              role: application.role,
              userId: application.user,
            },
            status: "success",
          },
        ],
        { session }
      );

      // Clear permission cache
      permissionCache.clearUserPermissions(application.user.toString());

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
      application.reviewedBy = new Schema.Types.ObjectId(reviewerId);
      application.rejectionReason = reason;
      await application.save({ session });

      await AuditLogModel.create(
        [
          {
            userId: new Schema.Types.ObjectId(reviewerId),
            action: "ROLE_APPLICATION_REJECTED",
            resource: `role-application/${id}`,
            metadata: {
              applicationId: id,
              role: application.role,
              userId: application.user,
              reason,
            },
            status: "success",
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

      const application = await RoleApplicationModel.findById(
        new Types.ObjectId(applicationId)
      ).session(session);

      if (!application) {
        throw new AppError(
          `Application with ID ${applicationId} not found`,
          404
        );
      }

      const step = application.verificationSteps?.find(
        (s) => s.name === stepName
      );
      if (!step) {
        throw new AppError(`Verification step ${stepName} not found`, 404);
      }

      // Update step
      step.status = status;
      step.completedAt = new Date();
      step.completedBy = new Schema.Types.ObjectId(reviewerId);
      step.notes = notes;

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
            userId: new Schema.Types.ObjectId(reviewerId),
            action: `VERIFICATION_STEP_${status.toUpperCase()}`,
            resource: `role-application/${applicationId}/verification/${stepName}`,
            metadata: {
              applicationId,
              stepName,
              status,
              notes,
            },
            status: "success",
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

export default new RoleApplicationService();
