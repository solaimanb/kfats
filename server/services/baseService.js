const config = require('../config');
const { createError } = require('../utils/errorHandler');

class BaseService {
  constructor(model) {
    this.model = model;
  }

  async findById(id, options = {}) {
    try {
      const doc = await this.model.findById(id, options);
      if (!doc) {
        throw createError(404, `${this.model.modelName} not found`);
      }
      return doc;
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, `Error finding ${this.model.modelName}`);
    }
  }

  async findWithPagination(filter = {}, options = {}) {
    try {
      const { 
        page = 1, 
        limit = config.pagination.defaultLimit,
        sort = '-createdAt',
        populate = [],
        select = ''
      } = options;

      const query = this.model.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Math.min(limit, config.pagination.maxLimit));

      if (select) query.select(select);
      if (populate.length) {
        populate.forEach(p => query.populate(p));
      }

      const [docs, total] = await Promise.all([
        query.exec(),
        this.model.countDocuments(filter)
      ]);

      return {
        data: docs,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw createError(500, `Error fetching ${this.model.modelName} list`);
    }
  }

  async create(data) {
    try {
      const doc = await this.model.create(data);
      return doc;
    } catch (error) {
      if (error.code === 11000) {
        throw createError(400, `${this.model.modelName} with this data already exists`);
      }
      throw createError(500, `Error creating ${this.model.modelName}`);
    }
  }

  async update(id, data, options = {}) {
    try {
      const doc = await this.model.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true, ...options }
      );

      if (!doc) {
        throw createError(404, `${this.model.modelName} not found`);
      }

      return doc;
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, `Error updating ${this.model.modelName}`);
    }
  }

  async delete(id) {
    try {
      const doc = await this.model.findById(id);
      
      if (!doc) {
        throw createError(404, `${this.model.modelName} not found`);
      }

      await doc.deleteOne();
      return { message: `${this.model.modelName} deleted successfully` };
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, `Error deleting ${this.model.modelName}`);
    }
  }

  async validateUnique(field, value, excludeId = null) {
    try {
      const query = { [field]: value };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      const exists = await this.model.exists(query);
      if (exists) {
        throw createError(400, `${field} already exists`);
      }
      return true;
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, `Error validating ${field}`);
    }
  }
}

module.exports = BaseService; 