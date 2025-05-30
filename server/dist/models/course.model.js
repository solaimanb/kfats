"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseModel = exports.CourseStatus = exports.CourseLevel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
var CourseLevel;
(function (CourseLevel) {
    CourseLevel["BEGINNER"] = "beginner";
    CourseLevel["INTERMEDIATE"] = "intermediate";
    CourseLevel["ADVANCED"] = "advanced";
})(CourseLevel || (exports.CourseLevel = CourseLevel = {}));
var CourseStatus;
(function (CourseStatus) {
    CourseStatus["DRAFT"] = "draft";
    CourseStatus["PUBLISHED"] = "published";
    CourseStatus["ARCHIVED"] = "archived";
})(CourseStatus || (exports.CourseStatus = CourseStatus = {}));
const courseSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
        type: String,
        required: true,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    mentor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    enrolledStudents: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    ratings: [
        {
            user: {
                type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
courseSchema.pre("save", function (next) {
    if (this.isModified("title")) {
        this.slug = (0, slugify_1.default)(this.title, { lower: true });
    }
    if (this.ratings && this.ratings.length > 0) {
        this.averageRating =
            this.ratings.reduce((acc, item) => acc + item.rating, 0) /
                this.ratings.length;
        this.ratingCount = this.ratings.length;
    }
    next();
});
courseSchema.virtual("enrolledCount").get(function () {
    var _a;
    return ((_a = this.enrolledStudents) === null || _a === void 0 ? void 0 : _a.length) || 0;
});
courseSchema.virtual("ratingsCount").get(function () {
    var _a;
    return ((_a = this.ratings) === null || _a === void 0 ? void 0 : _a.length) || 0;
});
courseSchema.methods.isEnrolled = function (userId) {
    return this.enrolledStudents.some((id) => id.toString() === userId);
};
courseSchema.methods.hasRated = function (userId) {
    return this.ratings.some((rating) => rating.user.toString() === userId);
};
courseSchema.statics.findByMentor = function (mentorId) {
    return this.find({ mentor: mentorId });
};
courseSchema.statics.findPublished = function () {
    return this.find({ isPublished: true, status: CourseStatus.PUBLISHED });
};
courseSchema.index({ category: 1 });
courseSchema.index({ mentor: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ price: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ topics: 1 });
courseSchema.index({ title: "text", description: "text" });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ averageRating: -1 });
exports.CourseModel = mongoose_1.default.model("Course", courseSchema);
//# sourceMappingURL=course.model.js.map