const { createError } = require('../utils/errorHandler');

const validate = (validator) => {
  return async (req, res, next) => {
    try {
      const { error } = await validator(req.body);
      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));
        return next(createError(400, 'Validation Error', { errors }));
      }
      next();
    } catch (err) {
      next(createError(500, 'Error validating request'));
    }
  };
};

const validateQuery = (validator) => {
  return async (req, res, next) => {
    try {
      const { error } = await validator(req.query);
      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));
        return next(createError(400, 'Validation Error', { errors }));
      }
      next();
    } catch (err) {
      next(createError(500, 'Error validating query parameters'));
    }
  };
};

module.exports = {
  validate,
  validateQuery
}; 