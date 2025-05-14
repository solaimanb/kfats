const Course = require("../models/Course");
const User = require("../models/User");

exports.auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return next(createError(401, "No authentication token, access denied"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id });
    if (!user) {
      return next(createError(401, "User not found"));
    }

    req.user = user;
    next();
  } catch (error) {
    next(createError(401, "Token is invalid or expired"));
  }
};

exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        createError(403, "You do not have permission to perform this action")
      );
    }
    next();
  };
};

exports.checkCourseOwnership = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return next(createError(404, "Course not found"));
    }

    if (
      course.instructor.toString() !== req.user._id.toString() &&
      !["admin", "superAdmin"].includes(req.user.role)
    ) {
      return next(createError(403, "Not authorized to perform this action"));
    }

    req.course = course;
    next();
  } catch (error) {
    next(createError(500, error.message));
  }
};
