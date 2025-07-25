const Joi = require('joi');
const { COURSE, ERROR_MESSAGES } = require('../constants');

// Base schemas
const baseSchemas = {
  objectId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': ERROR_MESSAGES.COURSE.INVALID_CATEGORY,
    }),

  url: Joi.string()
    .uri()
    .messages({
      'string.uri': 'Invalid URL format',
    }),

  rating: Joi.number()
    .min(COURSE.RATING.MIN)
    .max(COURSE.RATING.MAX)
    .messages({
      'number.base': 'Rating must be a number',
      'number.min': `Rating must be at least ${COURSE.RATING.MIN}`,
      'number.max': `Rating cannot exceed ${COURSE.RATING.MAX}`,
    }),
};

// Course ID schema
const idSchema = Joi.object({
  id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Course ID is required',
      'string.pattern.base': 'Invalid course ID format',
    }),
});

// Content item schema
const contentItemSchema = Joi.object({
  title: Joi.string()
    .required()
    .max(COURSE.LIMITS.CONTENT.TITLE)
    .messages({
      'string.empty': 'Content title is required',
      'string.max': `Content title cannot be more than ${COURSE.LIMITS.CONTENT.TITLE} characters`,
    }),

  description: Joi.string()
    .max(COURSE.LIMITS.CONTENT.DESCRIPTION)
    .messages({
      'string.max': `Content description cannot be more than ${COURSE.LIMITS.CONTENT.DESCRIPTION} characters`,
    }),

  videoUrl: baseSchemas.url,

  duration: Joi.number()
    .min(COURSE.LIMITS.CONTENT.MIN_DURATION)
    .messages({
      'number.base': 'Content duration must be a number',
      'number.min': `Content duration must be at least ${COURSE.LIMITS.CONTENT.MIN_DURATION} minute`,
    }),
});

