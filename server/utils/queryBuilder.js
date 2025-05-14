class QueryBuilder {
  constructor(baseQuery = {}) {
    this.query = { ...baseQuery };
  }

  addFilter(field, value) {
    if (value) this.query[field] = value;
    return this;
  }

  addRangeFilter(field, min, max) {
    if (min || max) {
      this.query[field] = {};
      if (min) this.query[field].$gte = Number(min);
      if (max) this.query[field].$lte = Number(max);
    }
    return this;
  }

  addSearchFilter(fields, searchTerm) {
    if (searchTerm) {
      this.query.$or = fields.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      }));
    }
    return this;
  }

  build() {
    return this.query;
  }
}
