const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { auth } = require("../middleware/auth");
const tokenService = require("../services/tokenService");
const { createError } = require("../utils/errorHandler");
const config = require("../config");

router.post("/signup", async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return next(createError(400, "User already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    next(createError(500, "Error creating user"));
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(400, "Invalid credentials"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(createError(400, "Invalid credentials"));
    }

    const tokens = await tokenService.generateTokenPair(user._id);
    const refreshTokenExpiry = tokenService.parseExpiry(config.jwt.refreshToken.expiresIn);

    // Store refresh token in HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      ...config.cookie,
      maxAge: refreshTokenExpiry * 1000
    });

    // Store refresh token in user document
    await user.addRefreshToken(
      tokens.refreshToken,
      refreshTokenExpiry,
      req.get('User-Agent')
    );

    // Log cookie setting
    console.log('Setting refresh token cookie:', {
      token: tokens.refreshToken.substring(0, 10) + '...',
      options: {
        ...config.cookie,
        maxAge: refreshTokenExpiry * 1000
      }
    });

    res.json({
      tokens: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    next(createError(500, "Login failed"));
  }
});

router.post("/refresh-token", async (req, res, next) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;
    console.log('Refresh token from cookie:', refreshToken ? refreshToken.substring(0, 10) + '...' : 'undefined');
    console.log('All cookies:', req.cookies);
    
    if (!refreshToken) {
      return next(createError(401, "Refresh token not found"));
    }

    // Verify refresh token
    const decoded = await tokenService.verifyRefreshToken(refreshToken);
    console.log('Decoded refresh token:', decoded);
    
    const user = await User.findOne({ _id: decoded.id });
    console.log('Found user:', user ? user._id : 'null');

    const isValidToken = await user.validateRefreshToken(refreshToken);
    if (!user || !isValidToken) {
      res.clearCookie('refreshToken', config.cookie);
      return next(createError(401, "Invalid refresh token"));
    }

    // Generate new token pair
    const tokens = await tokenService.generateTokenPair(user._id);
    const refreshTokenExpiry = tokenService.parseExpiry(config.jwt.refreshToken.expiresIn);

    // Remove old refresh token
    await user.removeRefreshToken(refreshToken);

    // Store new refresh token
    await user.addRefreshToken(
      tokens.refreshToken,
      refreshTokenExpiry,
      req.get('User-Agent')
    );

    // Set new refresh token in cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      ...config.cookie,
      maxAge: refreshTokenExpiry * 1000
    });

    // Log cookie setting
    console.log('Setting new refresh token cookie:', {
      token: tokens.refreshToken.substring(0, 10) + '...',
      options: {
        ...config.cookie,
        maxAge: refreshTokenExpiry * 1000
      }
    });

    res.json({
      tokens: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn
      }
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.clearCookie('refreshToken', config.cookie);
    next(createError(401, "Refresh token invalid or expired"));
  }
});

router.post("/logout", auth, async (req, res, next) => {
  try {
    // Clear refresh token from cookie
    res.clearCookie('refreshToken', config.cookie);

    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      // Remove specific refresh token
      await req.user.removeRefreshToken(refreshToken);
    } else {
      // Remove all refresh tokens
      await req.user.removeAllRefreshTokens();
    }

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(createError(500, "Logout failed"));
  }
});

router.get("/me", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password -refreshTokens");
    if (!user) {
      return next(createError(404, "User not found"));
    }
    res.json(user);
  } catch (err) {
    next(createError(500, "Error fetching user data"));
  }
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TokenPair:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: JWT access token
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token
 *         expiresIn:
 *           type: number
 *           description: Access token expiration time in seconds
 *     SignupRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 */

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate user and get tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tokens:
 *                   $ref: '#/components/schemas/TokenPair'
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 */

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Get new token pair using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New token pair generated
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 tokens:
 *                   $ref: '#/components/schemas/TokenPair'
 */

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user and invalidate tokens
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Optional. If provided, only this token will be invalidated
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

module.exports = router;
