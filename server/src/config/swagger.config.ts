import swaggerJsdoc from "swagger-jsdoc";
import { swaggerDefinition } from "./api.config";
import path from "path";

const options = {
  swaggerDefinition,
  apis: [
    path.join(process.cwd(), process.env.NODE_ENV === 'production' ? 'dist' : 'src', 'routes', '*.{js,ts}'),
    path.join(process.cwd(), process.env.NODE_ENV === 'production' ? 'dist' : 'src', 'models', '*.{js,ts}')
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
