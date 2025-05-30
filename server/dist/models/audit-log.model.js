"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const rbac_config_1 = require("../config/rbac.config");
const auditLogSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    action: {
        type: String,
        required: true,
        enum: [
            "LOGIN",
            "LOGOUT",
            "REGISTER",
            "PASSWORD_RESET",
            "ROLE_APPLICATION",
            "ROLE_APPROVED",
            "ROLE_REJECTED",
            "PERMISSION_GRANTED",
            "PERMISSION_REVOKED",
            "PROFILE_UPDATE",
            "ACCOUNT_DEACTIVATED",
            "ACCOUNT_REACTIVATED",
            "DOCUMENT_UPLOADED",
            "DOCUMENT_DELETED",
            "COURSE_CREATED",
            "COURSE_UPDATED",
            "COURSE_DELETED",
            "PAYMENT_PROCESSED",
        ],
    },
    resource: {
        type: String,
        required: true,
    },
    roles: {
        type: [String],
        enum: Object.values(rbac_config_1.UserRole),
        required: true,
    },
    ip: {
        type: String,
        required: true,
    },
    userAgent: {
        type: String,
        required: true,
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    status: {
        type: String,
        enum: ["success", "failure"],
        required: true,
    },
    errorMessage: String,
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ status: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.statics.logActivity = async function (data) {
    return this.create(data);
};
auditLogSchema.statics.getRecentActivity = async function (userId, limit = 10) {
    return this.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate("userId", "email profile.firstName profile.lastName");
};
exports.AuditLogModel = mongoose_1.default.model("AuditLog", auditLogSchema);
//# sourceMappingURL=audit-log.model.js.map