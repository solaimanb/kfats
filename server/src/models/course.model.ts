import mongoose, { Document, Schema, Types } from "mongoose";
import slugify from "slugify";

export enum CourseLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

export enum CourseStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  price: number;
  duration: number;
  level: CourseLevel;
  status: CourseStatus;
  category: Types.ObjectId;
  mentor: Types.ObjectId;
  enrolledStudents: Types.ObjectId[];
  ratings: Array<{
    user: Types.ObjectId;
    rating: number;
    review?: string;
    date: Date;
  }>;
  averageRating: number;
  ratingCount: number;
  isPublished: boolean;
  sections: Array<{
    title: string;
    description?: string;
    order: number;
    lessons: Array<{
      title: string;
      description?: string;
      type: "video" | "document" | "quiz";
      content: string;
      duration?: number;
      order: number;
      isPreview: boolean;
    }>;
  }>;
  topics: string[];
  prerequisites: string[];
  objectives: string[];
  createdAt: Date;
  updatedAt: Date;
  enrolledCount: number; // Virtual
  ratingsCount: number; // Virtual
  isEnrolled(userId: string): boolean;
  hasRated(userId: string): boolean;
}

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    shortDescription: {
      type: String,
      required: true,
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [0, "Duration cannot be negative"],
    },
    level: {
      type: String,
      enum: Object.values(CourseLevel),
      required: [true, "Course level is required"],
    },
    status: {
      type: String,
      enum: Object.values(CourseStatus),
      default: CourseStatus.DRAFT,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    mentor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enrolledStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    ratings: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: [1, "Rating must be at least 1"],
          max: [5, "Rating cannot exceed 5"],
        },
        review: {
          type: String,
          maxlength: [500, "Review cannot exceed 500 characters"],
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
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    sections: [
      {
        title: {
          type: String,
          required: true,
        },
        description: String,
        order: {
          type: Number,
          required: true,
        },
        lessons: [
          {
            title: {
              type: String,
              required: true,
            },
            description: String,
            type: {
              type: String,
              enum: ["video", "document", "quiz"],
              required: true,
            },
            content: {
              type: String,
              required: true,
            },
            duration: Number,
            order: {
              type: Number,
              required: true,
            },
            isPreview: {
              type: Boolean,
              default: false,
            },
          },
        ],
      },
    ],
    topics: [
      {
        type: String,
        required: true,
      },
    ],
    prerequisites: [String],
    objectives: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save middleware
courseSchema.pre("save", function (next) {
  // Generate slug from title
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true });
  }

  // Calculate average rating
  if (this.ratings && this.ratings.length > 0) {
    this.averageRating =
      this.ratings.reduce((acc, item) => acc + item.rating, 0) /
      this.ratings.length;
    this.ratingCount = this.ratings.length;
  }

  next();
});

// Virtuals
courseSchema.virtual("enrolledCount").get(function () {
  return this.enrolledStudents?.length || 0;
});

courseSchema.virtual("ratingsCount").get(function () {
  return this.ratings?.length || 0;
});

// Instance methods
courseSchema.methods.isEnrolled = function (userId: string): boolean {
  return this.enrolledStudents.some(
    (id: mongoose.Types.ObjectId) => id.toString() === userId
  );
};

courseSchema.methods.hasRated = function (userId: string): boolean {
  return this.ratings.some(
    (rating: { user: mongoose.Types.ObjectId }) =>
      rating.user.toString() === userId
  );
};

// Static methods
courseSchema.statics.findByMentor = function (mentorId: string) {
  return this.find({ mentor: mentorId });
};

courseSchema.statics.findPublished = function () {
  return this.find({ isPublished: true, status: CourseStatus.PUBLISHED });
};

// Indexes
courseSchema.index({ category: 1 });
courseSchema.index({ mentor: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ price: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ topics: 1 });
courseSchema.index({ title: "text", description: "text" });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ averageRating: -1 });

export const CourseModel = mongoose.model<ICourse>("Course", courseSchema);
