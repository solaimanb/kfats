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
const authController = new auth_controller_1.AuthController();
router.post("/register", (0, validation_middleware_1.validateRequest)(auth_validator_1.registerSchema), authController.register);
router.post("/login", (0, validation_middleware_1.validateRequest)(auth_validator_1.loginSchema), authController.login);
router.post("/forgot-password", (0, validation_middleware_1.validateRequest)(auth_validator_1.forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password/:token", (0, validation_middleware_1.validateRequest)(auth_validator_1.resetPasswordSchema), authController.resetPassword);
router.get("/me", auth_middleware_1.protect, authController.getMe);
router.post("/logout", auth_middleware_1.protect, authController.logout);
router.post("/refresh-token", authController.refreshToken);
exports.default = router;
//# sourceMappingURL=auth.route.js.map