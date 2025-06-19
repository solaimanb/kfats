import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "./error.util";

export const validate = (schema: z.ZodObject<any, any>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with validated data
      req.body = result.body;
      req.query = result.query;
      req.params = result.params;

      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((e) => e.message)
          .join(", ");
        return next(new AppError(errorMessage, 400));
      }
      return next(error);
    }
  };
};

export const validateBody = (schema: z.ZodType<any, any>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body);
      req.body = result;
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((e) => e.message)
          .join(", ");
        return next(new AppError(errorMessage, 400));
      }
      return next(error);
    }
  };
};

export const validateQuery = (schema: z.ZodType<any, any>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.query);
      req.query = result;
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((e) => e.message)
          .join(", ");
        return next(new AppError(errorMessage, 400));
      }
      return next(error);
    }
  };
};

export const validateParams = (schema: z.ZodType<any, any>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.params);
      req.params = result;
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((e) => e.message)
          .join(", ");
        return next(new AppError(errorMessage, 400));
      }
      return next(error);
    }
  };
}; 