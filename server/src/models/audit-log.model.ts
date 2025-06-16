import { Schema, model, Document, Types } from "mongoose";
import { UserRole } from "../config/rbac/types";

interface IAuditLog extends Document {
  userId: Types.ObjectId;
  action: string;
  timestamp: Date;
  status: "success" | "failure";
  details: Record<string, any>;
  metadata: {
    ip: string;
    userAgent: string;
    roles?: UserRole[];
  };
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ["success", "failure"],
      required: true,
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      ip: String,
      userAgent: String,
      roles: [
        {
          type: String,
          enum: Object.values(UserRole),
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for common queries
auditLogSchema.index({ userId: 1, action: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ status: 1, timestamp: -1 });

// Add TTL index to automatically delete old logs (e.g., after 90 days)
auditLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

export const AuditLogModel = model<IAuditLog>("AuditLog", auditLogSchema);
