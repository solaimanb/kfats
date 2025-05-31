import swaggerJsdoc from "swagger-jsdoc";
import { swaggerDefinition } from "./api.config";

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.ts", "./src/models/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
