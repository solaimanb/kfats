import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async.util";
import { CourseService } from "../services/course.service";

export class CourseController {
  private courseService = new CourseService();

  getAllCourses = catchAsync(async (req: Request, res: Response) => {
    const courses = await this.courseService.getAllCourses(req.query);
    res.status(200).json({
      status: "success",
      data: courses,
    });
  });

  getCourse = catchAsync(async (req: Request, res: Response) => {
    const course = await this.courseService.getCourse(req.params.id);
    res.status(200).json({
      status: "success",
      data: course,
    });
  });

  getEnrolledCourses = catchAsync(async (req: Request, res: Response) => {
    const courses = await this.courseService.getEnrolledCourses(req.user!.id);
    res.status(200).json({
      status: "success",
      data: courses,
    });
  });

  enrollInCourse = catchAsync(async (req: Request, res: Response) => {
    await this.courseService.enrollInCourse(req.params.id, req.user!.id);
    res.status(200).json({
      status: "success",
      message: "Successfully enrolled in course",
    });
  });

  createCourse = catchAsync(async (req: Request, res: Response) => {
    const course = await this.courseService.createCourse({
      ...req.body,
      mentor: req.user!.id,
    });
    res.status(201).json({
      status: "success",
      data: course,
    });
  });

  updateCourse = catchAsync(async (req: Request, res: Response) => {
    const course = await this.courseService.updateCourse(
      req.params.id,
      req.body,
      req.user!.id
    );
    res.status(200).json({
      status: "success",
      data: course,
    });
  });

  deleteCourse = catchAsync(async (req: Request, res: Response) => {
    await this.courseService.deleteCourse(req.params.id, req.user!.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  });

  publishCourse = catchAsync(async (req: Request, res: Response) => {
    const course = await this.courseService.publishCourse(
      req.params.id,
      req.user!.id
    );
    res.status(200).json({
      status: "success",
      data: course,
    });
  });

  unpublishCourse = catchAsync(async (req: Request, res: Response) => {
    const course = await this.courseService.unpublishCourse(
      req.params.id,
      req.user!.id
    );
    res.status(200).json({
      status: "success",
      data: course,
    });
  });

  rateCourse = catchAsync(async (req: Request, res: Response) => {
    const course = await this.courseService.rateCourse(
      req.params.id,
      req.user!.id,
      req.body
    );
    res.status(200).json({
      status: "success",
      data: course,
    });
  });
}

export default new CourseController();
