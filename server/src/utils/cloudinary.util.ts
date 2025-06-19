import { v2 as cloudinary } from "cloudinary";
import { config } from "../config";

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export interface UploadResponse {
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  size: number;
}

export interface UploadOptions {
  folder?: string;
  transformation?: Array<{
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
  }>;
  resourceType?: "image" | "video" | "raw" | "auto";
}

export interface CloudinaryError extends Error {
  http_code?: number;
  code?: string;
}

export const uploadToCloudinary = async (
  file: string | Buffer,
  options: UploadOptions = {}
): Promise<UploadResponse> => {
  try {
    // Set default options
    const uploadOptions = {
      folder: options.folder || "uploads",
      resource_type: options.resourceType || "auto",
      transformation: options.transformation || [],
    };

    // Upload to Cloudinary using SDK
    const result = await cloudinary.uploader.upload(
      typeof file === "string"
        ? file
        : `data:image/jpeg;base64,${file.toString("base64")}`,
      uploadOptions
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(
      `Failed to upload file: ${(error as CloudinaryError).message}`
    );
  }
};

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error(
      `Failed to delete file: ${(error as CloudinaryError).message}`
    );
  }
};

export interface ImageUrlOptions {
  width?: number;
  height?: number;
  crop?: string;
  quality?: number;
  format?: string;
}

export const generateImageUrl = (
  publicId: string,
  options: ImageUrlOptions = {}
): string => {
  const transformations: string[] = [];

  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);

  return cloudinary.url(publicId, {
    secure: true,
    transformation: transformations,
  });
};
