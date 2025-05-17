const express = require('express');
const passport = require('passport');
const router = express.Router();


router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // User info in req.user
    res.redirect('http://localhost:3000/');
  }
);


router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).send('Error logging out');
    res.redirect('/');
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
 * /gAuth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [GoogleAuth]
 *     description: Redirects user to Google's OAuth 2.0 consent screen.
 *     responses:
 *       302:
 *         description: Redirect to Google login page
 */

/**
 * @swagger
 * /gAuth/google/callback:
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
 * /gAuth/logout:
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