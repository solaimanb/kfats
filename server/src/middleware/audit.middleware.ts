import { Request, Response, NextFunction } from "express";
import { Document, Schema } from "mongoose";
import { AuditLogModel, IAuditLog } from "../models/audit-log.model";
import { IUser } from "../models/user.model";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface User extends IUser {
      _id: Schema.Types.ObjectId;
    }
    interface Request {
      user?: User;
    }
  }
}

interface AuditOptions {
  action: string;
  getMetadata?: (req: Request) => Record<string, any>;
}

export const auditLog = (options: AuditOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store the original end function
    const originalEnd = res.end;
    const chunks: Buffer[] = [];

    // Override end function to capture response
    res.end = function (chunk?: any) {
      if (chunk) {
        chunks.push(Buffer.from(chunk));
      }

      // Restore original end function
      res.end = originalEnd;

      // Get response body
      const body = Buffer.concat(chunks).toString("utf8");

      try {
        const metadata = options.getMetadata ? options.getMetadata(req) : {};

        if (req.user?._id) {
          // Create audit log entry
          const logData: Omit<IAuditLog, keyof Document | "timestamp"> = {
            userId: req.user._id,
            action: options.action,
            resource: req.originalUrl ?? "",
            roles: req.user.roles,
            ip: req.ip ?? "unknown",
            userAgent: req.get("user-agent") ?? "unknown",
            metadata: {
              ...metadata,
              requestBody: req.body,
              responseStatus: res.statusCode,
              responseBody: res.statusCode >= 400 ? JSON.parse(body) : undefined,
            },
            status: res.statusCode >= 400 ? "failure" : "success",
            errorMessage:
              res.statusCode >= 400 ? JSON.parse(body).message : undefined,
          };

          AuditLogModel.create(logData).catch((error: Error) => {
            console.error("Error creating audit log:", error);
          });
        }
      } catch (error: unknown) {
        console.error("Error in audit middleware:", error);
      }

      // Call original end function
      return originalEnd.apply(res, arguments as any);
    };

    next();
  };
};

// Predefined audit actions for common operations
export const auditActions = {
  auth: {
    login: "LOGIN",
    logout: "LOGOUT",
    register: "REGISTER",
    passwordReset: "PASSWORD_RESET",
  },
  roles: {
    application: "ROLE_APPLICATION",
    approve: "ROLE_APPROVED",
    reject: "ROLE_REJECTED",
  },
  permissions: {
    grant: "PERMISSION_GRANTED",
    revoke: "PERMISSION_REVOKED",
  },
  profile: {
    update: "PROFILE_UPDATE",
  },
  account: {
    deactivate: "ACCOUNT_DEACTIVATED",
    reactivate: "ACCOUNT_REACTIVATED",
  },
  documents: {
    upload: "DOCUMENT_UPLOADED",
    delete: "DOCUMENT_DELETED",
  },
  courses: {
    create: "COURSE_CREATED",
    update: "COURSE_UPDATED",
    delete: "COURSE_DELETED",
  },
  payments: {
    process: "PAYMENT_PROCESSED",
  },
} as const;
