const BaseService = require("./baseService");
const Course = require("../models/Course");
const categoryService = require("./categoryService");
const { createError } = require("../utils/errorHandler");
const { COURSE } = require("../constants");

class CourseService extends BaseService {
  constructor() {
    super(Course);
    this.defaultPopulate = [
      { path: "instructor", select: "name email" },
      { path: "category", select: "name" },
    ];
  }

  async createCourse(courseData) {
    await this.validateCourseData(courseData);
    await categoryService.validateCategoryId(courseData.category);
    return this.create(courseData);
  }

  async getCourses(query = {}) {
    const filter = this.buildCourseFilter(query);
    return this.findWithPagination(filter, {
      sort: query.sort || "-createdAt",
      populate: this.defaultPopulate,
    });
  }

  async getCourseById(id) {
    return this.findById(id, {
      populate: [
        ...this.defaultPopulate,
        { path: "enrolledStudents", select: "name email" },
        { path: "ratings.user", select: "name email" },
      ],
    });
  }

  async updateCourse(id, updateData, userId) {
    const course = await this.findById(id);

    if (course.instructor.toString() !== userId) {
      throw createError(403, "Not authorized to update this course");
    }

    await this.validateUpdateData(updateData);
    return this.update(id, updateData);
  }

  async deleteCourse(id, userId) {
    const course = await this.findById(id);

    if (course.instructor.toString() !== userId) {
      throw createError(403, "Not authorized to delete this course");
    }

    return this.delete(id);
  }

  async enrollInCourse(courseId, userId) {
    const course = await this.findById(courseId);

    if (!course.isPublished) {
      throw createError(400, "Course is not published yet");
    }

    if (course.enrolledStudents.includes(userId)) {
      throw createError(400, "Already enrolled in this course");
    }

    course.enrolledStudents.push(userId);
    await course.save();

    return { message: "Successfully enrolled in course" };
  }

  async rateCourse(courseId, userId, ratingData) {
    const course = await this.findById(courseId);

    if (!course.enrolledStudents.includes(userId)) {
      throw createError(403, "Must be enrolled to rate the course");
    }

    await this.validateRating(ratingData);
    await this.updateRating(course, userId, ratingData);

    return { message: "Rating submitted successfully" };
  }

  async getInstructorCourses(instructorId, query = {}) {
    const filter = this.buildInstructorFilter(instructorId, query);
    return this.findWithPagination(filter, {
      populate: this.defaultPopulate,
    });
  }

  // Private helper methods
  buildCourseFilter(query) {
    const { category, level, search, instructor } = query;
    const filter = { isPublished: true };

    if (category) filter.category = category;
    if (level) filter.level = level;
    if (instructor) filter.instructor = instructor;
    if (search) filter.$text = { $search: search };

    return filter;
  }

  buildInstructorFilter(instructorId, query) {
    const { isPublished } = query;
    const filter = { instructor: instructorId };

    if (isPublished !== undefined) {
      filter.isPublished = isPublished === "true";
    }

    return filter;
  }

  async validateCourseData(courseData) {
    const { title, description, price, level } = courseData;

    if (
      title &&
      (title.length < COURSE.LIMITS.TITLE.MIN ||
        title.length > COURSE.LIMITS.TITLE.MAX)
    ) {
      throw createError(400, "Invalid title length");
    }

    if (description && description.length > COURSE.LIMITS.DESCRIPTION.MAX) {
      throw createError(400, "Description too long");
    }

    if (price && (price < 0 || price > COURSE.LIMITS.PRICE.MAX)) {
      throw createError(400, "Invalid price");
    }

    if (level && !Object.values(COURSE.LEVELS).includes(level)) {
      throw createError(400, "Invalid course level");
    }
  }

  async validateUpdateData(updateData) {
    const protectedFields = [
      "instructor",
      "enrolledStudents",
      "ratings",
      "averageRating",
    ];
    protectedFields.forEach((field) => delete updateData[field]);

    if (updateData.category) {
      await categoryService.validateCategoryId(updateData.category);
    }

    await this.validateCourseData(updateData);
  }

  async validateRating(ratingData) {
    const { rating } = ratingData;
    if (rating < COURSE.RATING.MIN || rating > COURSE.RATING.MAX) {
      throw createError(400, "Invalid rating value");
    }
  }

  async updateRating(course, userId, ratingData) {
    const existingRating = course.ratings.find(
      (r) => r.user.toString() === userId
    );

    if (existingRating) {
      existingRating.rating = ratingData.rating;
      existingRating.review = ratingData.review;
    } else {
      course.ratings.push({
        user: userId,
        rating: ratingData.rating,
        review: ratingData.review,
      });
    }

    await course.save();
  }
}

module.exports = new CourseService();
