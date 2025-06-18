/**
 * RBAC Version Control
 * -------------------
 * Must match server version for compatibility
 */
export const REQUIRED_RBAC_VERSION = '1.0.0';

export class RBACVersionError extends Error {
  constructor(serverVersion: string) {
    super(`RBAC version mismatch. Server: ${serverVersion}, Required: ${REQUIRED_RBAC_VERSION}`);
    this.name = 'RBACVersionError';
  }
}

/**
 * Validate RBAC version from server
 * @throws {RBACVersionError} If versions don't match
 */
export function validateRBACVersion(serverVersion: string): void {
  if (serverVersion !== REQUIRED_RBAC_VERSION) {
    throw new RBACVersionError(serverVersion);
  }
}

/**
 * Check if a version is compatible (same major version)
 */
export function isCompatibleVersion(serverVersion: string): boolean {
  // For now, we only support exact version matches
  // In the future, we could implement semver comparison
  return serverVersion === REQUIRED_RBAC_VERSION;
} 