import { CategoryModel as Category, ICategory } from '../models/category.model';
import { AppError } from '../utils/error.util';

export class CategoryService {
  async getAllCategories() {
    return Category.find().sort({ name: 1 });
  }

  async getCategory(id: string) {
    const category = await Category.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return category;
  }

  async createCategory(data: Partial<ICategory>) {
    return Category.create(data);
  }

  async updateCategory(id: string, data: Partial<ICategory>) {
    const category = await Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return category;
  }

  async deleteCategory(id: string) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
  }
}

export default new CategoryService();
