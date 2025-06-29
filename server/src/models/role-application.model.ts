import mongoose, { Document, Schema } from "mongoose";
import { UserRole } from "../config/rbac/types";

export enum ApplicationStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export interface IRoleApplication extends Document {
  user: mongoose.Types.ObjectId;
  role: UserRole;
  status: ApplicationStatus;
  documents: {
    type: string;
    url: string;
    name: string;
    mimeType: string;
    size: number;
  }[];
  fields: Record<string, any>;
  verificationSteps: {
    name: string;
    status: "pending" | "completed" | "failed";
    completedAt?: Date;
    completedBy?: mongoose.Types.ObjectId;
    notes?: string;
  }[];
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const roleApplicationSchema = new Schema<IRoleApplication>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
    },
    documents: [
      {
        type: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        mimeType: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
      },
    ],
    fields: {
      type: Schema.Types.Mixed,
      required: true,
    },
    verificationSteps: [
      {
        name: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "completed", "failed"],
          default: "pending",
        },
        completedAt: Date,
        completedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        notes: String,
      },
    ],
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
roleApplicationSchema.index({ user: 1, role: 1 });
roleApplicationSchema.index({ status: 1 });
roleApplicationSchema.index({ "verificationSteps.status": 1 });
roleApplicationSchema.index({ createdAt: 1 });

export const RoleApplicationModel = mongoose.model<IRoleApplication>(
  "RoleApplication",
  roleApplicationSchema
);
