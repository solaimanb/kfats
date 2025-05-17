const swaggerJSDoc = require('swagger-jsdoc');
const { COURSE, ROLES } = require('./constants');

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Kustia Fine Arts & Technology School API",
      version: "1.0.0",
      description: "API documentation for Kushtia Fine Arts & Technology School",
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
        Category: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              description: "Category name",
              maxLength: COURSE.LIMITS.TITLE,
            },
            slug: {
              type: "string",
              description: "URL-friendly version of the name",
            },
            description: {
              type: "string",
              description: "Category description",
              maxLength: COURSE.LIMITS.DESCRIPTION,
            },
            isActive: {
              type: "boolean",
              description: "Whether the category is active",
              default: true,
            },
          },
        },
        Course: {
          type: "object",
          required: ["title", "categoryId", "price"],
          properties: {
            title: {
              type: "string",
              description: "Course title",
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
            categoryId: {
              type: "string",
              description: "ID of the course category",
            },
            price: {
              type: "number",
              description: "Course price",
              minimum: 0,
            },
            level: {
              type: "string",
              enum: Object.values(COURSE.LEVELS),
              description: "Course difficulty level",
            },
            status: {
              type: "string",
              enum: Object.values(COURSE.STATUS),
              description: "Course status",
              default: COURSE.STATUS.DRAFT,
            },
            rating: {
              type: "number",
              description: "Course rating",
              minimum: COURSE.RATING.MIN,
              maximum: COURSE.RATING.MAX,
            },
            enrolledStudents: {
              type: "number",
              description: "Number of enrolled students",
              minimum: 0,
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
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
