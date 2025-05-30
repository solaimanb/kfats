"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_config_1 = require("../config/rbac.config");
const permission_controller_1 = require("../controllers/permission.controller");
const router = express_1.default.Router();
const permissionController = new permission_controller_1.PermissionController();
router.use(auth_middleware_1.protect);
router.use((0, auth_middleware_1.restrictTo)(rbac_config_1.UserRole.ADMIN));
router.get("/", permissionController.getAllPermissions);
router.get("/roles", permissionController.getRolePermissions);
router.get("/roles/:role", permissionController.getRolePermissions);
router.patch("/roles/:role", permissionController.updateRolePermissions);
exports.default = router;
//# sourceMappingURL=permission.route.js.map