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

/**
 * Route Handlers
 * @description Sets up user and authentication routes
 */
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courseRoutes");
const { handleError } = require("./utils/errorHandler");
const oauthRoutes = require("./routes/oauth");

const app = express();

/**
 * Configure application middleware
 * @description Sets up CORS, JSON parsing, and security headers
 */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cors());
app.use(compression());

app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for Swagger UI
    crossOriginEmbedderPolicy: false, // Disable for Swagger UI
  })
);

// OAUTH
app.use(
  session({
    secret: process.env.JWT_SECRET || "kushtia_charukola_fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});
app.use("/api/", limiter);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
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
