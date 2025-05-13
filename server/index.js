/**
 * @fileoverview Main application entry point for the Kushtia Charukola API
 * @description Express server configuration with MongoDB connection, middleware setup,
 * route handlers, and error handling
 * @author Kushtia Fine Arts & Technology School Team
 * @version 1.0.0
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerConfig");
const compression = require("compression");
const path = require("path");
require("dotenv").config();

/**
 * Route Handlers
 * @description Sets up user and authentication routes
 */
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/auth");

const app = express();

/**
 * Configure application middleware
 * @description Sets up CORS, JSON parsing, and security headers
 */
app.use(compression());
app.use(cors());
app.use(express.json());

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
app.get("/", (req, res) => res.redirect("/api-docs"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

/**
 * Global error handling middleware
 * @description Handles 404 and 500 errors
 */

app.use((req, res) => res.status(404).json({ error: "Not Found" }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

/**
 * Initialize server and database connection
 * @description Connects to MongoDB and starts the Express server
 */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch(console.error);
