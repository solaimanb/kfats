import mongoose from "mongoose";
import { logger } from "../utils/logger.util";

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;

class DatabaseService {
  private static instance: DatabaseService;
  private retryCount = 0;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    try {
      if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in environment variables");
      }

      // Configure mongoose
      mongoose.set("strictQuery", true);
      mongoose.set("autoIndex", process.env.NODE_ENV !== "production");

      // Connection options
      const options = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        connectTimeoutMS: 10000,
      };

      // Connect to MongoDB
      await mongoose.connect(process.env.MONGO_URI, options);
      this.isConnected = true;
      this.retryCount = 0;
      logger.info("Successfully connected to MongoDB");

      // Add connection event listeners
      mongoose.connection.on("error", this.handleConnectionError.bind(this));
      mongoose.connection.on(
        "disconnected",
        this.handleDisconnection.bind(this)
      );
      mongoose.connection.on("reconnected", () => {
        logger.info("Reconnected to MongoDB");
      });

      // Monitor memory usage
      this.startMemoryMonitoring();
    } catch (error) {
      await this.handleConnectionError(error);
    }
  }

  private async handleConnectionError(error: any): Promise<void> {
    logger.error("MongoDB connection error:", error);

    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      logger.info(
        `Retrying connection... Attempt ${this.retryCount} of ${MAX_RETRIES}`
      );
      setTimeout(() => this.connect(), RETRY_INTERVAL);
    } else {
      logger.error("Max retry attempts reached. Exiting application...");
      process.exit(1);
    }
  }

  private handleDisconnection(): void {
    logger.warn("MongoDB disconnected");
    if (this.isConnected) {
      this.connect();
    }
  }

  private startMemoryMonitoring(): void {
    setInterval(() => {
      const used = process.memoryUsage();
      logger.info({
        rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(used.external / 1024 / 1024)}MB`,
      });
    }, 300000); // Every 5 minutes
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info("Disconnected from MongoDB");
    }
  }
}

export const dbService = DatabaseService.getInstance();
