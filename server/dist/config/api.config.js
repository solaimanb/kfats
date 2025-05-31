"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerDefinition = exports.swaggerConfig = exports.API_PREFIX = exports.API_VERSION = void 0;
exports.API_VERSION = "v1";
exports.API_PREFIX = `/api/${exports.API_VERSION}`;
exports.swaggerConfig = {
    swaggerOptions: {
        persistAuthorization: true,
    },
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Kushtia Charukola API Documentation",
};
exports.swaggerDefinition = {
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
            url: `http://localhost:${process.env.PORT || 5000}${exports.API_PREFIX}`,
            description: "Development server",
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
//# sourceMappingURL=api.config.js.map