/**
 * Parses req.query into Mongoose-compatible filter, sort, pagination, and field selection.
 *
 * Usage:
 *   const q = new QueryBuilder(req.query, ['status', 'tier', 'createdAt']);
 *   const docs = await Model.find(q.filter).sort(q.sort).skip(q.skip).limit(q.limit).select(q.fields);
 */
export class QueryBuilder {
  constructor(query = {}, allowedFilters = []) {
    this.raw = query;
    this.allowedFilters = allowedFilters;
    this._parse();
  }

  _parse() {
    // --- Pagination ---
    this.page = Math.max(parseInt(this.raw.page, 10) || 1, 1);
    this.limit = Math.min(Math.max(parseInt(this.raw.limit, 10) || 20, 1), 100);
    this.skip = (this.page - 1) * this.limit;

    // --- Sort ---
    // ?sort=-createdAt,name  →  { createdAt: -1, name: 1 }
    if (this.raw.sort) {
      this.sort = this.raw.sort.split(',').reduce((acc, field) => {
        const dir = field.startsWith('-') ? -1 : 1;
        const key = field.replace(/^-/, '');
        acc[key] = dir;
        return acc;
      }, {});
    } else {
      this.sort = { createdAt: -1 };
    }

    // --- Field selection ---
    // ?fields=name,email  →  'name email'
    this.fields = this.raw.fields
      ? this.raw.fields.split(',').join(' ')
      : '-__v';

    // --- Filters ---
    // Only allow explicitly permitted filter keys.
    // Supports operators: ?price[gte]=10&price[lte]=50
    this.filter = {};
    const opMap = { gte: '$gte', gt: '$gt', lte: '$lte', lt: '$lt', ne: '$ne' };

    for (const key of this.allowedFilters) {
      const val = this.raw[key];
      if (val === undefined) continue;

      if (typeof val === 'object' && !Array.isArray(val)) {
        // Handle operators: ?createdAt[gte]=2024-01-01
        this.filter[key] = {};
        for (const [op, mongoOp] of Object.entries(opMap)) {
          if (val[op] !== undefined) {
            this.filter[key][mongoOp] = isNaN(val[op]) ? val[op] : Number(val[op]);
          }
        }
      } else {
        this.filter[key] = val;
      }
    }

    // --- Search ---
    if (this.raw.q) {
      this.search = this.raw.q;
    }
  }
}