// Course schemas
const courseSchemas = {
  base: Joi.object({
    title: Joi.string()
      .required()
      .min(COURSE.LIMITS.MIN_TITLE)
      .max(COURSE.LIMITS.TITLE)
      .messages({
        'string.empty': 'Title is required',
        'string.min': `Title must be at least ${COURSE.LIMITS.MIN_TITLE} characters`,
        'string.max': `Title cannot be more than ${COURSE.LIMITS.TITLE} characters`,
      }),

    description: Joi.string()
      .required()
      .max(COURSE.LIMITS.DESCRIPTION)
      .messages({
        'string.empty': 'Description is required',
        'string.max': `Description cannot be more than ${COURSE.LIMITS.DESCRIPTION} characters`,
      }),

    thumbnail: baseSchemas.url.required(),

    price: Joi.number()
      .required()
      .min(COURSE.LIMITS.PRICE.MIN)
      .max(COURSE.LIMITS.PRICE.MAX)
      .messages({
        'number.base': 'Price must be a number',
        'number.min': `Price must be at least ${COURSE.LIMITS.PRICE.MIN}`,
        'number.max': `Price cannot exceed ${COURSE.LIMITS.PRICE.MAX}`,
      }),

    category: baseSchemas.objectId.required(),

    level: Joi.string()
      .required()
      .valid(...Object.values(COURSE.LEVELS))
      .messages({
        'string.empty': 'Level is required',
        'any.only': ERROR_MESSAGES.COURSE.INVALID_LEVEL,
      }),

    duration: Joi.number()
      .required()
      .min(COURSE.LIMITS.MIN_DURATION)
      .messages({
        'number.base': 'Duration must be a number',
        'number.min': `Duration must be at least ${COURSE.LIMITS.MIN_DURATION} minute`,
      }),

    content: Joi.array()
      .items(contentItemSchema)
      .required()
      .min(1)
      .messages({
        'array.base': 'Content must be an array',
        'array.empty': 'Content cannot be empty',
        'array.min': 'At least one content item is required',
      }),

    isPublished: Joi.boolean()
      .default(false)
      .messages({
        'boolean.base': 'isPublished must be a boolean',
      }),

    status: Joi.string()
      .valid(...Object.values(COURSE.STATUS))
      .default(COURSE.STATUS.DRAFT)
      .messages({
        'any.only': 'Invalid course status',
      }),
    mentor: baseSchemas.objectId,
  }),

  update: Joi.object({
    title: Joi.string()
      .min(COURSE.LIMITS.MIN_TITLE)
      .max(COURSE.LIMITS.TITLE)
      .messages({
        'string.min': `Title must be at least ${COURSE.LIMITS.MIN_TITLE} characters`,
        'string.max': `Title cannot be more than ${COURSE.LIMITS.TITLE} characters`,
      }),

    description: Joi.string()
      .max(COURSE.LIMITS.DESCRIPTION)
      .messages({
        'string.max': `Description cannot be more than ${COURSE.LIMITS.DESCRIPTION} characters`,
      }),

    thumbnail: baseSchemas.url,

    price: Joi.number()
      .min(COURSE.LIMITS.PRICE.MIN)
      .max(COURSE.LIMITS.PRICE.MAX)
      .messages({
        'number.base': 'Price must be a number',
        'number.min': `Price must be at least ${COURSE.LIMITS.PRICE.MIN}`,
        'number.max': `Price cannot exceed ${COURSE.LIMITS.PRICE.MAX}`,
      }),

    category: baseSchemas.objectId,

    level: Joi.string()
      .valid(...Object.values(COURSE.LEVELS))
      .messages({
        'any.only': ERROR_MESSAGES.COURSE.INVALID_LEVEL,
      }),

    duration: Joi.number()
      .min(COURSE.LIMITS.MIN_DURATION)
      .messages({
        'number.base': 'Duration must be a number',
        'number.min': `Duration must be at least ${COURSE.LIMITS.MIN_DURATION} minute`,
      }),

    content: Joi.array()
      .items(contentItemSchema)
      .min(1)
      .messages({
        'array.base': 'Content must be an array',
        'array.min': 'At least one content item is required',
      }),

    isPublished: Joi.boolean()
      .messages({
        'boolean.base': 'isPublished must be a boolean',
      }),

    status: Joi.string()
      .valid(...Object.values(COURSE.STATUS))
      .messages({
        'any.only': 'Invalid course status',
      }),
  }),

  rating: Joi.object({
    rating: baseSchemas.rating.required(),
    review: Joi.string()
      .max(COURSE.LIMITS.REVIEW)
      .messages({
        'string.max': `Review cannot be more than ${COURSE.LIMITS.REVIEW} characters`,
      }),
  }),

  query: Joi.object({
    minPrice: Joi.number()
      .min(COURSE.LIMITS.PRICE.MIN)
      .max(COURSE.LIMITS.PRICE.MAX)
      .messages({
        'number.base': 'Invalid minimum price',
        'number.min': `Minimum price must be at least ${COURSE.LIMITS.PRICE.MIN}`,
        'number.max': `Minimum price cannot exceed ${COURSE.LIMITS.PRICE.MAX}`,
      }),

    maxPrice: Joi.number()
      .min(COURSE.LIMITS.PRICE.MIN)
      .max(COURSE.LIMITS.PRICE.MAX)
      .messages({
        'number.base': 'Invalid maximum price',
        'number.min': `Maximum price must be at least ${COURSE.LIMITS.PRICE.MIN}`,
        'number.max': `Maximum price cannot exceed ${COURSE.LIMITS.PRICE.MAX}`,
      }),

    sort: Joi.string()
      .valid(...Object.values(COURSE.SORT_OPTIONS))
      .messages({
        'any.only': 'Invalid sort parameter',
      }),

    page: Joi.number()
      .min(1)
      .messages({
        'number.base': 'Invalid page number',
        'number.min': 'Page number must be at least 1',
      }),

    limit: Joi.number()
      .min(1)
      .max(COURSE.PAGINATION.MAX_LIMIT)
      .messages({
        'number.base': 'Invalid limit value',
        'number.min': 'Limit must be at least 1',
        'number.max': `Limit cannot exceed ${COURSE.PAGINATION.MAX_LIMIT}`,
      }),

    category: baseSchemas.objectId,

    level: Joi.string()
      .valid(...Object.values(COURSE.LEVELS))
      .messages({
        'any.only': ERROR_MESSAGES.COURSE.INVALID_LEVEL,
      }),

    search: Joi.string()
      .min(3)
      .messages({
        'string.min': 'Search query must be at least 3 characters',
      }),

    isPublished: Joi.boolean()
      .messages({
        'boolean.base': 'isPublished must be a boolean',
      }),

    status: Joi.string()
      .valid(...Object.values(COURSE.STATUS))
      .messages({
        'any.only': 'Invalid course status',
      }),

    mentor: baseSchemas.objectId,
  }),
};

// Validation middleware factory
const createValidator = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false });
  if (error) {
    return res.status(400).json({
      status: 'fail',
      errors: error.details.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
  req.validatedData = value;
  next();
};

// Export validation middleware
module.exports = {
  validateCourse: createValidator(courseSchemas.base),
  validateCourseUpdate: createValidator(courseSchemas.update),
  validateRating: createValidator(courseSchemas.rating),
  validateQuery: createValidator(courseSchemas.query, 'query'),
  validateId: createValidator(idSchema, 'params'),
}; 