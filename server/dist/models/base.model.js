"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
class BaseModel {
    static createSlug(field) {
        return function (next) {
            if (this.isModified(field)) {
                this.slug = this[field]
                    .toLowerCase()
                    .replace(/[^a-zA-Z0-9]/g, "-")
                    .replace(/-+/g, "-");
            }
            next();
        };
    }
    static addTimestamps(schema) {
        schema.set("timestamps", true);
    }
    static addIndexes(schema, indexes) {
        indexes.forEach((index) => schema.index(index));
    }
}
exports.BaseModel = BaseModel;
//# sourceMappingURL=base.model.js.map