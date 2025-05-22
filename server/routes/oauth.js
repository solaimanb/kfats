const express = require("express");
const passport = require("passport");
const router = express.Router();

// Check if Google OAuth is configured
const isGoogleAuthConfigured =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

router.get("/google", (req, res, next) => {
  if (!isGoogleAuthConfigured) {
    return res.status(503).json({
      status: "error",
      message: "Google authentication is not configured on the server",
    });
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
});

router.get(
  "/google/callback",
  (req, res, next) => {
    if (!isGoogleAuthConfigured) {
      return res.redirect(
        "http://localhost:3000/login?error=oauth_not_configured"
      );
    }
    passport.authenticate("google", { failureRedirect: "/login" })(
      req,
      res,
      next
    );
  },
  (req, res) => {
    // User info in req.user
    res.redirect("http://localhost:3000/");
  }
);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Error logging out");
    res.redirect("/");
  });
});

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: GoogleAuth
 *   description: Google OAuth login routes
 */

/**
 * @swagger
 * /api/v1/gAuth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [GoogleAuth]
 *     description: Redirects user to Google's OAuth 2.0 consent screen.
 *     responses:
 *       302:
 *         description: Redirect to Google login page
 *       503:
 *         description: Service unavailable - Google OAuth not configured
 */

/**
 * @swagger
 * /api/v1/gAuth/google/callback:
 *   get:
 *     summary: Google OAuth callback endpoint
 *     tags: [GoogleAuth]
 *     description: >
 *       Google redirects here after authentication.
 *       Handles login success or failure and redirects accordingly.
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Authorization code from Google
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *         description: OAuth scopes granted by the user
 *       - in: query
 *         name: authuser
 *         schema:
 *           type: string
 *         description: Authenticated Google user index
 *       - in: query
 *         name: prompt
 *         schema:
 *           type: string
 *         description: OAuth prompt parameter
 *     responses:
 *       302:
 *         description: Redirect to frontend dashboard on success or to /login on failure
 *       401:
 *         description: Unauthorized - authentication failed
 */

/**
 * @swagger
 * /api/v1/gAuth/logout:
 *   get:
 *     summary: Logout user
 *     tags: [GoogleAuth]
 *     description: Logs out the current user session and redirects to home.
 *     responses:
 *       302:
 *         description: Redirects to homepage after logout
 *       500:
 *         description: Error during logout
 */
