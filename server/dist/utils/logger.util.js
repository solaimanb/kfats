"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = exports.captureResponseBody = exports.stream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
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
const consoleColors = {
    reset: "\x1b[0m",
    method: "\x1b[35m",
    url: "\x1b[36m",
    status: {
        error: "\x1b[31m",
        warn: "\x1b[33m",
        redirect: "\x1b[36m",
        success: "\x1b[32m",
    },
    time: "\x1b[33m",
    response: "\x1b[90m",
};
winston_1.default.addColors(colors);
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
const transports = [
    new winston_1.default.transports.Console(),
    new winston_1.default.transports.File({
        filename: path_1.default.join(__dirname, "../../logs/error.log"),
        level: "error",
    }),
    new winston_1.default.transports.File({
        filename: path_1.default.join(__dirname, "../../logs/all.log"),
    }),
];
exports.logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : "warn",
    levels: logLevels,
    format,
    transports,
});
if (process.env.NODE_ENV !== "production") {
    exports.logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.simple(),
    }));
}
exports.stream = {
    write: (message) => {
        exports.logger.http(message.trim());
    },
};
const getStatusColor = (status) => {
    if (status >= 500)
        return consoleColors.status.error;
    if (status >= 400)
        return consoleColors.status.warn;
    if (status >= 300)
        return consoleColors.status.redirect;
    if (status >= 200)
        return consoleColors.status.success;
    return consoleColors.reset;
};
morgan_1.default.token("res-body", (_req, res) => {
    if (!res.locals.responseBody)
        return "";
    try {
        const body = JSON.parse(res.locals.responseBody);
        return JSON.stringify(body);
    }
    catch (e) {
        return res.locals.responseBody.toString();
    }
});
const captureResponseBody = (_req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
        res.locals.responseBody = body;
        return originalSend.call(this, body);
    };
    next();
};
exports.captureResponseBody = captureResponseBody;
const getMorganFormat = () => {
    if (process.env.NODE_ENV === "development") {
        return (0, morgan_1.default)((tokens, req, res) => {
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
        }, { stream: exports.stream });
    }
    return (0, morgan_1.default)('combined', { stream: exports.stream });
};
exports.httpLogger = [
    process.env.NODE_ENV === "development" ? exports.captureResponseBody : null,
    getMorganFormat(),
].filter(Boolean);
//# sourceMappingURL=logger.util.js.map