/**
 * RBAC Version Control
 * -------------------
 * This version number should be incremented whenever there are
 * breaking changes to the RBAC configuration or structure.
 * 
 * Format: MAJOR.MINOR.PATCH
 * - MAJOR: Breaking changes that require client updates
 * - MINOR: Backwards-compatible feature additions
 * - PATCH: Backwards-compatible bug fixes
 */
export const RBAC_VERSION = '1.0.0';

export class RBACVersionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RBACVersionError';
  }
}

export interface RBACVersionInfo {
  version: string;
  compatible: boolean;
  upgradeRequired: boolean;
}

/**
 * Validate version info object
 * @throws {RBACVersionError} If version info is invalid
 */
export function validateVersionInfo(info: unknown): info is RBACVersionInfo {
  if (!info || typeof info !== 'object') {
    throw new RBACVersionError('Version info must be an object');
  }

  const versionInfo = info as RBACVersionInfo;

  if (typeof versionInfo.version !== 'string') {
    throw new RBACVersionError('Version must be a string');
  }
  if (!validateVersion(versionInfo.version)) {
    throw new RBACVersionError('Invalid version format');
  }
  if (typeof versionInfo.compatible !== 'boolean') {
    throw new RBACVersionError('Compatible flag must be a boolean');
  }
  if (typeof versionInfo.upgradeRequired !== 'boolean') {
    throw new RBACVersionError('UpgradeRequired flag must be a boolean');
  }

  return true;
}

export function validateVersion(version: string): boolean {
  const semverRegex = /^\d+\.\d+\.\d+$/;
  return semverRegex.test(version);
}

export function compareVersions(version1: string, version2: string): number {
  if (!validateVersion(version1) || !validateVersion(version2)) {
    throw new RBACVersionError('Invalid version format');
  }

  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (v1Parts[i] !== v2Parts[i]) {
      return v1Parts[i] - v2Parts[i];
    }
  }

  return 0;
}

/**
 * Check if a version is compatible with the current version
 * @param clientVersion The version to check against
 * @returns true if compatible, false otherwise
 * @throws {RBACVersionError} If version format is invalid
 */
export function isCompatibleVersion(clientVersion: string): boolean {
  if (!validateVersion(clientVersion)) {
    throw new RBACVersionError('Invalid version format');
  }

  const [clientMajor] = clientVersion.split('.');
  const [currentMajor] = RBAC_VERSION.split('.');
  
  return clientMajor === currentMajor;
}

/**
 * Get the current RBAC version
 */
export function getCurrentVersion(): string {
  return RBAC_VERSION;
} 