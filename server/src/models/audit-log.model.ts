import mongoose, { Document, Schema } from "mongoose";
import { UserRole } from "../config/rbac.config";

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  roles: UserRole[];
  ip: string;
  userAgent: string;
  metadata?: Record<string, any>;
  status: "success" | "failure";
  errorMessage?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN",
        "LOGOUT",
        "REGISTER",
        "PASSWORD_RESET",
        "ROLE_APPLICATION",
        "ROLE_APPROVED",
        "ROLE_REJECTED",
        "PERMISSION_GRANTED",
        "PERMISSION_REVOKED",
        "PROFILE_UPDATE",
        "ACCOUNT_DEACTIVATED",
        "ACCOUNT_REACTIVATED",
        "DOCUMENT_UPLOADED",
        "DOCUMENT_DELETED",
        "COURSE_CREATED",
        "COURSE_UPDATED",
        "COURSE_DELETED",
        "PAYMENT_PROCESSED",
      ],
    },
    resource: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      enum: Object.values(UserRole),
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ["success", "failure"],
      required: true,
    },
    errorMessage: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ status: 1 });
auditLogSchema.index({ timestamp: -1 });

// Static method to create audit log entry
auditLogSchema.statics.logActivity = async function (
  data: Omit<IAuditLog, keyof Document | "timestamp">
) {
  return this.create(data);
};

// Static method to get recent activity for a user
auditLogSchema.statics.getRecentActivity = async function (
  userId: string,
  limit: number = 10
) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate("userId", "email profile.firstName profile.lastName");
};

export const AuditLogModel = mongoose.model<IAuditLog>(
  "AuditLog",
  auditLogSchema
);
