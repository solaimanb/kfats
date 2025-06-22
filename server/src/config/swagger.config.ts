import swaggerJsdoc from "swagger-jsdoc";
import { swaggerDefinition } from "./api.config";
import path from "path";

const options = {
  swaggerDefinition,
  apis: [
    path.join(process.cwd(), process.env.NODE_ENV === 'production' ? 'dist/routes/*.js' : 'src/routes/*.ts'),
    path.join(process.cwd(), process.env.NODE_ENV === 'production' ? 'dist/models/*.js' : 'src/models/*.ts')
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
