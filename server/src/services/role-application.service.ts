import { Schema, FilterQuery, Types } from "mongoose";
import {
  RoleApplicationModel,
  IRoleApplication,
} from "../models/role-application.model";
import { UserModel } from "../models/user.model";
import { UserRole, ApplicationStatus } from "../config/rbac.config";
import { AppError } from "../utils/error.util";
import { permissionCache } from "../utils/permission-cache.util";
import { AuditLogModel } from "../models/audit-Log.model";

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

    // Initialize verification steps based on role
    const verificationSteps =
      RoleApplicationService.getRequiredVerificationSteps(data.role);
    return RoleApplicationModel.create({ ...data, verificationSteps });
  }

  async getMyApplications(userId: string) {
    return RoleApplicationModel.find({ user: new Types.ObjectId(userId) });
  }

  async getAllApplications() {
    return RoleApplicationModel.find().populate(
      "user",
      "firstName lastName email"
    );
  }

  async getApplication(id: string) {
    const application = await RoleApplicationModel.findById(id).populate(
      "user",
      "firstName lastName email"
    );
    if (!application) {
      throw new AppError("Application not found", 404);
    }
    return application;
  }

  async approveApplication(id: string) {
    const application = await RoleApplicationModel.findByIdAndUpdate(
      id,
      { status: "approved", reviewedAt: new Date() },
      { new: true }
    );
    if (!application) {
      throw new AppError("Application not found", 404);
    }
    return application;
  }

  async rejectApplication(id: string) {
    const application = await RoleApplicationModel.findByIdAndUpdate(
      id,
      { status: "rejected", reviewedAt: new Date() },
      { new: true }
    );
    if (!application) {
      throw new AppError("Application not found", 404);
    }
    return application;
  }

  static async getApplications(filters: FilterQuery<IRoleApplication> = {}) {
    return RoleApplicationModel.find(filters)
      .populate("userId", "email profile")
      .sort({ submittedAt: -1 });
  }

  static async getApplicationById(id: string) {
    const application = await RoleApplicationModel.findById(
      new Schema.Types.ObjectId(id)
    ).populate("userId", "email profile");
    if (!application) {
      throw new AppError("Application not found", 404);
    }
    return application;
  }

  static async updateVerificationStep(
    applicationId: string,
    reviewerId: string,
    stepName: string,
    status: "completed" | "failed",
    notes?: string
  ): Promise<IRoleApplication> {
    const application = await RoleApplicationModel.findById(
      new Schema.Types.ObjectId(applicationId)
    );
    if (!application) {
      throw new AppError("Application not found", 404);
    }

    const step = application.verificationSteps?.find(
      (s) => s.name === stepName
    );
    if (!step) {
      throw new AppError("Verification step not found", 404);
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
      // If any step failed, reject the application
      const anyStepFailed = application.verificationSteps?.some(
        (s) => s.status === "failed"
      );
      application.status = anyStepFailed
        ? ApplicationStatus.REJECTED
        : ApplicationStatus.APPROVED;

      if (application.status === ApplicationStatus.APPROVED) {
        // Update user roles
        const user = await UserModel.findById(application.user);
        if (user) {
          user.roles = [...user.roles, application.role];
          await user.save();

          // Clear permission cache
          permissionCache.clearUserPermissions(user._id.toString());
        }
      }
    } else {
      application.status = ApplicationStatus.IN_REVIEW;
    }

    await application.save();

    // Create audit log
    await AuditLogModel.create({
      userId: new Schema.Types.ObjectId(reviewerId),
      action:
        step.status === "completed"
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
