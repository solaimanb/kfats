import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { AppError } from "./error.util";

// Define allowed file types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Define file size limits (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

// Create upload directories if they don't exist
const createUploadDirs = () => {
  const dirs = ["uploads", "uploads/images", "uploads/documents"];
  dirs.forEach((dir) => {
    const path = join(__dirname, "..", "..", dir);
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    const dir = isImage ? "uploads/images" : "uploads/documents";
    cb(null, join(__dirname, "..", "..", dir));
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  },
});

// File filter function
const fileFilter = (
  allowedTypes: string[],
  maxSize: number
) => {
  return (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!allowedTypes.includes(file.mimetype)) {
      cb(
        new AppError(
          `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
          400
        )
      );
      return;
    }

    if (file.size > maxSize) {
      cb(
        new AppError(
          `File too large. Maximum size allowed: ${maxSize / (1024 * 1024)}MB`,
          400
        )
      );
      return;
    }

    cb(null, true);
  };
};

// Create upload instances
export const uploadImage = multer({
  storage,
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE),
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
});

export const uploadDocument = multer({
  storage,
  fileFilter: fileFilter(ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE),
  limits: {
    fileSize: MAX_DOCUMENT_SIZE,
  },
});

// Helper function to get file URL
export const getFileUrl = (file: Express.Multer.File): string => {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
  const dir = isImage ? "images" : "documents";
  return `/uploads/${dir}/${file.filename}`;
}; 