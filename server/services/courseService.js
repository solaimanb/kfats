const BaseService = require("./baseService");
const Course = require("../models/Course");
const categoryService = require("./categoryService");
const { createError } = require("../utils/errorHandler");
const { COURSE } = require("../constants");

class CourseService extends BaseService {
  constructor() {
    super(Course);
    this.defaultPopulate = [
      { path: "mentor", select: "name email" },
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

  async updateCourse(id, updateData, userId, userRole) {
    const course = await this.findById(id);

    // Check if course exists
    if (!course) {
      throw createError(404, "Course not found");
    }

    // Convert mentor to string if it's an ObjectId or populated object
    const mentorId = typeof course.mentor === 'object' && course.mentor !== null
      ? course.mentor.toString()
      : course.mentor;

    // Check if user is the mentor or admin
    if (mentorId !== userId.toString() &&
        !["admin", "superAdmin"].includes(userRole)) {
      throw createError(403, "You are not authorized to perform this action");
    }

    await this.validateUpdateData(updateData);
    return this.update(id, updateData);
  }

  async deleteCourse(id, userId, userRole) {
    const course = await this.findById(id);

    // Check if course exists
    if (!course) {
      throw createError(404, "Course not found");
    }

    // Convert mentor to string if it's an ObjectId or populated object
    const mentorId = typeof course.mentor === 'object' && course.mentor !== null
      ? course.mentor.toString()
      : course.mentor;

    // Check if user is the mentor or admin
    if (mentorId !== userId.toString() &&
        !["admin", "superAdmin"].includes(userRole)) {
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

  async getMentorCourses(mentorId, query = {}) {
    const filter = this.buildMentorFilter(mentorId, query);
    return this.find(filter);
  }

  // Private helper methods
  buildCourseFilter(query) {
    const { category, level, search, mentor } = query;
    const filter = { isPublished: true };

    if (category) filter.category = category;
    if (level) filter.level = level;
    if (mentor) filter.mentor = mentor;
    if (search) filter.$text = { $search: search };

    return filter;
  }

  buildMentorFilter(mentorId, query) {
    const { isPublished } = query;
    const filter = { mentor: mentorId };

    if (isPublished !== undefined) {
      filter.isPublished = isPublished === "true";
    }

    return filter;
  }

  async validateCourseData(courseData) {
    const { title, description, price, level, duration, content } = courseData;

    if (title) {
      if (title.length < COURSE.LIMITS.MIN_TITLE) {
        throw createError(400, `Title must be at least ${COURSE.LIMITS.MIN_TITLE} characters`);
      }
      if (title.length > COURSE.LIMITS.TITLE) {
        throw createError(400, `Title cannot exceed ${COURSE.LIMITS.TITLE} characters`);
      }
    }

    if (description && description.length > COURSE.LIMITS.DESCRIPTION) {
      throw createError(400, `Description cannot exceed ${COURSE.LIMITS.DESCRIPTION} characters`);
    }

    if (price && (price < COURSE.LIMITS.PRICE.MIN || price > COURSE.LIMITS.PRICE.MAX)) {
      throw createError(400, `Price must be between ${COURSE.LIMITS.PRICE.MIN} and ${COURSE.LIMITS.PRICE.MAX}`);
    }

    if (duration && duration < COURSE.LIMITS.MIN_DURATION) {
      throw createError(400, `Duration must be at least ${COURSE.LIMITS.MIN_DURATION} minute`);
    }

    if (content && Array.isArray(content)) {
      content.forEach((item, index) => {
        if (item.title && item.title.length > COURSE.LIMITS.CONTENT.TITLE) {
          throw createError(400, `Content item ${index + 1} title cannot exceed ${COURSE.LIMITS.CONTENT.TITLE} characters`);
        }
        if (item.description && item.description.length > COURSE.LIMITS.CONTENT.DESCRIPTION) {
          throw createError(400, `Content item ${index + 1} description cannot exceed ${COURSE.LIMITS.CONTENT.DESCRIPTION} characters`);
        }
        if (item.duration && item.duration < COURSE.LIMITS.CONTENT.MIN_DURATION) {
          throw createError(400, `Content item ${index + 1} duration must be at least ${COURSE.LIMITS.CONTENT.MIN_DURATION} minute`);
        }
      });
    }

    if (level && !Object.values(COURSE.LEVELS).includes(level)) {
      throw createError(400, ERROR_MESSAGES.COURSE.INVALID_LEVEL);
    }
  }

  async validateUpdateData(updateData) {
    const protectedFields = [
      "mentor",
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
