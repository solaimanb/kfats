export interface QueryFilter {
  [key: string]: any;
}

export class QueryBuilder {
  private query: QueryFilter;

  constructor(baseQuery: QueryFilter = {}) {
    this.query = { ...baseQuery };
  }

  addFilter(field: string, value: any) {
    if (value) this.query[field] = value;
    return this;
  }

  addRangeFilter(field: string, min: number | null, max: number | null) {
    if (min || max) {
      this.query[field] = {};
      if (min) this.query[field].$gte = Number(min);
      if (max) this.query[field].$lte = Number(max);
    }
    return this;
  }

  addSearchFilter(fields: string[], searchTerm: string) {
    if (searchTerm) {
      this.query.$or = fields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      }));
    }
    return this;
  }

  getQuery(): QueryFilter {
    return this.query;
  }
}
