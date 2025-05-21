const Category = require("../models/Category");
const { HTTP_STATUS, ERROR_MESSAGES } = require("../constants");

/**
 * Get all categories
 * @route GET /api/v1/categories
 * @access Public
 */
exports.getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Category.countDocuments();

    res.status(HTTP_STATUS.OK).json({
      status: "success",
      data: {
        data: categories,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Get category by ID
 * @route GET /api/v1/categories/:id
 * @access Public
 */
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: "fail",
        message: "Category not found",
      });
    }

    res.status(HTTP_STATUS.OK).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Create a new category
 * @route POST /api/v1/categories
 * @access Private (Admin only)
 */
exports.createCategory = async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);

    res.status(HTTP_STATUS.CREATED).json({
      status: "success",
      data: newCategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(HTTP_STATUS.CONFLICT).json({
        status: "fail",
        message: "A category with this name already exists",
      });
    }

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Update a category
 * @route PATCH /api/v1/categories/:id
 * @access Private (Admin only)
 */
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: "fail",
        message: "Category not found",
      });
    }

    res.status(HTTP_STATUS.OK).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(HTTP_STATUS.CONFLICT).json({
        status: "fail",
        message: "A category with this name already exists",
      });
    }

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Delete a category
 * @route DELETE /api/v1/categories/:id
 * @access Private (Admin only)
 */
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: "fail",
        message: "Category not found",
      });
    }

    res.status(HTTP_STATUS.OK).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message,
    });
  }
};
