import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async.util";
import { CategoryService } from "../services/category.service";

export class CategoryController {
  private categoryService = new CategoryService();

  getAllCategories = catchAsync(async (_req: Request, res: Response) => {
    const categories = await this.categoryService.getAllCategories();
    res.status(200).json({
      status: "success",
      data: categories,
    });
  });

  getCategory = catchAsync(async (req: Request, res: Response) => {
    const category = await this.categoryService.getCategory(req.params.id);
    res.status(200).json({
      status: "success",
      data: category,
    });
  });

  createCategory = catchAsync(async (req: Request, res: Response) => {
    const category = await this.categoryService.createCategory(req.body);
    res.status(201).json({
      status: "success",
      data: category,
    });
  });

  updateCategory = catchAsync(async (req: Request, res: Response) => {
    const category = await this.categoryService.updateCategory(req.params.id, req.body);
    res.status(200).json({
      status: "success",
      data: category,
    });
  });

  deleteCategory = catchAsync(async (req: Request, res: Response) => {
    await this.categoryService.deleteCategory(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
}

export default new CategoryController();
