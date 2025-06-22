import swaggerJsdoc from "swagger-jsdoc";
import { swaggerDefinition } from "./api.config";
import path from "path";

const options = {
  swaggerDefinition,
  apis: [
    path.join(__dirname, "../routes/*.js"),
    path.join(__dirname, "../models/*.js"),
    path.join(__dirname, "../routes/*.ts"),
    path.join(__dirname, "../models/*.ts")
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
