"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseController = void 0;
const catch_async_util_1 = require("../utils/catch-async.util");
const course_service_1 = require("../services/course.service");
class CourseController {
    constructor() {
        this.courseService = new course_service_1.CourseService();
        this.getAllCourses = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const courses = await this.courseService.getAllCourses(req.query);
            res.status(200).json({
                status: "success",
                data: courses,
            });
        });
        this.getCourse = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const course = await this.courseService.getCourse(req.params.id);
            res.status(200).json({
                status: "success",
                data: course,
            });
        });
        this.getEnrolledCourses = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const courses = await this.courseService.getEnrolledCourses(req.user.id);
            res.status(200).json({
                status: "success",
                data: courses,
            });
        });
        this.enrollInCourse = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            await this.courseService.enrollInCourse(req.params.id, req.user.id);
            res.status(200).json({
                status: "success",
                message: "Successfully enrolled in course",
            });
        });
        this.createCourse = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const course = await this.courseService.createCourse(Object.assign(Object.assign({}, req.body), { mentor: req.user.id }));
            res.status(201).json({
                status: "success",
                data: course,
            });
        });
        this.updateCourse = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const course = await this.courseService.updateCourse(req.params.id, req.body, req.user.id);
            res.status(200).json({
                status: "success",
                data: course,
            });
        });
        this.deleteCourse = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            await this.courseService.deleteCourse(req.params.id, req.user.id);
            res.status(204).json({
                status: "success",
                data: null,
            });
        });
        this.publishCourse = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const course = await this.courseService.publishCourse(req.params.id, req.user.id);
            res.status(200).json({
                status: "success",
                data: course,
            });
        });
        this.unpublishCourse = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const course = await this.courseService.unpublishCourse(req.params.id, req.user.id);
            res.status(200).json({
                status: "success",
                data: course,
            });
        });
        this.rateCourse = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const course = await this.courseService.rateCourse(req.params.id, req.user.id, req.body);
            res.status(200).json({
                status: "success",
                data: course,
            });
        });
    }
}
exports.CourseController = CourseController;
exports.default = new CourseController();
//# sourceMappingURL=course.controller.js.map