import { Schema, model, Document, Types } from "mongoose";
import { UserRole } from "../config/rbac/types";

export interface IAuditLog extends Document {
  userId: Types.ObjectId;
  action: string;
  timestamp: Date;
  status: "success" | "failure";
  details: Record<string, any>;
  resource: string;
  roles: UserRole[];
  errorMessage?: string;
  metadata: {
    ip: string;
    userAgent: string;
    roles?: UserRole[];
    requestBody?: any;
    responseStatus?: number;
    responseBody?: any;
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
    resource: String,
    roles: [
      {
        type: String,
        enum: Object.values(UserRole),
      },
    ],
    errorMessage: String,
    metadata: {
      ip: String,
      userAgent: String,
      roles: [
        {
          type: String,
          enum: Object.values(UserRole),
        },
      ],
      requestBody: Schema.Types.Mixed,
      responseStatus: Number,
      responseBody: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for common queries
auditLogSchema.index({ userId: 1, action: 1 });
auditLogSchema.index({ status: 1, timestamp: -1 });

// Add TTL index to automatically delete old logs (e.g., after 90 days)
auditLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

export const AuditLogModel = model<IAuditLog>("AuditLog", auditLogSchema);
