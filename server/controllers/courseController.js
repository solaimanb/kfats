const BaseController = require("./baseController");
const courseService = require("../services/courseService");

class CourseController extends BaseController {
  constructor() {
    super(courseService);
  }

  createCourse = async (req, res, next) => {
    try {
      const course = await courseService.createCourse({
        ...req.body,
        instructor: req.user._id,
      });
      res.status(201).json({
        status: "success",
        data: course,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllCourses = async (req, res, next) => {
    try {
      const courses = await courseService.getCourses(req.query);
      res.json({
        status: "success",
        data: courses,
      });
    } catch (error) {
      next(error);
    }
  };

  updateCourse = async (req, res, next) => {
    try {
      const course = await courseService.updateCourse(
        req.params.id,
        req.body,
        req.user._id
      );
      res.json({
        status: "success",
        data: course,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCourse = async (req, res, next) => {
    try {
      await courseService.deleteCourse(req.params.id, req.user._id);
      res.status(204).json({
        status: "success",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };

  enrollInCourse = async (req, res, next) => {
    try {
      const result = await courseService.enrollInCourse(
        req.params.id,
        req.user._id
      );
      res.json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  rateCourse = async (req, res, next) => {
    try {
      const result = await courseService.rateCourse(
        req.params.id,
        req.user._id,
        req.body
      );
      res.json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getInstructorCourses = async (req, res, next) => {
    try {
      const courses = await courseService.getInstructorCourses(
        req.user._id,
        req.query
      );
      res.json({
        status: "success",
        data: courses,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new CourseController();
