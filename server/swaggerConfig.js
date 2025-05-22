const swaggerJSDoc = require("swagger-jsdoc");
const { COURSE, ROLES, CATEGORY } = require("./constants");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Kushtia Fine Arts & Technology School API",
      version: "1.0.0",
      description:
        "API documentation for Kushtia Fine Arts & Technology School",
      contact: {
        name: "API Support",
        email: "support@kfats.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            _id: {
              type: "string",
              description: "User ID",
            },
            name: {
              type: "string",
              description: "User's full name",
            },
            email: {
              type: "string",
              format: "email",
              description: "User's email address",
            },
            password: {
              type: "string",
              format: "password",
              description: "User's password",
            },
            role: {
              type: "string",
              enum: Object.values(ROLES),
              default: ROLES.STUDENT,
              description: "User's role in the system",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "User creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "User last update timestamp",
            },
          },
        },
        Category: {
          type: "object",
          required: ["name"],
          properties: {
            _id: {
              type: "string",
              description: "Category ID",
            },
            name: {
              type: "string",
              description: "Category name",
              minLength: CATEGORY.LIMITS.MIN_NAME,
              maxLength: CATEGORY.LIMITS.NAME,
            },
            slug: {
              type: "string",
              description: "URL-friendly version of the name",
            },
            description: {
              type: "string",
              description: "Category description",
              maxLength: CATEGORY.LIMITS.DESCRIPTION,
            },
            isActive: {
              type: "boolean",
              description: "Whether the category is active",
              default: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Category creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Category last update timestamp",
            },
          },
        },
        ContentItem: {
          type: "object",
          required: ["title"],
          properties: {
            _id: {
              type: "string",
              description: "Content item ID",
            },
            title: {
              type: "string",
              description: "Content item title",
              maxLength: COURSE.LIMITS.CONTENT.TITLE,
            },
            description: {
              type: "string",
              description: "Content item description",
              maxLength: COURSE.LIMITS.CONTENT.DESCRIPTION,
            },
            videoUrl: {
              type: "string",
              format: "uri",
              description: "URL to video content",
            },
            duration: {
              type: "number",
              description: "Content duration in minutes",
              minimum: COURSE.LIMITS.CONTENT.MIN_DURATION,
            },
          },
        },
        Rating: {
          type: "object",
          required: ["rating"],
          properties: {
            user: {
              type: "string",
              description: "ID of the user who provided the rating",
            },
            rating: {
              type: "number",
              description: "Rating value",
              minimum: COURSE.RATING.MIN,
              maximum: COURSE.RATING.MAX,
            },
            review: {
              type: "string",
              description: "Written review",
              maxLength: COURSE.LIMITS.REVIEW,
            },
            date: {
              type: "string",
              format: "date-time",
              description: "Rating timestamp",
            },
          },
        },
        Course: {
          type: "object",
          required: [
            "title",
            "description",
            "thumbnail",
            "price",
            "category",
            "level",
            "duration",
            "content",
          ],
          properties: {
            _id: {
              type: "string",
              description: "Course ID",
            },
            title: {
              type: "string",
              description: "Course title",
              minLength: COURSE.LIMITS.MIN_TITLE,
              maxLength: COURSE.LIMITS.TITLE,
            },
            slug: {
              type: "string",
              description: "URL-friendly version of the title",
            },
            description: {
              type: "string",
              description: "Course description",
              maxLength: COURSE.LIMITS.DESCRIPTION,
            },
            thumbnail: {
              type: "string",
              format: "uri",
              description: "URL to course thumbnail image",
            },
            price: {
              type: "number",
              description: "Course price",
              minimum: COURSE.LIMITS.PRICE.MIN,
              maximum: COURSE.LIMITS.PRICE.MAX,
            },
            instructor: {
              oneOf: [
                {
                  type: "string",
                  description: "ID of the course instructor",
                },
                {
                  $ref: "#/components/schemas/User",
                  description: "Instructor details",
                },
              ],
            },
            category: {
              oneOf: [
                {
                  type: "string",
                  description: "ID of the course category",
                },
                {
                  $ref: "#/components/schemas/Category",
                  description: "Category details",
                },
              ],
            },
            level: {
              type: "string",
              enum: Object.values(COURSE.LEVELS),
              description: "Course difficulty level",
            },
            duration: {
              type: "number",
              description: "Total course duration in minutes",
              minimum: COURSE.LIMITS.MIN_DURATION,
            },
            content: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ContentItem",
              },
              description: "Course content items",
            },
            enrolledStudents: {
              type: "array",
              items: {
                type: "string",
              },
              description: "IDs of enrolled students",
            },
            ratings: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Rating",
              },
              description: "Course ratings",
            },
            averageRating: {
              type: "number",
              description: "Average course rating",
              minimum: COURSE.RATING.MIN,
              maximum: COURSE.RATING.MAX,
            },
            isPublished: {
              type: "boolean",
              description: "Whether the course is published",
              default: false,
            },
            status: {
              type: "string",
              enum: Object.values(COURSE.STATUS),
              description: "Course status",
              default: COURSE.STATUS.DRAFT,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Course creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Course last update timestamp",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["error", "fail"],
            },
            message: {
              type: "string",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: {
                    type: "string",
                  },
                  message: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        PaginationResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "success",
            },
            data: {
              type: "object",
              properties: {
                data: {
                  type: "array",
                  items: {
                    type: "object",
                  },
                },
                pagination: {
                  type: "object",
                  properties: {
                    total: {
                      type: "integer",
                      description: "Total number of items",
                    },
                    page: {
                      type: "integer",
                      description: "Current page number",
                    },
                    pages: {
                      type: "integer",
                      description: "Total number of pages",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Auth",
        description: "Authentication endpoints",
      },
      {
        name: "Users",
        description: "User management endpoints",
      },
      {
        name: "Categories",
        description: "Category management endpoints",
      },
      {
        name: "Courses",
        description: "Course management endpoints",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
