import winston from "winston";
import morgan from "morgan";
import { Request, Response, NextFunction } from "express";
import path from "path";

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Console colors for Morgan
const consoleColors = {
  reset: "\x1b[0m",
  method: "\x1b[35m", // Magenta
  url: "\x1b[36m", // Cyan
  status: {
    error: "\x1b[31m", // Red for 5xx
    warn: "\x1b[33m", // Yellow for 4xx
    redirect: "\x1b[36m", // Cyan for 3xx
    success: "\x1b[32m", // Green for 2xx
  },
  time: "\x1b[33m", // Yellow
  response: "\x1b[90m", // Grey
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: path.join(__dirname, "../../logs/error.log"),
    level: "error",
  }),
  new winston.transports.File({
    filename: path.join(__dirname, "../../logs/all.log"),
  }),
];

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "warn",
  levels: logLevels,
  format,
  transports,
});

// If we're not in production, log to the console
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

const getStatusColor = (status: number): string => {
  if (status >= 500) return consoleColors.status.error;
  if (status >= 400) return consoleColors.status.warn;
  if (status >= 300) return consoleColors.status.redirect;
  if (status >= 200) return consoleColors.status.success;
  return consoleColors.reset;
};

// Custom Morgan token for response body
morgan.token("res-body", (_req: Request, res: Response) => {
  if (!res.locals.responseBody) return "";
  try {
    const body = JSON.parse(res.locals.responseBody);
    return JSON.stringify(body);
  } catch (e) {
    return res.locals.responseBody.toString();
  }
});

// Response body capture middleware
export const captureResponseBody = (_req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  res.send = function (body) {
    res.locals.responseBody = body;
    return originalSend.call(this, body);
  };
  next();
};

// Morgan format based on environment
const getMorganFormat = () => {
  if (process.env.NODE_ENV === "development") {
    return morgan((tokens: any, req: Request, res: Response) => {
      const status = tokens.status(req, res);
      const statusColor = getStatusColor(parseInt(status));
      
      return [
        `${consoleColors.method}${tokens.method(req, res)}${consoleColors.reset} ` +
        `${consoleColors.url}${tokens.url(req, res)}${consoleColors.reset} | ` +
        `${statusColor}${status}${consoleColors.reset} - ` +
        `${consoleColors.time}${tokens["response-time"](req, res)} ms${consoleColors.reset}`,
        tokens["res-body"](req, res) ? 
          `${consoleColors.response}Response: ${tokens["res-body"](req, res)}${consoleColors.reset}` : 
          undefined
      ].filter(Boolean).join("\n");
    }, { stream });
  }
  return morgan('combined', { stream });
};

// Export HTTP request logger middleware
export const httpLogger = [
  process.env.NODE_ENV === "development" ? captureResponseBody : null,
  getMorganFormat(),
].filter(Boolean);
