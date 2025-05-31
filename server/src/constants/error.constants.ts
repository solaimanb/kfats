const { COURSE } = require('./index');

module.exports = {
  COURSE: {
    NOT_FOUND: 'Course not found',
    NOT_AUTHORIZED: 'Not authorized to perform this action',
    ALREADY_ENROLLED: 'Already enrolled in this course',
    NOT_ENROLLED: 'Must be enrolled to perform this action',
    NOT_PUBLISHED: 'Course is not published yet',
    INVALID_DATA: 'Invalid course data',
    DUPLICATE_TITLE: 'Course with this title already exists'
  },
  VALIDATION: {
    REQUIRED_FIELDS: 'All required fields must be provided',
    INVALID_TITLE: `Title cannot be more than ${COURSE.LIMITS.TITLE} characters`,
    INVALID_DESCRIPTION: `Description cannot be more than ${COURSE.LIMITS.DESCRIPTION} characters`,
    INVALID_PRICE: 'Price must be a positive number',
    INVALID_DURATION: 'Duration must be a positive number',
    INVALID_LEVEL: `Level must be one of: ${Object.values(COURSE.LEVELS).join(', ')}`,
    INVALID_CATEGORY: 'Invalid or inactive category'
  }
}; 