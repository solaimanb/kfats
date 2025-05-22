const mongoose = require("mongoose");

const isValidUrl = (url) => {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-");
};

const commonSchemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const commonValidations = {
  url: {
    validator: isValidUrl,
    message: "Invalid URL",
  },
  positiveNumber: {
    validator: (v) => v >= 0,
    message: "Value must be positive",
  },
};

const commonFields = {
  url: {
    type: String,
    validate: commonValidations.url,
  },
  positiveNumber: {
    type: Number,
    min: [0, "Value must be positive"],
  },
  objectId: (ref) => ({
    type: mongoose.Schema.Types.ObjectId,
    ref,
    required: true,
  }),
};

module.exports = {
  isValidUrl,
  generateSlug,
  commonSchemaOptions,
  commonValidations,
  commonFields,
};
