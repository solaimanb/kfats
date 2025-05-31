import { UserRole } from "../config/rbac.config";

class PermissionCache {
  private static instance: PermissionCache;
  private cache: Map<string, string[]>;
  private cacheTimeout: number;
  private lastClearTime: number;

  private constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000;
    this.lastClearTime = Date.now();
  }

  public static getInstance(): PermissionCache {
    if (!PermissionCache.instance) {
      PermissionCache.instance = new PermissionCache();
    }
    return PermissionCache.instance;
  }

  private checkCacheExpiry() {
    const now = Date.now();
    if (now - this.lastClearTime > this.cacheTimeout) {
      this.cache.clear();
      this.lastClearTime = now;
    }
  }

  public getPermissions(userId: string, roles: UserRole[]): string[] | null {
    this.checkCacheExpiry();
    const key = this.getCacheKey(userId, roles);
    return this.cache.get(key) || null;
  }

  public setPermissions(
    userId: string,
    roles: UserRole[],
    permissions: string[]
  ): void {
    this.checkCacheExpiry();
    const key = this.getCacheKey(userId, roles);
    this.cache.set(key, permissions);
  }

  public clearUserPermissions(userId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(userId)) {
        this.cache.delete(key);
      }
    }
  }

  private getCacheKey(userId: string, roles: UserRole[]): string {
    return `${userId}:${roles.sort().join(",")}`;
  }

  public clearAllPermissions(): void {
    this.cache.clear();
    this.lastClearTime = Date.now();
  }
}

export const permissionCache = PermissionCache.getInstance();
