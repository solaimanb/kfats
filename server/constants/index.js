const COURSE = {
  LIMITS: {
    MIN_TITLE: 3,
    TITLE: 100,
    DESCRIPTION: 2000,
    CONTENT: {
      TITLE: 200,
      DESCRIPTION: 1000,
      MIN_DURATION: 1,
    },
    REVIEW: 500,
    PRICE: {
      MIN: 0,
      MAX: 10000,
    },
    MIN_DURATION: 1,
  },
  RATING: {
    MIN: 1,
    MAX: 5,
  },
  LEVELS: {
    BEGINNER: "beginner",
    INTERMEDIATE: "intermediate",
    ADVANCED: "advanced",
  },
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  INDEXES: {
    TEXT: { title: "text", description: "text" },
    CATEGORY_LEVEL: { category: 1, level: 1 },
    INSTRUCTOR: { instructor: 1 },
    PUBLISHED: { isPublished: 1 },
    SLUG: { slug: 1, unique: true },
  },
  SORT_OPTIONS: {
    PRICE_ASC: "price:asc",
    PRICE_DESC: "price:desc",
    DURATION_ASC: "duration:asc",
    DURATION_DESC: "duration:desc",
    CREATED_ASC: "createdAt:asc",
    CREATED_DESC: "createdAt:desc",
    RATING_ASC: "averageRating:asc",
    RATING_DESC: "averageRating:desc",
  },
  STATUS: {
    DRAFT: "draft",
    PUBLISHED: "published",
    ARCHIVED: "archived",
  },
};

const CATEGORY = {
  LIMITS: {
    MIN_NAME: 2,
    NAME: 50,
    DESCRIPTION: 500,
  },
};

const ROLES = {
  ADMIN: "admin",
  SUPER_ADMIN: "superAdmin",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
};

const ERROR_MESSAGES = {
  COURSE: {
    NOT_FOUND: "Course not found",
    ALREADY_ENROLLED: "You are already enrolled in this course",
    NOT_ENROLLED: "You are not enrolled in this course",
    INVALID_RATING: "Rating must be between 1 and 5",
    INVALID_LEVEL: "Invalid course level",
    INVALID_CATEGORY: "Invalid category",
    INVALID_CONTENT: "Invalid course content",
    UNAUTHORIZED: "You are not authorized to perform this action",
    DUPLICATE_SLUG: "A course with this title already exists",
  },
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

module.exports = {
  COURSE,
  CATEGORY,
  ROLES,
  ERROR_MESSAGES,
  HTTP_STATUS,
};
