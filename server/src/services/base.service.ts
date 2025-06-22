import { Model, FilterQuery, QueryOptions, Document, UpdateQuery } from 'mongoose';
import { createError } from '../utils/error.util';
import { config } from '../config';
import { MongoError } from 'mongodb';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  populate?: string[];
  select?: string;
}

export class BaseService<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findById(id: string, options: QueryOptions = {}) {
    try {
      const doc = await this.model.findById(id, options);
      if (!doc) {
        throw createError(404, `${this.model.modelName} not found`);
      }
      return doc;
    } catch (err) {
      throw createError(500, `Error finding ${this.model.modelName}`);
    }
  }

  async findWithPagination({
    page = 1,
    limit = config.pagination.defaultLimit,
    sort = '-createdAt',
    populate = [],
    select = '',
    ...filter
  }: PaginationOptions & FilterQuery<any>) {
    try {
      const query = this.model.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);

      if (select) {
        query.select(select);
      }

      if (populate.length > 0) {
        populate.forEach(p => query.populate(p));
      }

      const [results, total] = await Promise.all([
        query.exec(),
        this.model.countDocuments(filter)
      ]);

      return {
        results,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total,
      };
    } catch (err) {
      throw createError(500, `Error fetching ${this.model.modelName} list`);
    }
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const doc = await this.model.create(data);
      return doc;
    } catch (err) {
      if (err instanceof MongoError && err.code === 11000) {
        throw createError(400, `${this.model.modelName} with this data already exists`);
      }
      throw createError(500, `Error creating ${this.model.modelName}`);
    }
  }

  async update(
    id: string,
    data: UpdateQuery<T>,
    options: QueryOptions = { new: true, runValidators: true }
  ): Promise<T | null> {
    try {
      const doc = await this.model.findByIdAndUpdate(id, data, options);
      return doc;
    } catch (err) {
      if (err instanceof MongoError && err.code === 11000) {
        throw createError(400, `${this.model.modelName} with this data already exists`);
      }
      throw createError(500, `Error updating ${this.model.modelName}`);
    }
  }

  async delete(id: string) {
    try {
      const doc = await this.model.findById(id);

      if (!doc) {
        throw createError(404, `${this.model.modelName} not found`);
      }

      await doc.deleteOne();
      return { message: `${this.model.modelName} deleted successfully` };
    } catch (err) {
      throw createError(500, `Error deleting ${this.model.modelName}`);
    }
  }

  async validateUnique(field: string, value: any, excludeId: string | null = null) {
    const query: any = {
      [field]: value,
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const exists = await this.model.exists(query);
    return !exists;
  }
} 