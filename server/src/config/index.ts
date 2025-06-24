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

if (!process.env.APP_NAME) throw new Error('APP_NAME environment variable is required');
if (!process.env.NODE_ENV) throw new Error('NODE_ENV environment variable is required');
if (!process.env.PORT) throw new Error('PORT environment variable is required');
if (!process.env.APP_URL) throw new Error('APP_URL environment variable is required');
if (!process.env.CLIENT_URL) throw new Error('CLIENT_URL environment variable is required');
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
if (!process.env.JWT_EXPIRES_IN) throw new Error('JWT_EXPIRES_IN environment variable is required');
if (!process.env.JWT_COOKIE_EXPIRES_IN) throw new Error('JWT_COOKIE_EXPIRES_IN environment variable is required');
if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET environment variable is required');
if (!process.env.MONGO_URI) throw new Error('MONGO_URI environment variable is required');

export const config: Config = {
  app: {
    name: process.env.APP_NAME,
    env: process.env.NODE_ENV,
    port: parseInt(process.env.PORT, 10),
    url: process.env.APP_URL,
    clientUrl: process.env.CLIENT_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10),
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
  },
  email: {
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT || '0', 10),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || '',
  },
  session: {
    secret: process.env.SESSION_SECRET,
  },
  cors: {
    get origin() {
      return config.app.clientUrl?.replace(/\/$/, '') || '';
    },
    credentials: true,
  },
  mongodb: {
    uri: process.env.MONGO_URI,
  },
  pagination: {
    defaultPage: parseInt(process.env.DEFAULT_PAGE || '1', 10),
    defaultLimit: parseInt(process.env.DEFAULT_LIMIT || '10', 10),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes in milliseconds
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
};
