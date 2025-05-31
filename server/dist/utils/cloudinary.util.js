"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImageUrl = exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const config_1 = require("../config");
cloudinary_1.v2.config({
    cloud_name: config_1.config.cloudinary.cloudName,
    api_key: config_1.config.cloudinary.apiKey,
    api_secret: config_1.config.cloudinary.apiSecret,
});
const uploadToCloudinary = async (file, options = {}) => {
    try {
        const uploadOptions = {
            folder: options.folder || "uploads",
            resource_type: options.resourceType || "auto",
            transformation: options.transformation || [],
        };
        const result = await cloudinary_1.v2.uploader.upload(typeof file === "string"
            ? file
            : `data:image/jpeg;base64,${file.toString("base64")}`, uploadOptions);
        return {
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            size: result.bytes,
        };
    }
    catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    try {
        await cloudinary_1.v2.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
    }
    catch (error) {
        console.error("Cloudinary delete error:", error);
        throw new Error(`Failed to delete file: ${error.message}`);
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
const generateImageUrl = (publicId, options = {}) => {
    const transformations = [];
    if (options.width)
        transformations.push(`w_${options.width}`);
    if (options.height)
        transformations.push(`h_${options.height}`);
    if (options.crop)
        transformations.push(`c_${options.crop}`);
    if (options.quality)
        transformations.push(`q_${options.quality}`);
    if (options.format)
        transformations.push(`f_${options.format}`);
    return cloudinary_1.v2.url(publicId, {
        secure: true,
        transformation: transformations,
    });
};
exports.generateImageUrl = generateImageUrl;
//# sourceMappingURL=cloudinary.util.js.map