"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionCache = void 0;
class PermissionCache {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000;
        this.lastClearTime = Date.now();
    }
    static getInstance() {
        if (!PermissionCache.instance) {
            PermissionCache.instance = new PermissionCache();
        }
        return PermissionCache.instance;
    }
    checkCacheExpiry() {
        const now = Date.now();
        if (now - this.lastClearTime > this.cacheTimeout) {
            this.cache.clear();
            this.lastClearTime = now;
        }
    }
    getPermissions(userId, roles) {
        this.checkCacheExpiry();
        const key = this.getCacheKey(userId, roles);
        return this.cache.get(key) || null;
    }
    setPermissions(userId, roles, permissions) {
        this.checkCacheExpiry();
        const key = this.getCacheKey(userId, roles);
        this.cache.set(key, permissions);
    }
    clearUserPermissions(userId) {
        for (const key of this.cache.keys()) {
            if (key.startsWith(userId)) {
                this.cache.delete(key);
            }
        }
    }
    getCacheKey(userId, roles) {
        return `${userId}:${roles.sort().join(",")}`;
    }
    clearAllPermissions() {
        this.cache.clear();
        this.lastClearTime = Date.now();
    }
}
exports.permissionCache = PermissionCache.getInstance();
//# sourceMappingURL=permission-cache.util.js.map