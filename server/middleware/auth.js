const Course = require("../models/Course");
const User = require("../models/User");
const { HTTP_STATUS } = require('../constants');
const tokenService = require('../services/tokenService');

// Helper function to create error response
const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.status = statusCode >= 500 ? 'error' : 'fail';
  return error;
};

// Extract token from request header
const extractToken = (req) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) return null;
  
  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer' || !token) return null;
  
  return token;
};

exports.auth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return next(createError(HTTP_STATUS.UNAUTHORIZED, "No authentication token, access denied"));
    }

    const decoded = await tokenService.verifyAccessToken(token);
    const user = await User.findOne({ _id: decoded.id });
    if (!user) {
      return next(createError(HTTP_STATUS.UNAUTHORIZED, "User not found"));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.statusCode === 401 && error.message === 'Access token has expired') {
      return next(createError(HTTP_STATUS.UNAUTHORIZED, "Token has expired, please refresh"));
    }
    next(createError(HTTP_STATUS.UNAUTHORIZED, "Authentication failed"));
  }
};

exports.refreshAuth = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      return next(createError(HTTP_STATUS.UNAUTHORIZED, "Refresh token required"));
    }

    const decoded = await tokenService.verifyRefreshToken(refreshToken);
    const user = await User.findOne({ _id: decoded.id });
    
    if (!user || !user.validateRefreshToken(refreshToken)) {
      return next(createError(HTTP_STATUS.UNAUTHORIZED, "Invalid refresh token"));
    }

    const tokens = await tokenService.generateTokenPair(user._id);
    await user.addRefreshToken(
      tokens.refreshToken,
      tokenService.parseExpiry(process.env.REFRESH_TOKEN_EXPIRY || '7d'),
      req.get('User-Agent')
    );

    res.json(tokens);
  } catch (error) {
    next(createError(HTTP_STATUS.UNAUTHORIZED, "Refresh token invalid or expired"));
  }
};

exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        createError(HTTP_STATUS.FORBIDDEN, "You do not have permission to perform this action")
      );
    }
    next();
  };
};

exports.checkCourseOwnership = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return next(createError(HTTP_STATUS.NOT_FOUND, "Course not found"));
    }

    if (
      course.mentor.toString() !== req.user._id.toString() &&
      !["admin", "superAdmin"].includes(req.user.role)
    ) {
      return next(createError(HTTP_STATUS.FORBIDDEN, "Not authorized to perform this action"));
    }

    req.course = course;
    next();
  } catch (error) {
    next(createError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message));
  }
};
