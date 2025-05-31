"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_validator_1 = require("../validators/auth.validator");
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
router.post("/register", (0, validation_middleware_1.validateRequest)(auth_validator_1.registerSchema), auth_controller_1.AuthController.register);
router.post("/login", (0, validation_middleware_1.validateRequest)(auth_validator_1.loginSchema), auth_controller_1.AuthController.login);
router.post("/forgot-password", (0, validation_middleware_1.validateRequest)(auth_validator_1.forgotPasswordSchema), auth_controller_1.AuthController.forgotPassword);
router.post("/reset-password/:token", (0, validation_middleware_1.validateRequest)(auth_validator_1.resetPasswordSchema), auth_controller_1.AuthController.resetPassword);
router.post("/logout", auth_middleware_1.protect, auth_controller_1.AuthController.logout);
router.post("/logout-all", auth_middleware_1.protect, auth_controller_1.AuthController.logoutAllDevices);
router.post("/refresh-token", auth_controller_1.AuthController.refreshToken);
exports.default = router;
//# sourceMappingURL=auth.route.js.map