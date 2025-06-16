import { Permission, UserRole } from '../../config/rbac/types';

export enum RBACActionType {
  PERMISSION_CHECK = 'PERMISSION_CHECK',
  ROLE_UPGRADE = 'ROLE_UPGRADE',
  ROLE_DOWNGRADE = 'ROLE_DOWNGRADE',
  PERMISSION_GRANT = 'PERMISSION_GRANT',
  PERMISSION_REVOKE = 'PERMISSION_REVOKE',
  VERSION_CHECK = 'VERSION_CHECK'
}

export interface RBACAuditLog {
  timestamp: Date;
  actionType: RBACActionType;
  userId: string;
  success: boolean;
  details: Record<string, unknown>;
  error?: string;
}

export class RBACAuditService {
  private static logs: RBACAuditLog[] = [];

  /**
   * Log a permission check
   */
  static logPermissionCheck(
    userId: string,
    permission: Permission,
    success: boolean,
    error?: string
  ): void {
    this.addLog({
      timestamp: new Date(),
      actionType: RBACActionType.PERMISSION_CHECK,
      userId,
      success,
      details: {
        permission
      },
      error
    });
  }

  /**
   * Log a role upgrade
   */
  static logRoleUpgrade(
    userId: string,
    fromRole: UserRole,
    toRole: UserRole,
    success: boolean,
    error?: string
  ): void {
    this.addLog({
      timestamp: new Date(),
      actionType: RBACActionType.ROLE_UPGRADE,
      userId,
      success,
      details: {
        fromRole,
        toRole
      },
      error
    });
  }

  /**
   * Log a role downgrade
   */
  static logRoleDowngrade(
    userId: string,
    fromRole: UserRole,
    toRole: UserRole,
    success: boolean,
    error?: string
  ): void {
    this.addLog({
      timestamp: new Date(),
      actionType: RBACActionType.ROLE_DOWNGRADE,
      userId,
      success,
      details: {
        fromRole,
        toRole
      },
      error
    });
  }

  /**
   * Log a permission grant
   */
  static logPermissionGrant(
    userId: string,
    permission: Permission,
    success: boolean,
    error?: string
  ): void {
    this.addLog({
      timestamp: new Date(),
      actionType: RBACActionType.PERMISSION_GRANT,
      userId,
      success,
      details: {
        permission
      },
      error
    });
  }

  /**
   * Log a permission revoke
   */
  static logPermissionRevoke(
    userId: string,
    permission: Permission,
    success: boolean,
    error?: string
  ): void {
    this.addLog({
      timestamp: new Date(),
      actionType: RBACActionType.PERMISSION_REVOKE,
      userId,
      success,
      details: {
        permission
      },
      error
    });
  }

  /**
   * Log a version check
   */
  static logVersionCheck(
    userId: string,
    clientVersion: string,
    success: boolean,
    error?: string
  ): void {
    this.addLog({
      timestamp: new Date(),
      actionType: RBACActionType.VERSION_CHECK,
      userId,
      success,
      details: {
        clientVersion
      },
      error
    });
  }

  /**
   * Add a log entry
   */
  private static addLog(log: RBACAuditLog): void {
    this.logs.push(log);
    // In a real application, this would persist to a database
    console.log('RBAC Audit Log:', log);
  }

  /**
   * Get all logs
   */
  static getLogs(): RBACAuditLog[] {
    return [...this.logs];
  }

  /**
   * Get logs by user ID
   */
  static getLogsByUser(userId: string): RBACAuditLog[] {
    return this.logs.filter(log => log.userId === userId);
  }

  /**
   * Get logs by action type
   */
  static getLogsByAction(actionType: RBACActionType): RBACAuditLog[] {
    return this.logs.filter(log => log.actionType === actionType);
  }

  /**
   * Get logs by time range
   */
  static getLogsByTimeRange(startTime: Date, endTime: Date): RBACAuditLog[] {
    return this.logs.filter(log => 
      log.timestamp >= startTime && log.timestamp <= endTime
    );
  }

  /**
   * Clear all logs
   */
  static clearLogs(): void {
    this.logs = [];
  }
} 