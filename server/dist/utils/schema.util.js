"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectIdRef = exports.slugSchema = exports.urlSchema = exports.numberSchema = exports.schemaOptions = void 0;
const mongoose_1 = require("mongoose");
const isValidUrl = (url) => {
    if (!url)
        return true;
    try {
        new URL(url);
        return true;
    }
    catch (err) {
        return false;
    }
};
const generateSlug = (text) => {
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
exports.schemaOptions = {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
};
exports.numberSchema = {
    type: Number,
    min: [0, 'Value cannot be negative'],
    validate: {
        validator: (v) => v >= 0,
        message: 'Value cannot be negative',
    },
};
exports.urlSchema = {
    type: String,
    validate: {
        validator: isValidUrl,
        message: 'Invalid URL format',
    },
};
exports.slugSchema = {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    set: generateSlug,
};
const objectIdRef = (ref) => ({
    type: mongoose_1.Schema.Types.ObjectId,
    ref,
    required: true,
});
exports.objectIdRef = objectIdRef;
module.exports = {
    isValidUrl,
    generateSlug,
    schemaOptions: exports.schemaOptions,
    numberSchema: exports.numberSchema,
    urlSchema: exports.urlSchema,
    slugSchema: exports.slugSchema,
    objectIdRef: exports.objectIdRef,
};
//# sourceMappingURL=schema.util.js.map