import { Schema } from 'mongoose';
import { AuditLogModel } from '../models/audit-log.model';

interface AuditLogEntry {
  userId: string | Schema.Types.ObjectId;
  action: string;
  status: 'success' | 'failure';
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

export class AuditLogger {
  /**
   * Log an RBAC-related action
   */
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      await AuditLogModel.create({
        userId: entry.userId,
        action: entry.action,
        timestamp: new Date(),
        status: entry.status,
        details: entry.details || {},
        metadata: {
          ip: entry.ip || 'unknown',
          userAgent: entry.userAgent || 'unknown'
        }
      });
    } catch (error) {
      // Log to error monitoring service in production
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Get audit logs for a specific user
   */
  static async getUserLogs(userId: string | Schema.Types.ObjectId, limit = 100): Promise<any[]> {
    return AuditLogModel.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get audit logs for a specific action
   */
  static async getActionLogs(action: string, limit = 100): Promise<any[]> {
    return AuditLogModel.find({ action })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get failed action logs
   */
  static async getFailedLogs(limit = 100): Promise<any[]> {
    return AuditLogModel.find({ status: 'failure' })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  }
} 