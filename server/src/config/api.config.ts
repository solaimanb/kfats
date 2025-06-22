import { SwaggerOptions } from "swagger-ui-express";

export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;

export const swaggerConfig: SwaggerOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Kushtia Charukola API Documentation",
};

export const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Kushtia Charukola API Documentation",
    version: "1.0.0",
    description: "API documentation for Kushtia Fine Arts & Technology School",
    contact: {
      name: "Development Team",
      email: "dev@kushtiacharukola.edu",
    },
    license: {
      name: "ISC",
      url: "https://opensource.org/licenses/ISC",
    },
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production'
        ? process.env.APP_URL || ''
        : `http://localhost:${process.env.PORT || 5000}`,
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    },
  ],
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            format: "uuid",
            description: "User ID"
          },
          email: {
            type: "string",
            format: "email",
            description: "User's email address"
          },
          roles: {
            type: "array",
            items: {
              type: "string",
              enum: ["user", "admin", "mentor", "seller", "writer"]
            },
            description: "User roles"
          },
          status: {
            type: "string",
            enum: ["active", "inactive", "pending_verification", "suspended"],
            description: "User account status"
          },
          profile: {
            type: "object",
            properties: {
              firstName: { type: "string" },
              lastName: { type: "string" },
              phone: { type: "string" },
              avatar: { type: "string" },
              bio: { type: "string" }
            }
          },
          emailVerified: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Error: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                message: { type: "string" }
              }
            }
          }
        }
      }
    },
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      GoogleOAuth: {
        type: "oauth2",
        flows: {
          authorizationCode: {
            authorizationUrl: `${API_PREFIX}/gAuth/google`,
            tokenUrl: `${API_PREFIX}/gAuth/tokens`,
            scopes: {
              "profile email": "Read user profile and email",
            },
          },
        },
      },
    },
  },
}; 