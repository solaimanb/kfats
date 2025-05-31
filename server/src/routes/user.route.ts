import express from "express";
import { protect, restrictTo } from "../middleware/auth.middleware";
import { UserRole } from "../config/rbac.config";
import { UserController } from "../controllers/user.controller";

const router = express.Router();
const userController = new UserController();

// Protected routes
router.use(protect);

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get current user profile
 *     description: Get the current authenticated user's complete profile information, including roles, permissions, and role-specific data
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                     _id:
 *                       type: string
 *                       description: User's unique identifier
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: User's email address
 *                     profile:
 *                       type: object
 *                       properties:
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                           format: uri
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                         enum: [student, mentor, admin]
 *                     roleSpecificData:
 *                       type: object
 *                       description: Role-specific information (e.g., mentor qualifications, student progress)
 *                     status:
 *                       type: string
 *                       enum: [active, inactive, suspended]
 *                     preferences:
 *                       type: object
 *                       properties:
 *                         language:
 *                           type: string
 *                         timezone:
 *                           type: string
 *                         theme:
 *                           type: string
 *       401:
 *         description: Not authenticated
 */
router.get("/profile", userController.getProfile);

/**
 * @swagger
 * /api/v1/users/profile:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update user profile
 *     description: Update the current user's profile information
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 */
router.patch("/profile", userController.updateProfile);

/**
 * @swagger
 * /api/v1/users/password:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update password
 *     description: Update the current user's password
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid password or passwords don't match
 *       401:
 *         description: Current password is incorrect
 */
router.patch("/password", userController.updatePassword);

// Admin only routes
router.use(restrictTo(UserRole.ADMIN));

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Retrieve a list of all users (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, mentor, admin]
 *         description: Filter users by role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *   post:
 *     tags:
 *       - Users
 *     summary: Create user
 *     description: Create a new user (Admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, mentor, admin]
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 */
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     description: Get detailed information about a specific user (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update user
 *     description: Update a specific user's information (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, mentor, admin]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete user
 *     description: Delete a specific user (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted successfully
 */
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
