"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileUrl = exports.uploadDocument = exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = require("path");
const fs_1 = require("fs");
const error_util_1 = require("./error.util");
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_DOCUMENT_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
const createUploadDirs = () => {
    const dirs = ["uploads", "uploads/images", "uploads/documents"];
    dirs.forEach((dir) => {
        const path = (0, path_1.join)(__dirname, "..", "..", dir);
        if (!(0, fs_1.existsSync)(path)) {
            (0, fs_1.mkdirSync)(path, { recursive: true });
        }
    });
};
createUploadDirs();
const storage = multer_1.default.diskStorage({
    destination: (_req, file, cb) => {
        const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
        const dir = isImage ? "uploads/images" : "uploads/documents";
        cb(null, (0, path_1.join)(__dirname, "..", "..", dir));
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = file.originalname.split(".").pop();
        cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
    },
});
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
exports.uploadImage = (0, multer_1.default)({
    storage,
    fileFilter: fileFilter(ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE),
    limits: {
        fileSize: MAX_IMAGE_SIZE,
    },
});
exports.uploadDocument = (0, multer_1.default)({
    storage,
    fileFilter: fileFilter(ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE),
    limits: {
        fileSize: MAX_DOCUMENT_SIZE,
    },
});
const getFileUrl = (file) => {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    const dir = isImage ? "images" : "documents";
    return `/uploads/${dir}/${file.filename}`;
};
exports.getFileUrl = getFileUrl;
//# sourceMappingURL=upload.util.js.map