import { Schema, IndexDefinition } from "mongoose";

export class BaseModel {
  static createSlug(field: string): (next: () => void) => void {
    return function (this: any, next: () => void): void {
      if (this.isModified(field)) {
        this.slug = this[field]
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]/g, "-")
          .replace(/-+/g, "-");
      }
      next();
    };
  }

  static addTimestamps(schema: Schema): void {
    schema.set("timestamps", true);
  }

  static addIndexes(schema: Schema, indexes: IndexDefinition[]): void {
    indexes.forEach((index) => schema.index(index));
  }
}
