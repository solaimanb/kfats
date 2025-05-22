const BaseService = require("./baseService");
const Category = require("../models/Category");
const Course = require("../models/Course");
const { createError } = require("../utils/errorHandler");
const { CATEGORY } = require("../constants");

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
    // Validate category data
    await this.validateCategoryData(categoryData);
    // Validate unique name
    await this.validateUnique("name", categoryData.name);
    return this.create(categoryData);
  }

  async updateCategory(id, updateData) {
    // Validate category data
    await this.validateCategoryData(updateData);
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

  async validateCategoryData(categoryData) {
    const { name, description } = categoryData;

    if (name) {
      if (name.length < CATEGORY.LIMITS.MIN_NAME) {
        throw createError(400, `Name must be at least ${CATEGORY.LIMITS.MIN_NAME} characters`);
      }
      if (name.length > CATEGORY.LIMITS.NAME) {
        throw createError(400, `Name cannot exceed ${CATEGORY.LIMITS.NAME} characters`);
      }
    }

    if (description && description.length > CATEGORY.LIMITS.DESCRIPTION) {
      throw createError(400, `Description cannot exceed ${CATEGORY.LIMITS.DESCRIPTION} characters`);
    }
  }
}

module.exports = new CategoryService();
