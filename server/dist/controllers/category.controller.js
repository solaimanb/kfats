"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const catch_async_util_1 = require("../utils/catch-async.util");
const category_service_1 = require("../services/category.service");
class CategoryController {
    constructor() {
        this.categoryService = new category_service_1.CategoryService();
        this.getAllCategories = (0, catch_async_util_1.catchAsync)(async (_req, res) => {
            const categories = await this.categoryService.getAllCategories();
            res.status(200).json({
                status: "success",
                data: categories,
            });
        });
        this.getCategory = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const category = await this.categoryService.getCategory(req.params.id);
            res.status(200).json({
                status: "success",
                data: category,
            });
        });
        this.createCategory = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const category = await this.categoryService.createCategory(req.body);
            res.status(201).json({
                status: "success",
                data: category,
            });
        });
        this.updateCategory = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const category = await this.categoryService.updateCategory(req.params.id, req.body);
            res.status(200).json({
                status: "success",
                data: category,
            });
        });
        this.deleteCategory = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            await this.categoryService.deleteCategory(req.params.id);
            res.status(204).json({
                status: "success",
                data: null,
            });
        });
    }
}
exports.CategoryController = CategoryController;
exports.default = new CategoryController();
//# sourceMappingURL=category.controller.js.map