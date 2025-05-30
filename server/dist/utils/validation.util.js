"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validateBody = exports.validate = void 0;
const error_util_1 = require("./error.util");
const validate = (schema) => {
    return (req, _res, next) => {
        const validationOptions = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
        };
        const { error, value } = schema.validate({
            body: req.body,
            query: req.query,
            params: req.params,
        }, validationOptions);
        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(", ");
            return next(new error_util_1.AppError(errorMessage, 400));
        }
        req.body = value.body;
        req.query = value.query;
        req.params = value.params;
        return next();
    };
};
exports.validate = validate;
const validateBody = (schema) => {
    return (req, _res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
        });
        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(", ");
            return next(new error_util_1.AppError(errorMessage, 400));
        }
        req.body = value;
        return next();
    };
};
exports.validateBody = validateBody;
const validateQuery = (schema) => {
    return (req, _res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
        });
        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(", ");
            return next(new error_util_1.AppError(errorMessage, 400));
        }
        req.query = value;
        return next();
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, _res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
        });
        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(", ");
            return next(new error_util_1.AppError(errorMessage, 400));
        }
        req.params = value;
        return next();
    };
};
exports.validateParams = validateParams;
//# sourceMappingURL=validation.util.js.map