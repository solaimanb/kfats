"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validateBody = exports.validate = void 0;
const zod_1 = require("zod");
const error_util_1 = require("./error.util");
const validate = (schema) => {
    return (req, _res, next) => {
        try {
            const result = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            req.body = result.body;
            req.query = result.query;
            req.params = result.params;
            return next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errorMessage = error.errors
                    .map((e) => e.message)
                    .join(", ");
                return next(new error_util_1.AppError(errorMessage, 400));
            }
            return next(error);
        }
    };
};
exports.validate = validate;
const validateBody = (schema) => {
    return (req, _res, next) => {
        try {
            const result = schema.parse(req.body);
            req.body = result;
            return next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errorMessage = error.errors
                    .map((e) => e.message)
                    .join(", ");
                return next(new error_util_1.AppError(errorMessage, 400));
            }
            return next(error);
        }
    };
};
exports.validateBody = validateBody;
const validateQuery = (schema) => {
    return (req, _res, next) => {
        try {
            const result = schema.parse(req.query);
            req.query = result;
            return next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errorMessage = error.errors
                    .map((e) => e.message)
                    .join(", ");
                return next(new error_util_1.AppError(errorMessage, 400));
            }
            return next(error);
        }
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, _res, next) => {
        try {
            const result = schema.parse(req.params);
            req.params = result;
            return next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errorMessage = error.errors
                    .map((e) => e.message)
                    .join(", ");
                return next(new error_util_1.AppError(errorMessage, 400));
            }
            return next(error);
        }
    };
};
exports.validateParams = validateParams;
//# sourceMappingURL=validation.util.js.map