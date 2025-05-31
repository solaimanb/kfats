import express from "express";
import { protect, restrictTo } from "../middleware/auth.middleware";
import { UserRole } from "../config/rbac.config";
import { RoleApplicationController } from "../controllers/role-application.controller";
import { validateRequest } from "../middleware/validation.middleware";
import { createRoleApplicationSchema } from "../validators/role-application.validator";

const router = express.Router();
const roleApplicationController = new RoleApplicationController();

// Protected routes
router.use(protect);

/**
 * @swagger
 * /api/v1/role-applications:
 *   post:
 *     tags:
 *       - Role Applications
 *     summary: Submit a role application
 *     description: Submit an application to request a new role
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestedRole
 *               - qualifications
 *               - experience
 *             properties:
 *               requestedRole:
 *                 type: string
 *                 enum: [mentor, writer, seller]
 *               qualifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     degree:
 *                       type: string
 *                     institution:
 *                       type: string
 *                     year:
 *                       type: number
 *                     field:
 *                       type: string
 *                     certificate:
 *                       type: string
 *               experience:
 *                 type: object
 *                 properties:
 *                   years:
 *                     type: number
 *                   details:
 *                     type: string
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted successfully
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
 *                     application:
 *                       $ref: '#/components/schemas/RoleApplication'
 */
router.post(
  "/",
  validateRequest(createRoleApplicationSchema),
  roleApplicationController.createApplication
);

/**
 * @swagger
 * /api/v1/role-applications/my-applications:
 *   get:
 *     tags:
 *       - Role Applications
 *     summary: Get user's applications
 *     description: Get all role applications submitted by the current user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's applications
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
 *                     applications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RoleApplication'
 */
router.get("/my-applications", roleApplicationController.getMyApplications);

// Admin routes
router.use(restrictTo(UserRole.ADMIN));

/**
 * @swagger
 * /api/v1/role-applications:
 *   get:
 *     tags:
 *       - Role Applications
 *     summary: Get all applications
 *     description: Get all role applications (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by application status
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [mentor, writer, seller]
 *         description: Filter by requested role
 *     responses:
 *       200:
 *         description: List of all applications
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
 *                     applications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RoleApplication'
 */
router.get("/", roleApplicationController.getAllApplications);

/**
 * @swagger
 * /api/v1/role-applications/stats:
 *   get:
 *     tags:
 *       - Role Applications
 *     summary: Get application statistics
 *     description: Get statistics about role applications (Admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Application statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Role name
 *                       stats:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               description: Application status
 *                             count:
 *                               type: number
 *                               description: Number of applications in this status
 *                       total:
 *                         type: number
 *                         description: Total number of applications for this role
 */
router.get("/stats", roleApplicationController.getApplicationStats);

/**
 * @swagger
 * /api/v1/role-applications/{id}:
 *   get:
 *     tags:
 *       - Role Applications
 *     summary: Get application by ID
 *     description: Get detailed information about a specific application (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application details
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
 *                     application:
 *                       $ref: '#/components/schemas/RoleApplication'
 */
router.get("/:id", roleApplicationController.getApplication);

/**
 * @swagger
 * /api/v1/role-applications/{id}/approve:
 *   patch:
 *     tags:
 *       - Role Applications
 *     summary: Approve application
 *     description: Approve a role application (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Review notes
 *     responses:
 *       200:
 *         description: Application approved successfully
 */
router.patch("/:id/approve", roleApplicationController.approveApplication);

/**
 * @swagger
 * /api/v1/role-applications/{id}/reject:
 *   patch:
 *     tags:
 *       - Role Applications
 *     summary: Reject application
 *     description: Reject a role application (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Rejection reason
 *     responses:
 *       200:
 *         description: Application rejected successfully
 */
router.patch("/:id/reject", roleApplicationController.rejectApplication);

/**
 * @swagger
 * /api/v1/role-applications/{id}/verification-steps/{stepName}:
 *   post:
 *     tags:
 *       - Role Applications
 *     summary: Update verification step status
 *     description: Update the status of a verification step for a role application (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *       - in: path
 *         name: stepName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the verification step
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [completed, failed]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification step updated successfully
 */
router.post(
  "/:id/verification-steps/:stepName",
  roleApplicationController.updateVerificationStep
);

export default router;
