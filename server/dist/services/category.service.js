"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const category_model_1 = require("../models/category.model");
const app_error_util_1 = require("../utils/app-error.util");
class CategoryService {
    async getAllCategories() {
        return category_model_1.CategoryModel.find().sort({ name: 1 });
    }
    async getCategory(id) {
        const category = await category_model_1.CategoryModel.findById(id);
        if (!category) {
            throw new app_error_util_1.AppError('Category not found', 404);
        }
        return category;
    }
    async createCategory(data) {
        return category_model_1.CategoryModel.create(data);
    }
    async updateCategory(id, data) {
        const category = await category_model_1.CategoryModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        if (!category) {
            throw new app_error_util_1.AppError('Category not found', 404);
        }
        return category;
    }
    async deleteCategory(id) {
        const category = await category_model_1.CategoryModel.findByIdAndDelete(id);
        if (!category) {
            throw new app_error_util_1.AppError('Category not found', 404);
        }
    }
}
exports.CategoryService = CategoryService;
exports.default = new CategoryService();
//# sourceMappingURL=category.service.js.map