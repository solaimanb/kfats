import express from "express";
import passport from "passport";
import { OAuthController } from "../controllers/oauth.controller";

const router = express.Router();
const oauthController = new OAuthController();

/**
 * @swagger
 * /api/v1/gAuth/google:
 *   get:
 *     tags:
 *       - OAuth
 *     summary: Initiate Google OAuth
 *     description: Start Google OAuth authentication flow
 *     security:
 *       - GoogleOAuth:
 *         - profile email
 *     responses:
 *       302:
 *         description: Redirect to Google authentication page
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent",
  })
);

/**
 * @swagger
 * /api/v1/gAuth/google/callback:
 *   get:
 *     tags:
 *       - OAuth
 *     summary: Google OAuth callback
 *     description: Handle the Google OAuth callback after successful authentication
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *     responses:
 *       200:
 *         description: Authentication successful
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
 *                     token:
 *                       type: string
 *       401:
 *         description: Authentication failed
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  oauthController.googleAuthCallback
);

/**
 * @swagger
 * /api/v1/gAuth/tokens:
 *   get:
 *     tags:
 *       - OAuth
 *     summary: Get OAuth tokens
 *     description: Retrieve OAuth access and refresh tokens
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: OAuth tokens retrieved successfully
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
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     expiresIn:
 *                       type: number
 *       401:
 *         description: Not authenticated
 */
router.get("/tokens", oauthController.getOAuthTokens);

export default router;
