const morgan = require("morgan");

/**
 * Configure Morgan logger based on environment
 * @returns {Function} Configured morgan middleware
 */
const setupLogger = () => {
  if (process.env.NODE_ENV === "development") {
    return setupDevelopmentLogger();
  } else {
    return setupProductionLogger();
  }
};

/**
 * Configure development logger with colors and response body
 * @returns {Function} Development morgan middleware
 */
const setupDevelopmentLogger = () => {
  // Response body capture middleware
  const captureResponseBody = (req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
      res.locals.responseBody = body;
      return originalSend.call(this, body);
    };
    next();
  };

  // Custom tokens for logging
  morgan.token("res-body", (req, res) => {
    if (!res.locals.responseBody) return "";
    try {
      const body = JSON.parse(res.locals.responseBody);
      return JSON.stringify(body);
    } catch (e) {
      return res.locals.responseBody.toString();
    }
  });

  // Color functions for better readability
  const getStatusColor = (status) => {
    if (status >= 500) return "\x1b[31m"; // Red for server errors
    if (status >= 400) return "\x1b[33m"; // Yellow for client errors
    if (status >= 300) return "\x1b[36m"; // Cyan for redirects
    if (status >= 200) return "\x1b[32m"; // Green for success
    return "\x1b[0m"; // Default color
  };

  const colors = {
    reset: "\x1b[0m",
    method: "\x1b[35m", // Magenta
    url: "\x1b[36m", // Cyan
    time: "\x1b[33m", // Yellow
    response: "\x1b[90m", // Grey
  };

  // Development format with colors and response body
  const devFormat = (tokens, req, res) => {
    const status = tokens.status(req, res);
    const statusColor = getStatusColor(parseInt(status));

    return [
      `${colors.method}${tokens.method(req, res)}${colors.reset} ${
        colors.url
      }${tokens.url(req, res)}${colors.reset} | ${statusColor}${status}${
        colors.reset
      } - ${colors.time}${tokens["response-time"](req, res)} ms${colors.reset}`,
      `${colors.response}Response: ${tokens["res-body"](req, res)}${
        colors.reset
      }`,
    ].join("\n");
  };

  return [captureResponseBody, morgan(devFormat)];
};

/**
 * Configure production logger with simple format
 * @returns {Function} Production morgan middleware
 */
const setupProductionLogger = () => {
  // Simple, clean format for production
  const prodFormat = (tokens, req, res) => {
    return `${tokens.method(req, res)} ${tokens.url(
      req,
      res
    )} | ${tokens.status(req, res)} - ${tokens["response-time"](req, res)} ms`;
  };

  return morgan(prodFormat);
};

module.exports = { setupLogger };
