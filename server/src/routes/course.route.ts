import express from "express";
import { protect, restrictTo } from "../middleware/auth.middleware";
import { UserRole } from "../config/rbac.config";
import courseController from "../controllers/course.controller";
import { validateRequest } from "../middleware/validation.middleware";
import {
  createCourseSchema,
  updateCourseSchema,
} from "../validators/course.validator";

const router = express.Router();

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get all courses
 *     description: Retrieve a list of all published courses
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by course level
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in course title and description
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 */
router.get("/", courseController.getAllCourses);

/**
 * @swagger
 * /api/v1/courses/enrolled:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get enrolled courses
 *     description: Get list of courses the current user is enrolled in
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrolled courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 */
router.get("/enrolled", protect, courseController.getEnrolledCourses);

/**
 * @swagger
 * /api/v1/courses/mentor/courses:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get mentor courses
 *     description: Get list of courses created by the current mentor
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of mentor courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 */
router.get(
  "/mentor/courses",
  protect,
  restrictTo(UserRole.MENTOR),
  courseController.getMentorCourses
);

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get course by ID
 *     description: Get detailed information about a specific course
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 */
router.get("/:id", courseController.getCourse);

// Protected routes
router.use(protect);

/**
 * @swagger
 * /api/v1/courses/{id}/enroll:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Enroll in a course
 *     description: Enroll the current user in a specific course
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Successfully enrolled in course
 *       400:
 *         description: Already enrolled or invalid course
 *       404:
 *         description: Course not found
 */
router.post("/:id/enroll", courseController.enrollInCourse);

/**
 * @swagger
 * /api/v1/courses/{id}/rate:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Rate a course
 *     description: Submit a rating for an enrolled course
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating value between 1 and 5
 *               review:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional review text
 *     responses:
 *       200:
 *         description: Rating submitted successfully
 *       400:
 *         description: Invalid rating or not enrolled in course
 *       404:
 *         description: Course not found
 */
router.post("/:id/rate", courseController.rateCourse);

// Mentor routes
router.use(restrictTo(UserRole.MENTOR));

/**
 * @swagger
 * /api/v1/courses:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Create a new course
 *     description: Create a new course (Mentor only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - shortDescription
 *               - category
 *               - price
 *               - duration
 *               - level
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               shortDescription:
 *                 type: string
 *                 maxLength: 200
 *               category:
 *                 type: string
 *                 description: Category ID
 *               thumbnail:
 *                 type: string
 *                 format: uri
 *               price:
 *                 type: number
 *                 minimum: 0
 *               duration:
 *                 type: number
 *                 minimum: 0
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               topics:
 *                 type: array
 *                 items:
 *                   type: string
 *               prerequisites:
 *                 type: array
 *                 items:
 *                   type: string
 *               objectives:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       $ref: '#/components/schemas/Course'
 */
router
  .route("/")
  .post(validateRequest(createCourseSchema), courseController.createCourse);

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   patch:
 *     tags:
 *       - Courses
 *     summary: Update a course
 *     description: Update an existing course (Mentor only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               shortDescription:
 *                 type: string
 *                 maxLength: 200
 *               thumbnail:
 *                 type: string
 *                 format: uri
 *               price:
 *                 type: number
 *                 minimum: 0
 *               duration:
 *                 type: number
 *                 minimum: 0
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               topics:
 *                 type: array
 *                 items:
 *                   type: string
 *               prerequisites:
 *                 type: array
 *                 items:
 *                   type: string
 *               objectives:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       $ref: '#/components/schemas/Course'
 *   delete:
 *     tags:
 *       - Courses
 *     summary: Delete a course
 *     description: Delete an existing course (Mentor only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       204:
 *         description: Course deleted successfully
 */
router
  .route("/:id")
  .patch(validateRequest(updateCourseSchema), courseController.updateCourse)
  .delete(courseController.deleteCourse);

/**
 * @swagger
 * /api/v1/courses/{id}/publish:
 *   patch:
 *     tags:
 *       - Courses
 *     summary: Publish a course
 *     description: Change course status to published (Mentor only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course published successfully
 */
router.patch("/:id/publish", courseController.publishCourse);

/**
 * @swagger
 * /api/v1/courses/{id}/unpublish:
 *   patch:
 *     tags:
 *       - Courses
 *     summary: Unpublish a course
 *     description: Change course status to draft (Mentor only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course unpublished successfully
 */
router.patch("/:id/unpublish", courseController.unpublishCourse);

export default router;
