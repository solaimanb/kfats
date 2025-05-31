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
exports.RoleApplicationModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const rbac_config_1 = require("../config/rbac.config");
const roleApplicationSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    role: {
        type: String,
        enum: Object.values(rbac_config_1.UserRole),
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(rbac_config_1.ApplicationStatus),
        default: rbac_config_1.ApplicationStatus.PENDING,
    },
    documents: [
        {
            type: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            mimeType: {
                type: String,
                required: true,
            },
            size: {
                type: Number,
                required: true,
            },
        },
    ],
    fields: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
    },
    verificationSteps: [
        {
            name: {
                type: String,
                required: true,
            },
            status: {
                type: String,
                enum: ["pending", "completed", "failed"],
                default: "pending",
            },
            completedAt: Date,
            completedBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "User",
            },
            notes: String,
        },
    ],
    reviewedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    reviewedAt: Date,
    rejectionReason: String,
}, {
    timestamps: true,
});
roleApplicationSchema.index({ user: 1, role: 1 });
roleApplicationSchema.index({ status: 1 });
roleApplicationSchema.index({ "verificationSteps.status": 1 });
roleApplicationSchema.index({ createdAt: 1 });
exports.RoleApplicationModel = mongoose_1.default.model("RoleApplication", roleApplicationSchema);
//# sourceMappingURL=role-application.model.js.map