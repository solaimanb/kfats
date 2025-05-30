"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = exports.cacheMiddleware = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const logger_util_1 = require("../utils/logger.util");
const cache = new node_cache_1.default({
    stdTTL: 300,
    checkperiod: 600,
    maxKeys: 1000,
});
exports.cache = cache;
setInterval(() => {
    const stats = cache.getStats();
    logger_util_1.logger.info({
        message: 'Cache statistics',
        hits: stats.hits,
        misses: stats.misses,
        keys: stats.keys,
        ksize: stats.ksize,
        vsize: stats.vsize,
    });
}, 300000);
const cacheMiddleware = (options = {}) => {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }
        const key = typeof options.key === 'function'
            ? options.key(req)
            : options.key || `${req.originalUrl}`;
        try {
            const cachedResponse = cache.get(key);
            if (cachedResponse) {
                logger_util_1.logger.debug(`Cache hit for key: ${key}`);
                return res.json(cachedResponse);
            }
            const originalJson = res.json.bind(res);
            res.json = ((body) => {
                if (res.statusCode < 400) {
                    cache.set(key, body, options.ttl || 300);
                    logger_util_1.logger.debug(`Cached response for key: ${key}`);
                }
                return originalJson(body);
            });
            next();
        }
        catch (error) {
            logger_util_1.logger.error('Cache error:', error);
            next();
        }
    };
};
exports.cacheMiddleware = cacheMiddleware;
process.on('SIGINT', () => {
    cache.close();
    process.exit();
});
const MAX_HEAP_SIZE = 500 * 1024 * 1024;
setInterval(() => {
    const used = process.memoryUsage();
    if (used.heapUsed > MAX_HEAP_SIZE) {
        logger_util_1.logger.warn('High memory usage detected, clearing cache');
        cache.flushAll();
        global.gc && global.gc();
    }
}, 60000);
//# sourceMappingURL=cache.middleware.js.map