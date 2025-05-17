const BaseService = require("./baseService");
const Category = require("../models/Category");
const Course = require("../models/Course");
const { createError } = require("../utils/errorHandler");

class CategoryService extends BaseService {
  constructor() {
    super(Category);
  }

  async getAllCategories(query = {}) {
    const { isActive = true } = query;
    return this.findWithPagination(
      { isActive },
      {
        populate: [],
        select: "name slug description isActive",
      }
    );
  }

  async createCategory(categoryData) {
    // Validate unique name
    await this.validateUnique("name", categoryData.name);
    return this.create(categoryData);
  }

  async updateCategory(id, updateData) {
    if (updateData.name) {
      await this.validateUnique("name", updateData.name, id);
    }
    return this.update(id, updateData);
  }

  async deleteCategory(id) {
    // Check if category is being used
    const courseCount = await Course.countDocuments({ category: id });
    if (courseCount > 0) {
      throw createError(
        400,
        "Cannot delete category that is being used in courses"
      );
    }
    return this.delete(id);
  }

  async validateCategoryId(categoryId) {
    const category = await this.findById(categoryId);
    if (!category.isActive) {
      throw createError(400, "Category is inactive");
    }
    return category;
  }
}

module.exports = new CategoryService();
