import { 
  RBAC_VERSION, 
  RBACVersionError, 
  validateVersion, 
  compareVersions, 
  isCompatibleVersion 
} from '../../config/rbac/version';

export class RBACVersionService {
  /**
   * Get the current RBAC version
   */
  static getCurrentVersion(): string {
    return RBAC_VERSION;
  }

  /**
   * Check if a version is compatible with the current version
   * @throws {RBACVersionError} If version format is invalid
   */
  static isVersionCompatible(version: string): boolean {
    if (!validateVersion(version)) {
      throw new RBACVersionError('Invalid version format');
    }
    return isCompatibleVersion(version);
  }

  /**
   * Validate version format
   */
  static isValidVersionFormat(version: string): boolean {
    return validateVersion(version);
  }

  /**
   * Compare two versions
   * @throws {RBACVersionError} If either version format is invalid
   */
  static compareVersions(version1: string, version2: string): number {
    // Let the imported compareVersions handle validation
    return compareVersions(version1, version2);
  }

  /**
   * Check if a version upgrade is required
   * @throws {RBACVersionError} If version format is invalid
   */
  static isUpgradeRequired(clientVersion: string): boolean {
    // Let compareVersions handle validation
    return this.compareVersions(RBAC_VERSION, clientVersion) > 0;
  }

  /**
   * Get version compatibility message
   */
  static getVersionCompatibilityMessage(clientVersion: string): string {
    try {
      if (!this.isValidVersionFormat(clientVersion)) {
        return 'Invalid version format';
      }

      if (this.isVersionCompatible(clientVersion)) {
        return 'Version is compatible';
      }

      if (this.isUpgradeRequired(clientVersion)) {
        return `Upgrade required: Current version is ${RBAC_VERSION}, client version is ${clientVersion}`;
      }

      return `Incompatible version: Server version ${RBAC_VERSION} is not compatible with client version ${clientVersion}`;
    } catch (error) {
      if (error instanceof RBACVersionError) {
        return error.message;
      }
      throw error;
    }
  }
}