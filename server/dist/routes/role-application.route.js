"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_config_1 = require("../config/rbac.config");
const role_application_controller_1 = require("../controllers/role-application.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const role_application_validator_1 = require("../validators/role-application.validator");
const router = express_1.default.Router();
const roleApplicationController = new role_application_controller_1.RoleApplicationController();
router.use(auth_middleware_1.protect);
router.post("/", (0, validation_middleware_1.validateRequest)(role_application_validator_1.createRoleApplicationSchema), roleApplicationController.createApplication);
router.get("/my-applications", roleApplicationController.getMyApplications);
router.use((0, auth_middleware_1.restrictTo)(rbac_config_1.UserRole.ADMIN));
router.get("/", roleApplicationController.getAllApplications);
router.get("/stats", roleApplicationController.getApplicationStats);
router.get("/:id", roleApplicationController.getApplication);
router.patch("/:id/approve", roleApplicationController.approveApplication);
router.patch("/:id/reject", roleApplicationController.rejectApplication);
router.post("/:id/verification-steps/:stepName", roleApplicationController.updateVerificationStep);
exports.default = router;
//# sourceMappingURL=role-application.route.js.map