"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFail = exports.sendError = exports.sendSuccess = exports.sendResponse = void 0;
const sendResponse = (res, { statusCode = 200, status = "success", message, data, pagination, }) => {
    const response = {
        status,
    };
    if (message)
        response.message = message;
    if (data)
        response.data = data;
    if (pagination)
        response.pagination = pagination;
    res.status(statusCode).json(response);
};
exports.sendResponse = sendResponse;
const sendSuccess = (res, { statusCode = 200, message, data, pagination, }) => {
    (0, exports.sendResponse)(res, {
        statusCode,
        status: "success",
        message,
        data,
        pagination,
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, { statusCode = 500, message = "Internal server error", }) => {
    (0, exports.sendResponse)(res, {
        statusCode,
        status: "error",
        message,
    });
};
exports.sendError = sendError;
const sendFail = (res, { statusCode = 400, message = "Bad request", }) => {
    (0, exports.sendResponse)(res, {
        statusCode,
        status: "fail",
        message,
    });
};
exports.sendFail = sendFail;
//# sourceMappingURL=response.util.js.map