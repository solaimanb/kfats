import express from "express";
import { protect, restrictTo } from "../middleware/auth.middleware";
import { UserRole } from "../config/rbac.config";
import { PermissionController } from "../controllers/permission.controller";

const router = express.Router();
const permissionController = new PermissionController();

// Protected admin routes
router.use(protect);
router.use(restrictTo(UserRole.ADMIN));

/**
 * @swagger
 * /api/v1/permissions:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Get all permissions
 *     description: Retrieve a list of all system permissions (Admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all permissions
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
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get("/", permissionController.getAllPermissions);

/**
 * @swagger
 * /api/v1/permissions/roles:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Get all role permissions
 *     description: Get permissions for all roles (Admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions by role
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
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: string
 */
router.get("/roles", permissionController.getRolePermissions);

/**
 * @swagger
 * /api/v1/permissions/roles/{role}:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Get role permissions
 *     description: Get permissions for a specific role (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [student, mentor, writer, seller, admin]
 *         description: Role name
 *     responses:
 *       200:
 *         description: Role permissions
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
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *   patch:
 *     tags:
 *       - Permissions
 *     summary: Update role permissions
 *     description: Update permissions for a specific role (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [student, mentor, writer, seller, admin]
 *         description: Role name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of permission names
 *     responses:
 *       200:
 *         description: Permissions updated successfully
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
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get("/roles/:role", permissionController.getRolePermissions);
router.patch("/roles/:role", permissionController.updateRolePermissions);

export default router;
