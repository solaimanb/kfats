"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ErrorCodes = exports.requestTimeout = exports.requestTracker = void 0;
const uuid_1 = require("uuid");
const logger_util_1 = require("../utils/logger.util");
const requestTracker = (req, res, next) => {
    req.id = (0, uuid_1.v4)();
    req.startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - req.startTime;
        logger_util_1.logger.info({
            requestId: req.id,
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('user-agent'),
            ip: req.ip,
        });
    });
    next();
};
exports.requestTracker = requestTracker;
const requestTimeout = (timeout = 30000) => {
    return (req, res, next) => {
        res.setTimeout(timeout, () => {
            logger_util_1.logger.error({
                requestId: req.id,
                message: 'Request timeout',
                url: req.url,
                method: req.method,
            });
            res.status(408).json({
                status: 'error',
                code: 'REQUEST_TIMEOUT',
                message: 'Request took too long to process',
            });
        });
        next();
    };
};
exports.requestTimeout = requestTimeout;
exports.ErrorCodes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
    DATABASE_ERROR: 'DATABASE_ERROR',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INVALID_INPUT: 'INVALID_INPUT',
    SERVER_ERROR: 'SERVER_ERROR',
    BAD_REQUEST: 'BAD_REQUEST',
};
const errorHandler = (err, req, res, _next) => {
    logger_util_1.logger.error({
        requestId: req.id,
        error: {
            name: err.name,
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        },
        request: {
            method: req.method,
            url: req.url,
            body: req.body,
            params: req.params,
            query: req.query,
        },
    });
    let statusCode = 500;
    let errorCode = exports.ErrorCodes.SERVER_ERROR;
    if (err.name === 'ValidationError') {
        statusCode = 400;
        errorCode = exports.ErrorCodes.VALIDATION_ERROR;
    }
    else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        errorCode = exports.ErrorCodes.AUTHENTICATION_ERROR;
    }
    else if (err.name === 'ForbiddenError') {
        statusCode = 403;
        errorCode = exports.ErrorCodes.AUTHORIZATION_ERROR;
    }
    else if (err.name === 'NotFoundError') {
        statusCode = 404;
        errorCode = exports.ErrorCodes.RESOURCE_NOT_FOUND;
    }
    else if (err.code === 11000) {
        statusCode = 409;
        errorCode = exports.ErrorCodes.DUPLICATE_ENTRY;
    }
    res.status(statusCode).json(Object.assign({ status: 'error', code: errorCode, message: err.message, errors: err.errors, requestId: req.id }, (process.env.NODE_ENV === 'development' && { stack: err.stack })));
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=request-handler.middleware.js.map