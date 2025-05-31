"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_config_1 = require("../config/rbac.config");
const user_controller_1 = require("../controllers/user.controller");
const router = express_1.default.Router();
const userController = new user_controller_1.UserController();
router.use(auth_middleware_1.protect);
router.get("/profile", userController.getProfile);
router.patch("/profile", userController.updateProfile);
router.patch("/password", userController.updatePassword);
router.use((0, auth_middleware_1.restrictTo)(rbac_config_1.UserRole.ADMIN));
router
    .route("/")
    .get(userController.getAllUsers)
    .post(userController.createUser);
router
    .route("/:id")
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);
exports.default = router;
//# sourceMappingURL=user.route.js.map