"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const compression_1 = __importDefault(require("compression"));
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
dotenv_1.default.config();
require("./config/passport.config");
const swagger_config_1 = require("./config/swagger.config");
const api_config_1 = require("./config/api.config");
const logger_util_1 = require("./utils/logger.util");
const error_handler_util_1 = require("./utils/error-handler.util");
const request_handler_middleware_1 = require("./middleware/request-handler.middleware");
const cache_middleware_1 = require("./middleware/cache.middleware");
const api_config_2 = require("./config/api.config");
const user_route_1 = __importDefault(require("./routes/user.route"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const course_route_1 = __importDefault(require("./routes/course.route"));
const category_route_1 = __importDefault(require("./routes/category.route"));
const oauth_route_1 = __importDefault(require("./routes/oauth.route"));
const role_application_route_1 = __importDefault(require("./routes/role-application.route"));
const permission_route_1 = __importDefault(require("./routes/permission.route"));
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "10kb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10kb" }));
app.use((0, cors_1.default)());
app.use((0, compression_1.default)());
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            imgSrc: ["'self'", "data:", "blob:"],
            fontSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            frameAncestors: ["'none'"],
            formAction: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
app.use(request_handler_middleware_1.requestTracker);
app.use((0, request_handler_middleware_1.requestTimeout)(30000));
app.use((0, express_session_1.default)({
    secret: process.env.JWT_SECRET || "kushtia_charukola_fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
    },
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api/", limiter);
logger_util_1.httpLogger.forEach((middleware) => {
    if (middleware) {
        app.use(middleware);
    }
});
app.use(express_1.default.static(path_1.default.join(__dirname, "public"), {
    maxAge: "1d",
    etag: true,
    lastModified: true,
}));
app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    next();
});
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "success",
        message: "Server is healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
app.get("/", (_req, res) => res.redirect("/api-docs"));
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_config_1.swaggerSpec, api_config_1.swaggerConfig));
const defaultCacheOptions = { ttl: 300 };
app.use(`${api_config_2.API_PREFIX}/categories`, (0, cache_middleware_1.cacheMiddleware)(defaultCacheOptions));
app.use(`${api_config_2.API_PREFIX}/courses`, (0, cache_middleware_1.cacheMiddleware)({ ttl: 600 }));
app.use(`${api_config_2.API_PREFIX}/users`, user_route_1.default);
app.use(`${api_config_2.API_PREFIX}/auth`, auth_route_1.default);
app.use(`${api_config_2.API_PREFIX}/courses`, course_route_1.default);
app.use(`${api_config_2.API_PREFIX}/categories`, category_route_1.default);
app.use(`${api_config_2.API_PREFIX}/gAuth`, oauth_route_1.default);
app.use(`${api_config_2.API_PREFIX}/role-applications`, role_application_route_1.default);
app.use(`${api_config_2.API_PREFIX}/permissions`, permission_route_1.default);
app.use((req, res) => {
    res.status(404).json({
        status: "fail",
        code: "RESOURCE_NOT_FOUND",
        message: `Can't find ${req.originalUrl} on this server!`,
        requestId: req.id,
    });
});
app.use(error_handler_util_1.handleError);
const gracefulShutdown = async () => {
    logger_util_1.logger.info("Starting graceful shutdown...");
    try {
        await mongoose_1.default.disconnect();
        logger_util_1.logger.info("MongoDB disconnected");
        process.exit(0);
    }
    catch (err) {
        logger_util_1.logger.error("Error during shutdown:", err);
        process.exit(1);
    }
};
const startServer = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        logger_util_1.logger.info("Connected to MongoDB");
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            logger_util_1.logger.info(`Server running on port ${port}`);
        });
        process.on("SIGTERM", gracefulShutdown);
        process.on("SIGINT", gracefulShutdown);
    }
    catch (err) {
        logger_util_1.logger.error("Failed to start server:", err);
        process.exit(1);
    }
};
process.on("uncaughtException", (err) => {
    logger_util_1.logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    logger_util_1.logger.error(err.name, err.message);
    process.exit(1);
});
process.on("unhandledRejection", (err) => {
    logger_util_1.logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
    logger_util_1.logger.error(err.name, err.message);
    process.exit(1);
});
startServer();
//# sourceMappingURL=index.js.map