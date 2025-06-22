import swaggerJsdoc from "swagger-jsdoc";
import { swaggerDefinition } from "./api.config";
import path from "path";

const options = {
  swaggerDefinition,
  apis: [
    path.join(__dirname, '..', process.env.NODE_ENV === 'production' ? '../dist/routes/*.js' : 'routes/*.ts'),
    path.join(__dirname, '..', process.env.NODE_ENV === 'production' ? '../dist/models/*.js' : 'models/*.ts')
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
