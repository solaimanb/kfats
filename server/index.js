/**
 * @fileoverview Main application entry point for the Kushtia Charukola API
 * @description Express server configuration with MongoDB connection, middleware setup,
 * route handlers, and error handling
 * @author Kushtia Fine Arts & Technology School Team
 * @version 1.0.0
 */

require("dotenv").config();
require("./config/passport");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerConfig");
const compression = require("compression");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const morgan = require("morgan");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const { setupLogger } = require("./utils/logger");
const config = require("./config");

/**
 * Route Handlers
 * @description Sets up user and authentication routes
 */
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courseRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const { handleError } = require("./utils/errorHandler");
const oauthRoutes = require("./routes/oauth");

const app = express();

/**
 * Configure application middleware
 * @description Sets up CORS, JSON parsing, and security headers
 */
// CORS Configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Cookie"],
  exposedHeaders: ["set-cookie"],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply middleware
app.set('trust proxy', 1); // trust first proxy
app.use(cookieParser());
app.use(cors(config.cors));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(compression());

app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for Swagger UI
    crossOriginEmbedderPolicy: false, // Disable for Swagger UI
  })
);

// OAUTH
app.use(session(config.session));

app.use(passport.initialize());
app.use(passport.session());

// Rate limiting configuration
const limiter = rateLimit(config.rateLimit);
app.use("/api/", limiter);

// Request logger
const logger = setupLogger();
if (Array.isArray(logger)) {
  logger.forEach((middleware) => app.use(middleware));
} else {
  app.use(logger);
}

app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "1d",
    etag: true,
    lastModified: true,
  })
);

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "img-src 'self' data: blob:; " +
    "font-src 'self' data:; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none'; " +
    "form-action 'self';"
  );

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

/**
 * Configure application routes
 * @description Sets up API endpoints and documentation
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/", (req, res) => res.redirect("/api-docs"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/gAuth", oauthRoutes);

/**
 * Global error handling middleware
 * @description Handles 404 and 500 errors
 */
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

app.use(handleError);

/**
 * Initialize server and database connection
 * @description Connects to MongoDB and starts the Express server
 */
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Unhandled rejection handler
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});
