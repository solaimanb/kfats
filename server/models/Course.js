const mongoose = require("mongoose");
const { VALIDATION } = require("../constants/errors");
const { COURSE } = require("../constants");
const {
  commonSchemaOptions,
  commonFields,
  generateSlug,
} = require("../utils/schemaUtils");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, VALIDATION.REQUIRED_FIELDS],
      trim: true,
      maxlength: [COURSE.LIMITS.TITLE, VALIDATION.INVALID_TITLE],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, VALIDATION.REQUIRED_FIELDS],
      maxlength: [COURSE.LIMITS.DESCRIPTION, VALIDATION.INVALID_DESCRIPTION],
    },
    thumbnail: {
      ...commonFields.url,
      required: [true, VALIDATION.REQUIRED_FIELDS],
    },
    price: {
      ...commonFields.positiveNumber,
      required: [true, VALIDATION.REQUIRED_FIELDS],
    },
    instructor: commonFields.objectId("User"),
    category: commonFields.objectId("Category"),
    level: {
      type: String,
      required: true,
      enum: {
        values: Object.values(COURSE.LEVELS),
        message: VALIDATION.INVALID_LEVEL,
      },
    },
    duration: {
      ...commonFields.positiveNumber,
      required: [true, VALIDATION.REQUIRED_FIELDS],
    },
    content: [
      {
        title: {
          type: String,
          required: true,
          maxlength: COURSE.LIMITS.CONTENT.TITLE,
        },
        description: {
          type: String,
          maxlength: COURSE.LIMITS.CONTENT.DESCRIPTION,
        },
        videoUrl: commonFields.url,
        duration: commonFields.positiveNumber,
      },
    ],
    enrolledStudents: [commonFields.objectId("User")],
    ratings: [
      {
        user: commonFields.objectId("User"),
        rating: {
          type: Number,
          min: [COURSE.RATING.MIN, "Rating must be at least 1"],
          max: [COURSE.RATING.MAX, "Rating cannot exceed 5"],
        },
        review: {
          type: String,
          maxlength: [
            COURSE.LIMITS.REVIEW,
            "Review cannot exceed 500 characters",
          ],
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: COURSE.RATING.MAX,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  commonSchemaOptions
);

// Pre-save middleware
courseSchema.pre("save", function (next) {
  // Generate slug
  this.slug = generateSlug(this.title);

  // Calculate average rating
  if (this.ratings.length > 0) {
    this.averageRating =
      this.ratings.reduce((acc, item) => acc + item.rating, 0) /
      this.ratings.length;
  }

  next();
});

// Virtuals
courseSchema.virtual("enrolledCount").get(function () {
  return this.enrolledStudents.length;
});

courseSchema.virtual("ratingsCount").get(function () {
  return this.ratings.length;
});

// Indexes
Object.entries(COURSE.INDEXES).forEach(([key, index]) => {
  courseSchema.index(index);
});

// Static methods
courseSchema.statics.findByInstructor = function (instructorId) {
  return this.find({ instructor: instructorId });
};

courseSchema.statics.findPublished = function () {
  return this.find({ isPublished: true });
};

// Instance methods
courseSchema.methods.isEnrolled = function (userId) {
  return this.enrolledStudents.includes(userId);
};

courseSchema.methods.hasRated = function (userId) {
  return this.ratings.some(
    (rating) => rating.user.toString() === userId.toString()
  );
};

module.exports = mongoose.model("Course", courseSchema);
