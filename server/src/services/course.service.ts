import { FilterQuery, Types } from "mongoose";
import { CourseModel as Course, ICourse } from "../models/course.model";
import { AppError } from "../utils/error.util";

const COURSE_LIMITS = {
  MIN_TITLE: 3,
  TITLE: 100,
  DESCRIPTION: 2000,
  CONTENT: {
    TITLE: 200,
    DESCRIPTION: 1000,
    MIN_DURATION: 1,
  },
  PRICE: {
    MIN: 0,
    MAX: 10000,
  },
  MIN_DURATION: 1,
  LEVELS: ["beginner", "intermediate", "advanced"] as const,
  RATING: {
    MIN: 1,
    MAX: 5,
  },
};

export class CourseService {
  async getAllCourses(query: FilterQuery<ICourse> = {}) {
    return Course.find(query).populate("mentor", "firstName lastName avatar");
  }

  async getCourse(courseId: string) {
    const course = await Course.findById(courseId).populate(
      "mentor",
      "firstName lastName avatar"
    );
    if (!course) {
      throw new AppError("Course not found", 404);
    }
    return course;
  }

  async getEnrolledCourses(userId: string) {
    return Course.find({
      enrolledStudents: new Types.ObjectId(userId),
    }).populate("mentor", "firstName lastName avatar");
  }

  async getMentorCourses(mentorId: string, query: FilterQuery<ICourse> = {}) {
    const filter = this.buildMentorFilter(mentorId, query);
    return Course.find(filter).populate("mentor", "firstName lastName avatar");
  }

  async enrollInCourse(courseId: string, userId: string) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError("Course not found", 404);
    }

    if (!course.isPublished) {
      throw new AppError("Course is not published", 400);
    }

    const userObjectId = new Types.ObjectId(userId);
    if (course.enrolledStudents.includes(userObjectId)) {
      throw new AppError("Already enrolled in this course", 400);
    }

    course.enrolledStudents.push(userObjectId);
    await course.save();
  }

  async createCourse(data: Partial<ICourse>) {
    await this.validateCourseData(data);
    const course = new Course(data);
    return course.save();
  }

  async updateCourse(
    courseId: string,
    data: Partial<ICourse>,
    mentorId: string
  ) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError("Course not found", 404);
    }

    if (course.mentor.toString() !== mentorId) {
      throw new AppError("You are not authorized to update this course", 403);
    }

    // Remove protected fields from the update data
    const updateData: Partial<ICourse> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (
        !["mentor", "enrolledStudents", "ratings", "averageRating"].includes(
          key
        )
      ) {
        updateData[key as keyof ICourse] = value;
      }
    });

    await this.validateCourseData(updateData);
    Object.assign(course, updateData);
    await course.save();
    return course;
  }

  async deleteCourse(courseId: string, mentorId: string) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError("Course not found", 404);
    }

    if (course.mentor.toString() !== mentorId) {
      throw new AppError("You are not authorized to delete this course", 403);
    }

    await course.deleteOne();
  }

  async publishCourse(courseId: string, mentorId: string) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError("Course not found", 404);
    }

    if (course.mentor.toString() !== mentorId) {
      throw new AppError("You are not authorized to publish this course", 403);
    }

    course.isPublished = true;
    await course.save();
    return course;
  }

  async unpublishCourse(courseId: string, mentorId: string) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError("Course not found", 404);
    }

    if (course.mentor.toString() !== mentorId) {
      throw new AppError(
        "You are not authorized to unpublish this course",
        403
      );
    }

    course.isPublished = false;
    await course.save();
    return course;
  }

  async rateCourse(
    courseId: string,
    userId: string,
    ratingData: { rating: number; review?: string }
  ) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError("Course not found", 404);
    }

    const userObjectId = new Types.ObjectId(userId);
    if (!course.enrolledStudents.includes(userObjectId)) {
      throw new AppError("Must be enrolled to rate the course", 403);
    }

    if (
      ratingData.rating < COURSE_LIMITS.RATING.MIN ||
      ratingData.rating > COURSE_LIMITS.RATING.MAX
    ) {
      throw new AppError("Invalid rating value", 400);
    }

    const existingRating = course.ratings.find(
      (r) => r.user.toString() === userId
    );
    if (existingRating) {
      existingRating.rating = ratingData.rating;
      existingRating.review = ratingData.review;
    } else {
      course.ratings.push({
        user: userObjectId,
        rating: ratingData.rating,
        review: ratingData.review,
        date: new Date(),
      });
    }

    await course.save();
    return course;
  }

  private buildMentorFilter(mentorId: string, query: FilterQuery<ICourse>) {
    const filter: FilterQuery<ICourse> = {
      mentor: new Types.ObjectId(mentorId),
    };

    const { category, level, search, isPublished } = query;

    if (category) filter.category = new Types.ObjectId(category as string);
    if (level) filter.level = level;
    if (isPublished !== undefined) {
      filter.isPublished = isPublished === "true";
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    return filter;
  }

  private async validateCourseData(data: Partial<ICourse>) {
    const { title, description, price, level, duration, sections } = data;

    if (title) {
      if (title.length < COURSE_LIMITS.MIN_TITLE) {
        throw new AppError(
          `Title must be at least ${COURSE_LIMITS.MIN_TITLE} characters`,
          400
        );
      }
      if (title.length > COURSE_LIMITS.TITLE) {
        throw new AppError(
          `Title cannot exceed ${COURSE_LIMITS.TITLE} characters`,
          400
        );
      }
    }

    if (description && description.length > COURSE_LIMITS.DESCRIPTION) {
      throw new AppError(
        `Description cannot exceed ${COURSE_LIMITS.DESCRIPTION} characters`,
        400
      );
    }

    if (
      price !== undefined &&
      (price < COURSE_LIMITS.PRICE.MIN || price > COURSE_LIMITS.PRICE.MAX)
    ) {
      throw new AppError(
        `Price must be between ${COURSE_LIMITS.PRICE.MIN} and ${COURSE_LIMITS.PRICE.MAX}`,
        400
      );
    }

    if (duration !== undefined && duration < COURSE_LIMITS.MIN_DURATION) {
      throw new AppError(
        `Duration must be at least ${COURSE_LIMITS.MIN_DURATION} minute`,
        400
      );
    }

    if (sections && Array.isArray(sections)) {
      sections.forEach((section, index) => {
        if (
          section.title &&
          section.title.length > COURSE_LIMITS.CONTENT.TITLE
        ) {
          throw new AppError(
            `Section ${index + 1} title cannot exceed ${
              COURSE_LIMITS.CONTENT.TITLE
            } characters`,
            400
          );
        }
        if (
          section.description &&
          section.description.length > COURSE_LIMITS.CONTENT.DESCRIPTION
        ) {
          throw new AppError(
            `Section ${index + 1} description cannot exceed ${
              COURSE_LIMITS.CONTENT.DESCRIPTION
            } characters`,
            400
          );
        }
      });
    }

    if (level && !COURSE_LIMITS.LEVELS.includes(level as any)) {
      throw new AppError("Invalid course level", 400);
    }
  }
}

export default new CourseService();
