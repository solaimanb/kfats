const Joi = require('joi');

const categorySchema = Joi.object({
  name: Joi.string()
    .required()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.empty': 'Category name is required',
      'string.min': 'Category name must be at least 2 characters',
      'string.max': 'Category name cannot exceed 50 characters',
    }),
  
  description: Joi.string()
    .max(500)
    .messages({
      'string.max': 'Category description cannot exceed 500 characters',
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