"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_util_1 = require("../utils/logger.util");
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;
class DatabaseService {
    constructor() {
        this.retryCount = 0;
        this.isConnected = false;
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    async connect() {
        try {
            if (!process.env.MONGO_URI) {
                throw new Error("MONGO_URI is not defined in environment variables");
            }
            mongoose_1.default.set("strictQuery", true);
            mongoose_1.default.set("autoIndex", process.env.NODE_ENV !== "production");
            const options = {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                maxPoolSize: 10,
                minPoolSize: 2,
                maxIdleTimeMS: 30000,
                connectTimeoutMS: 10000,
            };
            await mongoose_1.default.connect(process.env.MONGO_URI, options);
            this.isConnected = true;
            this.retryCount = 0;
            logger_util_1.logger.info("Successfully connected to MongoDB");
            mongoose_1.default.connection.on("error", this.handleConnectionError.bind(this));
            mongoose_1.default.connection.on("disconnected", this.handleDisconnection.bind(this));
            mongoose_1.default.connection.on("reconnected", () => {
                logger_util_1.logger.info("Reconnected to MongoDB");
            });
            this.startMemoryMonitoring();
        }
        catch (error) {
            await this.handleConnectionError(error);
        }
    }
    async handleConnectionError(error) {
        logger_util_1.logger.error("MongoDB connection error:", error);
        if (this.retryCount < MAX_RETRIES) {
            this.retryCount++;
            logger_util_1.logger.info(`Retrying connection... Attempt ${this.retryCount} of ${MAX_RETRIES}`);
            setTimeout(() => this.connect(), RETRY_INTERVAL);
        }
        else {
            logger_util_1.logger.error("Max retry attempts reached. Exiting application...");
            process.exit(1);
        }
    }
    handleDisconnection() {
        logger_util_1.logger.warn("MongoDB disconnected");
        if (this.isConnected) {
            this.connect();
        }
    }
    startMemoryMonitoring() {
        setInterval(() => {
            const used = process.memoryUsage();
            logger_util_1.logger.info({
                rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
                external: `${Math.round(used.external / 1024 / 1024)}MB`,
            });
        }, 300000);
    }
    async disconnect() {
        if (this.isConnected) {
            await mongoose_1.default.disconnect();
            this.isConnected = false;
            logger_util_1.logger.info("Disconnected from MongoDB");
        }
    }
}
exports.dbService = DatabaseService.getInstance();
//# sourceMappingURL=database.js.map