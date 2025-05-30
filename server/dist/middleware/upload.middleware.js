"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSingleDocumentUpload = exports.handleMultipleImageUpload = exports.handleSingleImageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const error_util_1 = require("../utils/error.util");
const cloudinary_util_1 = require("../utils/cloudinary.util");
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_DOCUMENT_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
const storage = multer_1.default.memoryStorage();
const fileFilter = (allowedTypes, maxSize) => {
    return (_req, file, cb) => {
        if (!allowedTypes.includes(file.mimetype)) {
            cb(new error_util_1.AppError(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`, 400));
            return;
        }
        if (file.size > maxSize) {
            cb(new error_util_1.AppError(`File too large. Maximum size allowed: ${maxSize / (1024 * 1024)}MB`, 400));
            return;
        }
        cb(null, true);
    };
};
const uploadImage = (0, multer_1.default)({
    storage,
    fileFilter: fileFilter(ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE),
    limits: {
        fileSize: MAX_IMAGE_SIZE,
    },
});
const uploadDocument = (0, multer_1.default)({
    storage,
    fileFilter: fileFilter(ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE),
    limits: {
        fileSize: MAX_DOCUMENT_SIZE,
    },
});
const handleSingleImageUpload = (fieldName) => {
    return async (req, res, next) => {
        try {
            uploadImage.single(fieldName)(req, res, async (error) => {
                if (error) {
                    if (error instanceof multer_1.default.MulterError) {
                        return next(new error_util_1.AppError(error.message, 400));
                    }
                    return next(error);
                }
                if (!req.file) {
                    return next(new error_util_1.AppError("No file uploaded", 400));
                }
                try {
                    const result = await (0, cloudinary_util_1.uploadToCloudinary)(req.file.buffer, {
                        folder: fieldName,
                    });
                    req.body[fieldName] = {
                        url: result.url,
                        publicId: result.publicId,
                    };
                    next();
                }
                catch (error) {
                    next(new error_util_1.AppError("Error uploading file to Cloudinary", 500));
                }
            });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.handleSingleImageUpload = handleSingleImageUpload;
const handleMultipleImageUpload = (fieldName, maxCount) => {
    return async (req, res, next) => {
        try {
            uploadImage.array(fieldName, maxCount)(req, res, async (error) => {
                if (error) {
                    if (error instanceof multer_1.default.MulterError) {
                        return next(new error_util_1.AppError(error.message, 400));
                    }
                    return next(error);
                }
                const files = req.files;
                if (!files || files.length === 0) {
                    return next(new error_util_1.AppError("No files uploaded", 400));
                }
                try {
                    const uploadPromises = files.map((file) => (0, cloudinary_util_1.uploadToCloudinary)(file.buffer, {
                        folder: fieldName,
                    }));
                    const results = await Promise.all(uploadPromises);
                    req.body[fieldName] = results.map((result) => ({
                        url: result.url,
                        publicId: result.publicId,
                    }));
                    next();
                }
                catch (error) {
                    next(new error_util_1.AppError("Error uploading files to Cloudinary", 500));
                }
            });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.handleMultipleImageUpload = handleMultipleImageUpload;
const handleSingleDocumentUpload = (fieldName) => {
    return async (req, res, next) => {
        try {
            uploadDocument.single(fieldName)(req, res, async (error) => {
                if (error) {
                    if (error instanceof multer_1.default.MulterError) {
                        return next(new error_util_1.AppError(error.message, 400));
                    }
                    return next(error);
                }
                if (!req.file) {
                    return next(new error_util_1.AppError("No file uploaded", 400));
                }
                try {
                    const result = await (0, cloudinary_util_1.uploadToCloudinary)(req.file.buffer, {
                        folder: fieldName,
                        resourceType: "raw",
                    });
                    req.body[fieldName] = {
                        url: result.url,
                        publicId: result.publicId,
                    };
                    next();
                }
                catch (error) {
                    next(new error_util_1.AppError("Error uploading file to Cloudinary", 500));
                }
            });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.handleSingleDocumentUpload = handleSingleDocumentUpload;
//# sourceMappingURL=upload.middleware.js.map