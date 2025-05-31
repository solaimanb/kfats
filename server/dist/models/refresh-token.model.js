"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenModel = void 0;
const mongoose_1 = require("mongoose");
const refreshTokenSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    issuedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    isRevoked: {
        type: Boolean,
        default: false,
    },
    deviceInfo: {
        ip: String,
        userAgent: String,
        deviceId: String,
    },
}, {
    timestamps: true,
});
refreshTokenSchema.index({ token: 1 }, { unique: true });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user: 1, isRevoked: 1 });
exports.RefreshTokenModel = (0, mongoose_1.model)("RefreshToken", refreshTokenSchema);
//# sourceMappingURL=refresh-token.model.js.map