import { Schema } from 'mongoose';

const isValidUrl = (url: string): boolean => {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

const generateSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const schemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

export const numberSchema = {
  type: Number,
  min: [0, 'Value cannot be negative'],
  validate: {
    validator: (v: number) => v >= 0,
    message: 'Value cannot be negative',
  },
};

export const urlSchema = {
  type: String,
  validate: {
    validator: isValidUrl,
    message: 'Invalid URL format',
  },
};

export const slugSchema = {
  type: String,
  unique: true,
  lowercase: true,
  trim: true,
  set: generateSlug,
};

export const objectIdRef = (ref: string) => ({
  type: Schema.Types.ObjectId,
  ref,
  required: true,
});

module.exports = {
  isValidUrl,
  generateSlug,
  schemaOptions,
  numberSchema,
  urlSchema,
  slugSchema,
  objectIdRef,
};
