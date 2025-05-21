const Joi = require('joi');
const { CATEGORY } = require('../constants');

const categorySchema = Joi.object({
  name: Joi.string()
    .required()
    .trim()
    .min(CATEGORY.LIMITS.MIN_NAME)
    .max(CATEGORY.LIMITS.NAME)
    .messages({
      'string.empty': 'Category name is required',
      'string.min': `Category name must be at least ${CATEGORY.LIMITS.MIN_NAME} characters`,
      'string.max': `Category name cannot exceed ${CATEGORY.LIMITS.NAME} characters`,
    }),
  
  description: Joi.string()
    .max(CATEGORY.LIMITS.DESCRIPTION)
    .messages({
      'string.max': `Category description cannot exceed ${CATEGORY.LIMITS.DESCRIPTION} characters`,
    }),
  
  isActive: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'isActive must be a boolean',
    }),
});

/**
 * Middleware to validate category data
 */
exports.validateCategory = (req, res, next) => {
  const { error } = categorySchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      status: 'fail',
      message: errorMessages.join(', '),
    });
  }
  
  next();
}; 