"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditActions = exports.auditLog = void 0;
const audit_log_model_1 = require("../models/audit-log.model");
const auditLog = (options) => {
    return async (req, res, next) => {
        const originalEnd = res.end;
        const chunks = [];
        res.end = function (chunk) {
            var _a, _b, _c, _d;
            if (chunk) {
                chunks.push(Buffer.from(chunk));
            }
            res.end = originalEnd;
            const body = Buffer.concat(chunks).toString("utf8");
            try {
                const metadata = options.getMetadata ? options.getMetadata(req) : {};
                if ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) {
                    const logData = {
                        userId: req.user._id,
                        action: options.action,
                        resource: (_b = req.originalUrl) !== null && _b !== void 0 ? _b : "",
                        roles: req.user.roles,
                        ip: (_c = req.ip) !== null && _c !== void 0 ? _c : "unknown",
                        userAgent: (_d = req.get("user-agent")) !== null && _d !== void 0 ? _d : "unknown",
                        metadata: Object.assign(Object.assign({}, metadata), { requestBody: req.body, responseStatus: res.statusCode, responseBody: res.statusCode >= 400 ? JSON.parse(body) : undefined }),
                        status: res.statusCode >= 400 ? "failure" : "success",
                        errorMessage: res.statusCode >= 400 ? JSON.parse(body).message : undefined,
                    };
                    audit_log_model_1.AuditLogModel.create(logData).catch((error) => {
                        console.error("Error creating audit log:", error);
                    });
                }
            }
            catch (error) {
                console.error("Error in audit middleware:", error);
            }
            return originalEnd.apply(res, arguments);
        };
        next();
    };
};
exports.auditLog = auditLog;
exports.auditActions = {
    auth: {
        login: "LOGIN",
        logout: "LOGOUT",
        register: "REGISTER",
        passwordReset: "PASSWORD_RESET",
    },
    roles: {
        application: "ROLE_APPLICATION",
        approve: "ROLE_APPROVED",
        reject: "ROLE_REJECTED",
    },
    permissions: {
        grant: "PERMISSION_GRANTED",
        revoke: "PERMISSION_REVOKED",
    },
    profile: {
        update: "PROFILE_UPDATE",
    },
    account: {
        deactivate: "ACCOUNT_DEACTIVATED",
        reactivate: "ACCOUNT_REACTIVATED",
    },
    documents: {
        upload: "DOCUMENT_UPLOADED",
        delete: "DOCUMENT_DELETED",
    },
    courses: {
        create: "COURSE_CREATED",
        update: "COURSE_UPDATED",
        delete: "COURSE_DELETED",
    },
    payments: {
        process: "PAYMENT_PROCESSED",
    },
};
//# sourceMappingURL=audit.middleware.js.map