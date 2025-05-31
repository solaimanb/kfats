"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    app: {
        name: process.env.APP_NAME || "Kushtia Charukola",
        env: process.env.NODE_ENV || "development",
        port: parseInt(process.env.PORT || "5000", 10),
        url: process.env.APP_URL || "http://localhost:5000",
        clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
    },
    jwt: {
        secret: process.env.JWT_SECRET || "your-secret-key",
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN || "7", 10),
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        callbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/v1/auth/google/callback",
    },
    email: {
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587", 10),
        user: process.env.EMAIL_USER || "kfats@gmail.com",
        password: process.env.EMAIL_PASSWORD || "Kf@ts123",
        from: process.env.EMAIL_FROM || "noreply@kfats.com",
    },
    session: {
        secret: process.env.SESSION_SECRET || "your-session-secret",
    },
    cors: {
        origin: ((_a = process.env.CORS_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(",")) || ["http://localhost:3000"],
        credentials: true,
    },
    mongodb: {
        uri: process.env.MONGODB_URI || "mongodb://localhost:27017/kushtia-charukola",
    },
    pagination: {
        defaultPage: 1,
        defaultLimit: 10,
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 100,
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
        apiKey: process.env.CLOUDINARY_API_KEY || "",
        apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    },
};
//# sourceMappingURL=index.js.map