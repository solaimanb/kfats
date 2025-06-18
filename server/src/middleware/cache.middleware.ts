import { Request, Response, NextFunction } from "express";
import NodeCache from "node-cache";
import { logger } from "../utils/logger.util";

// Initialize cache with standard TTL of 5 minutes and check period of 10 minutes
const cache = new NodeCache({
  stdTTL: 300,
  checkperiod: 600,
  maxKeys: 1000,
});

// Cache statistics monitoring
setInterval(() => {
  const stats = cache.getStats();
  logger.info({
    message: "Cache statistics",
    hits: stats.hits,
    misses: stats.misses,
    keys: stats.keys,
    ksize: stats.ksize,
    vsize: stats.vsize,
  });
}, 300000); // Every 5 minutes

interface CacheOptions {
  ttl?: number;
  key?: string | ((req: Request) => string);
}

const transformMongooseDoc = (doc: any): any => {
  if (Array.isArray(doc)) {
    return doc.map(transformMongooseDoc);
  }

  if (doc === null || typeof doc !== "object") {
    return doc;
  }

  if (typeof doc.toJSON === "function") {
    return doc.toJSON();
  }

  const transformed: any = {};
  for (const key in doc) {
    if (Object.prototype.hasOwnProperty.call(doc, key)) {
      transformed[key] = transformMongooseDoc(doc[key]);
    }
  }
  return transformed;
};

export const cacheMiddleware = (options: CacheOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") {
      return next();
    }

    const key =
      typeof options.key === "function"
        ? options.key(req)
        : options.key || `${req.originalUrl}`;

    try {
      const cachedResponse = cache.get(key);

      if (cachedResponse) {
        logger.debug(`Cache hit for key: ${key}`);
        return res.json(cachedResponse);
      }

      // Store original res.json method
      const originalJson = res.json.bind(res);

      // Override res.json method to cache the response
      res.json = ((body: any) => {
        // Don't cache error responses
        if (res.statusCode < 400) {
          const transformedBody = transformMongooseDoc(body);
          cache.set(key, transformedBody, options.ttl || 300);
          logger.debug(`Cached response for key: ${key}`);
          return originalJson(transformedBody);
        }
        return originalJson(body);
      }) as Response["json"];

      next();
    } catch (error) {
      logger.error("Cache error:", error);
      next();
    }
  };
};

// Cache cleanup on process exit
process.on("SIGINT", () => {
  cache.close();
  process.exit();
});

// Memory usage monitoring and cache cleanup if needed
const MAX_HEAP_SIZE = 500 * 1024 * 1024; // 500MB

setInterval(() => {
  const used = process.memoryUsage();

  if (used.heapUsed > MAX_HEAP_SIZE) {
    logger.warn("High memory usage detected, clearing cache");
    cache.flushAll();
    global.gc && global.gc(); // Force garbage collection if available
  }
}, 60000); // Check every minute

// Export cache instance for direct access if needed
export { cache };
