"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const error_handler_util_1 = require("../utils/error-handler.util");
const config_1 = require("../config");
class BaseService {
    constructor(model) {
        this.model = model;
    }
    async findById(id, options = {}) {
        try {
            const doc = await this.model.findById(id, options);
            if (!doc) {
                throw (0, error_handler_util_1.createError)(404, `${this.model.modelName} not found`);
            }
            return doc;
        }
        catch (err) {
            throw (0, error_handler_util_1.createError)(500, `Error finding ${this.model.modelName}`);
        }
    }
    async findWithPagination(_a) {
        var { page = 1, limit = config_1.config.pagination.defaultLimit, sort = '-createdAt', populate = [], select = '' } = _a, filter = __rest(_a, ["page", "limit", "sort", "populate", "select"]);
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
        }
        catch (err) {
            throw (0, error_handler_util_1.createError)(500, `Error fetching ${this.model.modelName} list`);
        }
    }
    async create(data) {
        try {
            const doc = await this.model.create(data);
            return doc;
        }
        catch (err) {
            if (err.code === 11000) {
                throw (0, error_handler_util_1.createError)(400, `${this.model.modelName} with this data already exists`);
            }
            throw (0, error_handler_util_1.createError)(500, `Error creating ${this.model.modelName}`);
        }
    }
    async update(id, data, options = {}) {
        try {
            const doc = await this.model.findByIdAndUpdate(id, data, Object.assign({ new: true, runValidators: true }, options));
            if (!doc) {
                throw (0, error_handler_util_1.createError)(404, `${this.model.modelName} not found`);
            }
            return doc;
        }
        catch (err) {
            if (err.code === 11000) {
                throw (0, error_handler_util_1.createError)(400, `${this.model.modelName} with this data already exists`);
            }
            throw (0, error_handler_util_1.createError)(500, `Error updating ${this.model.modelName}`);
        }
    }
    async delete(id) {
        try {
            const doc = await this.model.findById(id);
            if (!doc) {
                throw (0, error_handler_util_1.createError)(404, `${this.model.modelName} not found`);
            }
            await doc.deleteOne();
            return { message: `${this.model.modelName} deleted successfully` };
        }
        catch (err) {
            throw (0, error_handler_util_1.createError)(500, `Error deleting ${this.model.modelName}`);
        }
    }
    async validateUnique(field, value, excludeId = null) {
        const query = {
            [field]: value,
        };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const exists = await this.model.exists(query);
        return !exists;
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=base.service.js.map