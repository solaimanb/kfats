"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionOverrideModel = void 0;
const mongoose_1 = require("mongoose");
const rbac_config_1 = require("../config/rbac.config");
const permissionOverrideSchema = new mongoose_1.Schema({
    role: {
        type: String,
        enum: Object.values(rbac_config_1.UserRole),
        required: true,
        unique: true,
    },
    permissions: [
        {
            type: String,
            required: true,
        },
    ],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});
exports.PermissionOverrideModel = (0, mongoose_1.model)("PermissionOverride", permissionOverrideSchema);
//# sourceMappingURL=permission-override.model.js.map