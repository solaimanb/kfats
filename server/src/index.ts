import dotenv from "dotenv";
import express, { Express, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import compression from "compression";
import path from "path";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import cookieParser from "cookie-parser";
import { config } from "./config";

// Load environment variables first
dotenv.config();

// Configuration imports
import "./config/passport.config";
import { swaggerSpec } from "./config/swagger.config";
import { swaggerConfig } from "./config/api.config";
import { httpLogger, logger } from "./utils/logger.util";
import { handleError } from "./utils/error.util";
import {
  requestTracker,
  requestTimeout,
} from "./middleware/request-handler.middleware";
import { cacheMiddleware } from "./middleware/cache.middleware";
import { API_PREFIX } from "./config/api.config";

// Route imports
import userRoutes from "./routes/user.route";
import authRoutes from "./routes/auth.route";
import courseRoutes from "./routes/course.route";
import categoryRoutes from "./routes/category.route";
import oauthRoutes from "./routes/oauth.route";
import roleApplicationRoutes from "./routes/role-application.route";
import permissionRoutes from "./routes/permission.route";

const app: Express = express();

// Basic middleware setup
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Configure CORS
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['set-cookie'],
  })
);

app.use(compression());

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "blob:"],
        fontSrc: ["'self'", "data:"],
        connectSrc: ["'self'", config.cors.origin],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Request tracking and timeout
app.use(requestTracker);
app.use(requestTimeout(30000)); // 30 seconds timeout

// Session setup for OAuth
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.mongodb.uri,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // 1 day
      autoRemove: 'native',
      touchAfter: 24 * 3600 // 24 hours
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax'
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Logging
httpLogger.forEach((middleware) => {
  if (middleware) {
    app.use(middleware);
  }
});

// Static files
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "1d",
    etag: true,
    lastModified: true,
  })
);

// Security headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );
  next();
});

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Documentation
app.get("/", (_req: Request, res: Response) => res.redirect("/api-docs"));
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerConfig)
);

// Cache middleware for specific routes
const defaultCacheOptions = { ttl: 300 }; // 5 minutes
app.use(`${API_PREFIX}/categories`, cacheMiddleware(defaultCacheOptions));
app.use(`${API_PREFIX}/courses`, cacheMiddleware({ ttl: 600 })); // 10 minutes

// API Routes with versioning
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/courses`, courseRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/gAuth`, oauthRoutes);
app.use(`${API_PREFIX}/role-applications`, roleApplicationRoutes);
app.use(`${API_PREFIX}/permissions`, permissionRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "fail",
    code: "RESOURCE_NOT_FOUND",
    message: `Can't find ${req.originalUrl} on this server!`,
    requestId: req.id,
  });
});

// Global error handler
app.use(handleError);

// Graceful shutdown function
const gracefulShutdown = async () => {
  logger.info("Starting graceful shutdown...");
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected");
    process.exit(0);
  } catch (err) {
    logger.error("Error during shutdown:", err);
    process.exit(1);
  }
};

// Server startup
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      serverSelectionTimeoutMS: 30000, // Increased timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      compressors: ["zlib"],
      writeConcern: { w: "majority" },
      readPreference: "primaryPreferred",
      authSource: "admin",
      authMechanism: "SCRAM-SHA-1"
    });
    logger.info("Connected to MongoDB");

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });

    // Graceful shutdown handlers
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  logger.error(err.name, err.message);
  process.exit(1);
});

// Handle unhandled rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
  logger.error(err.name, err.message);
  process.exit(1);
});

startServer();
