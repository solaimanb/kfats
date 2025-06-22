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
        ? process.env.APP_URL + API_PREFIX
        : `http://localhost:${process.env.PORT || 5000}${API_PREFIX}`,
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    },
  ],
  components: {
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
            authorizationUrl: "/api/v1/gAuth/google",
            tokenUrl: "/api/v1/gAuth/tokens",
            scopes: {
              "profile email": "Read user profile and email",
            },
          },
        },
      },
    },
  },
}; 