const jwt = require('jsonwebtoken');
const Course = require("../models/Course");
const User = require("../models/User");
const { HTTP_STATUS } = require('../constants');

// Helper function to create error response
const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.status = statusCode >= 500 ? 'error' : 'fail';
  return error;
};

exports.auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return next(createError(HTTP_STATUS.UNAUTHORIZED, "No authentication token, access denied"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id });
    if (!user) {
      return next(createError(HTTP_STATUS.UNAUTHORIZED, "User not found"));
    }

    req.user = user;
    next();
  } catch (error) {
    next(createError(HTTP_STATUS.UNAUTHORIZED, "Token is invalid or expired"));
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
      course.instructor.toString() !== req.user._id.toString() &&
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
