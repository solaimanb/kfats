import { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";
import { AppError } from "../utils/error.util";
import { uploadToCloudinary } from "../utils/cloudinary.util";

// Extend Express Request type to include file
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

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

// Configure multer storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (allowedTypes: string[], maxSize: number) => {
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
const uploadImage = multer({
  storage,
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE),
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
});

const uploadDocument = multer({
  storage,
  fileFilter: fileFilter(ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE),
  limits: {
    fileSize: MAX_DOCUMENT_SIZE,
  },
});

// Middleware to handle single image upload
export const handleSingleImageUpload = (fieldName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use multer to handle the file upload
      uploadImage.single(fieldName)(req, res, async (error: any) => {
        if (error) {
          if (error instanceof multer.MulterError) {
            return next(new AppError(error.message, 400));
          }
          return next(error);
        }

        if (!req.file) {
          return next(new AppError("No file uploaded", 400));
        }

        if (!req.file.buffer) {
          return next(new AppError("No file buffer found", 400));
        }

        try {
          // Upload to Cloudinary
          const result = await uploadToCloudinary(req.file.buffer, {
            folder: fieldName,
          });

          // Add the Cloudinary result to the request object
          req.body[fieldName] = {
            url: result.url,
            publicId: result.publicId,
          };

          next();
        } catch (error) {
          next(new AppError("Error uploading file to Cloudinary", 500));
        }
      });
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to handle multiple image uploads
export const handleMultipleImageUpload = (
  fieldName: string,
  maxCount: number
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use multer to handle the file uploads
      uploadImage.array(fieldName, maxCount)(req, res, async (error: any) => {
        if (error) {
          if (error instanceof multer.MulterError) {
            return next(new AppError(error.message, 400));
          }
          return next(error);
        }

        if (!Array.isArray(req.files) || req.files.length === 0) {
          return next(new AppError("No files uploaded", 400));
        }

        try {
          // Upload all files to Cloudinary
          const uploadPromises = req.files.map((file) => {
            if (!file.buffer) {
              throw new AppError("No file buffer found", 400);
            }
            return uploadToCloudinary(file.buffer, {
              folder: fieldName,
            });
          });

          const results = await Promise.all(uploadPromises);

          // Add the Cloudinary results to the request object
          req.body[fieldName] = results.map((result) => ({
            url: result.url,
            publicId: result.publicId,
          }));

          next();
        } catch (error) {
          next(new AppError("Error uploading files to Cloudinary", 500));
        }
      });
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to handle single document upload
export const handleSingleDocumentUpload = (fieldName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use multer to handle the file upload
      uploadDocument.single(fieldName)(req, res, async (error: any) => {
        if (error) {
          if (error instanceof multer.MulterError) {
            return next(new AppError(error.message, 400));
          }
          return next(error);
        }

        if (!req.file) {
          return next(new AppError("No file uploaded", 400));
        }

        if (!req.file.buffer) {
          return next(new AppError("No file buffer found", 400));
        }

        try {
          // Upload to Cloudinary
          const result = await uploadToCloudinary(req.file.buffer, {
            folder: fieldName,
            resourceType: "raw",
          });

          // Add the Cloudinary result to the request object
          req.body[fieldName] = {
            url: result.url,
            publicId: result.publicId,
          };

          next();
        } catch (error) {
          next(new AppError("Error uploading file to Cloudinary", 500));
        }
      });
    } catch (error) {
      next(error);
    }
  };
};


