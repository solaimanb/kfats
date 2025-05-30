"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_config_1 = require("../config/rbac.config");
const course_controller_1 = __importDefault(require("../controllers/course.controller"));
const validation_middleware_1 = require("../middleware/validation.middleware");
const course_validator_1 = require("../validators/course.validator");
const router = express_1.default.Router();
router.get("/", course_controller_1.default.getAllCourses);
router.get("/:id", course_controller_1.default.getCourse);
router.use(auth_middleware_1.protect);
router.get("/enrolled", course_controller_1.default.getEnrolledCourses);
router.post("/:id/enroll", course_controller_1.default.enrollInCourse);
router.post("/:id/rate", course_controller_1.default.rateCourse);
router.use((0, auth_middleware_1.restrictTo)(rbac_config_1.UserRole.MENTOR));
router
    .route("/")
    .post((0, validation_middleware_1.validateRequest)(course_validator_1.createCourseSchema), course_controller_1.default.createCourse);
router
    .route("/:id")
    .patch((0, validation_middleware_1.validateRequest)(course_validator_1.updateCourseSchema), course_controller_1.default.updateCourse)
    .delete(course_controller_1.default.deleteCourse);
router.patch("/:id/publish", course_controller_1.default.publishCourse);
router.patch("/:id/unpublish", course_controller_1.default.unpublishCourse);
exports.default = router;
//# sourceMappingURL=course.route.js.map