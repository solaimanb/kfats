"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_config_1 = require("../config/rbac.config");
const category_controller_1 = __importDefault(require("../controllers/category.controller"));
const validation_middleware_1 = require("../middleware/validation.middleware");
const category_validator_1 = require("../validators/category.validator");
const router = express_1.default.Router();
router.get("/", category_controller_1.default.getAllCategories);
router.get("/:id", category_controller_1.default.getCategory);
router.use(auth_middleware_1.protect);
router.use((0, auth_middleware_1.restrictTo)(rbac_config_1.UserRole.ADMIN));
router
    .route("/")
    .post((0, validation_middleware_1.validateRequest)(category_validator_1.createCategorySchema), category_controller_1.default.createCategory);
router
    .route("/:id")
    .patch((0, validation_middleware_1.validateRequest)(category_validator_1.updateCategorySchema), category_controller_1.default.updateCategory)
    .delete(category_controller_1.default.deleteCategory);
exports.default = router;
//# sourceMappingURL=category.route.js.map