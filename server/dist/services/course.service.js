"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
const mongoose_1 = require("mongoose");
const course_model_1 = require("../models/course.model");
const app_error_util_1 = require("../utils/app-error.util");
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
    LEVELS: ["beginner", "intermediate", "advanced"],
    RATING: {
        MIN: 1,
        MAX: 5,
    },
};
class CourseService {
    async getAllCourses(query = {}) {
        return course_model_1.CourseModel.find(query).populate("mentor", "firstName lastName avatar");
    }
    async getCourse(courseId) {
        const course = await course_model_1.CourseModel.findById(courseId).populate("mentor", "firstName lastName avatar");
        if (!course) {
            throw new app_error_util_1.AppError("Course not found", 404);
        }
        return course;
    }
    async getEnrolledCourses(userId) {
        return course_model_1.CourseModel.find({
            enrolledStudents: new mongoose_1.Types.ObjectId(userId),
        }).populate("mentor", "firstName lastName avatar");
    }
    async getMentorCourses(mentorId, query = {}) {
        const filter = this.buildMentorFilter(mentorId, query);
        return course_model_1.CourseModel.find(filter).populate("mentor", "firstName lastName avatar");
    }
    async enrollInCourse(courseId, userId) {
        const course = await course_model_1.CourseModel.findById(courseId);
        if (!course) {
            throw new app_error_util_1.AppError("Course not found", 404);
        }
        if (!course.isPublished) {
            throw new app_error_util_1.AppError("Course is not published", 400);
        }
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        if (course.enrolledStudents.includes(userObjectId)) {
            throw new app_error_util_1.AppError("Already enrolled in this course", 400);
        }
        course.enrolledStudents.push(userObjectId);
        await course.save();
    }
    async createCourse(data) {
        await this.validateCourseData(data);
        return course_model_1.CourseModel.create(data);
    }
    async updateCourse(courseId, data, mentorId) {
        const course = await course_model_1.CourseModel.findById(courseId);
        if (!course) {
            throw new app_error_util_1.AppError("Course not found", 404);
        }
        if (course.mentor.toString() !== mentorId) {
            throw new app_error_util_1.AppError("You are not authorized to update this course", 403);
        }
        const updateData = {};
        Object.entries(data).forEach(([key, value]) => {
            if (!["mentor", "enrolledStudents", "ratings", "averageRating"].includes(key)) {
                updateData[key] = value;
            }
        });
        await this.validateCourseData(updateData);
        Object.assign(course, updateData);
        await course.save();
        return course;
    }
    async deleteCourse(courseId, mentorId) {
        const course = await course_model_1.CourseModel.findById(courseId);
        if (!course) {
            throw new app_error_util_1.AppError("Course not found", 404);
        }
        if (course.mentor.toString() !== mentorId) {
            throw new app_error_util_1.AppError("You are not authorized to delete this course", 403);
        }
        await course.deleteOne();
    }
    async publishCourse(courseId, mentorId) {
        const course = await course_model_1.CourseModel.findById(courseId);
        if (!course) {
            throw new app_error_util_1.AppError("Course not found", 404);
        }
        if (course.mentor.toString() !== mentorId) {
            throw new app_error_util_1.AppError("You are not authorized to publish this course", 403);
        }
        course.isPublished = true;
        await course.save();
        return course;
    }
    async unpublishCourse(courseId, mentorId) {
        const course = await course_model_1.CourseModel.findById(courseId);
        if (!course) {
            throw new app_error_util_1.AppError("Course not found", 404);
        }
        if (course.mentor.toString() !== mentorId) {
            throw new app_error_util_1.AppError("You are not authorized to unpublish this course", 403);
        }
        course.isPublished = false;
        await course.save();
        return course;
    }
    async rateCourse(courseId, userId, ratingData) {
        const course = await course_model_1.CourseModel.findById(courseId);
        if (!course) {
            throw new app_error_util_1.AppError("Course not found", 404);
        }
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        if (!course.enrolledStudents.includes(userObjectId)) {
            throw new app_error_util_1.AppError("Must be enrolled to rate the course", 403);
        }
        if (ratingData.rating < COURSE_LIMITS.RATING.MIN ||
            ratingData.rating > COURSE_LIMITS.RATING.MAX) {
            throw new app_error_util_1.AppError("Invalid rating value", 400);
        }
        const existingRating = course.ratings.find((r) => r.user.toString() === userId);
        if (existingRating) {
            existingRating.rating = ratingData.rating;
            existingRating.review = ratingData.review;
        }
        else {
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
    buildMentorFilter(mentorId, query) {
        const filter = {
            mentor: new mongoose_1.Types.ObjectId(mentorId),
        };
        const { category, level, search, isPublished } = query;
        if (category)
            filter.category = new mongoose_1.Types.ObjectId(category);
        if (level)
            filter.level = level;
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
    async validateCourseData(data) {
        const { title, description, price, level, duration, sections } = data;
        if (title) {
            if (title.length < COURSE_LIMITS.MIN_TITLE) {
                throw new app_error_util_1.AppError(`Title must be at least ${COURSE_LIMITS.MIN_TITLE} characters`, 400);
            }
            if (title.length > COURSE_LIMITS.TITLE) {
                throw new app_error_util_1.AppError(`Title cannot exceed ${COURSE_LIMITS.TITLE} characters`, 400);
            }
        }
        if (description && description.length > COURSE_LIMITS.DESCRIPTION) {
            throw new app_error_util_1.AppError(`Description cannot exceed ${COURSE_LIMITS.DESCRIPTION} characters`, 400);
        }
        if (price !== undefined &&
            (price < COURSE_LIMITS.PRICE.MIN || price > COURSE_LIMITS.PRICE.MAX)) {
            throw new app_error_util_1.AppError(`Price must be between ${COURSE_LIMITS.PRICE.MIN} and ${COURSE_LIMITS.PRICE.MAX}`, 400);
        }
        if (duration !== undefined && duration < COURSE_LIMITS.MIN_DURATION) {
            throw new app_error_util_1.AppError(`Duration must be at least ${COURSE_LIMITS.MIN_DURATION} minute`, 400);
        }
        if (sections && Array.isArray(sections)) {
            sections.forEach((section, index) => {
                if (section.title &&
                    section.title.length > COURSE_LIMITS.CONTENT.TITLE) {
                    throw new app_error_util_1.AppError(`Section ${index + 1} title cannot exceed ${COURSE_LIMITS.CONTENT.TITLE} characters`, 400);
                }
                if (section.description &&
                    section.description.length > COURSE_LIMITS.CONTENT.DESCRIPTION) {
                    throw new app_error_util_1.AppError(`Section ${index + 1} description cannot exceed ${COURSE_LIMITS.CONTENT.DESCRIPTION} characters`, 400);
                }
            });
        }
        if (level && !COURSE_LIMITS.LEVELS.includes(level)) {
            throw new app_error_util_1.AppError("Invalid course level", 400);
        }
    }
}
exports.CourseService = CourseService;
exports.default = new CourseService();
//# sourceMappingURL=course.service.js.map