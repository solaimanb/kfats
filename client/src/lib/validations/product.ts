import * as z from "zod";
import { ProductCategory } from "../types/api";

export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(255, "Product name must be less than 255 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be less than 2000 characters"),
  price: z
    .number()
    .min(0, "Price must be positive")
    .max(999999.99, "Price must be less than $999,999.99"),
  category: z.nativeEnum(ProductCategory),
  image_urls: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images allowed"),
  stock_quantity: z
    .number()
    .int("Stock quantity must be a whole number")
    .min(0, "Stock quantity cannot be negative")
    .max(99999, "Stock quantity must be less than 100,000"),
});

export type ProductFormData = z.infer<typeof productFormSchema>;