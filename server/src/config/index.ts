import dotenv from "dotenv";

dotenv.config();

/**
 * Application configuration
 */

export interface Config {
  app: {
    name: string;
    env: string;
    port: number;
    url: string;
    clientUrl: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    cookieExpiresIn: number;
  };
  google: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
  session: {
    secret: string;
  };
  cors: {
    origin: string;
    credentials: boolean;
  };
  mongodb: {
    uri: string;
  };
  pagination: {
    defaultPage: number;
    defaultLimit: number;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
}

export const config: Config = {
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
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      "http://localhost:5000/api/v1/auth/google/callback",
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
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
  mongodb: {
    uri:
      process.env.MONGODB_URI || "mongodb://localhost:27017/kushtia-charukola",
  },
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
};
