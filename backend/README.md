# Product Browser API

A production-quality backend for browsing 200,000 products with **cursor-based keyset pagination** and **snapshot isolation** for consistent browsing under concurrent data changes.

## Tech Stack

- Node.js + Express
- PostgreSQL (via `pg` driver)
- `@faker-js/faker` for seed data generation
- `dotenv` for configuration

## Project Structure

```
src/
  config/         - Environment configuration
  controllers/    - Request handlers
  db/             - PostgreSQL connection pool
  middleware/      - Validation, error handling, 404
  routes/         - Express route definitions
  utils/          - Cursor encoding/decoding, pagination logic
scripts/
  setup-db.js     - Apply SQL schema
  seed.js         - Generate 200,000 products
sql/
  schema.sql      - Table definition and indexes
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (local or hosted: Neon, Render, etc.)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# 3. Create schema
npm run db:setup

# 4. Seed 200,000 products
npm run db:seed

# 5. Start the server
npm run dev
```

## API Documentation

### `GET /api/products`

Returns products in newest-first order using cursor-based pagination.

**Query Parameters:**

| Parameter  | Type   | Required | Default | Description |
|------------|--------|----------|---------|-------------|
| `limit`    | int    | No       | 20      | Number of products per page (1-100) |
| `cursor`   | string | No       | -       | Opaque cursor from previous response |
| `category` | string | No       | -       | Filter by category |
| `snapshot` | string | No       | -       | Snapshot boundary timestamp from first response |

**Response:**

```json
{
  "products": [
    {
      "id": 12345,
      "name": "Ergonomic Steel Soap - Concrete Chicken",
      "category": "Electronics",
      "price": "89.99",
      "created_at": "2025-08-15T10:30:00.000Z",
      "updated_at": "2025-11-20T14:22:00.000Z"
    }
  ],
  "nextCursor": "MjAyNS0xMS0yMFQxNDoyMjowMC4wMDBafDEyMzQ1",
  "hasMore": true,
  "snapshot": "2026-06-25T12:00:00.000Z"
}
```

**Fields:**

- `products` - Array of product objects (newest first)
- `nextCursor` - Pass as `cursor` param for next page; `null` when no more results
- `hasMore` - `true` if more results exist beyond this page
- `snapshot` - Capture this on first request; pass as `snapshot` param on all subsequent requests

### Example Requests

**First page (all products):**
```bash
curl "http://localhost:3000/api/products?limit=20"
```

**Filter by category:**
```bash
curl "http://localhost:3000/api/products?limit=20&category=Electronics"
```

**Paginate (use nextCursor and snapshot from previous response):**
```bash
curl "http://localhost:3000/api/products?limit=20&cursor=<nextCursor>&snapshot=<snapshot>"
```

**Health check:**
```bash
curl "http://localhost:3000/health"
```

### Error Responses

**400 - Invalid parameters:**
```json
{ "error": "limit must be an integer between 1 and 100" }
```

**400 - Invalid cursor:**
```json
{ "error": "Invalid cursor" }
```

**404 - Unknown route:**
```json
{ "error": "Route not found: GET /unknown" }
```

## Pagination Design

### Why Cursor (Keyset) Pagination?

| Approach  | Time Complexity | Deep Pages   | Consistent Under Writes |
|-----------|----------------|-------------|------------------------|
| OFFSET    | O(offset + n)  | Very slow   | No — duplicates/skips  |
| Cursor    | O(limit)       | Always fast | Partial (see below)    |

OFFSET pagination at page 5,000 (OFFSET 100,000) requires Postgres to scan 100,001 rows and discard 100,000. Cursor pagination seeks directly via the index — constant time regardless of depth.

### Why OFFSET Fails Under Concurrent Changes

```
Time 1: Page 1 = [A, B, C, D, E]        cursor -> F
Time 2: Product X gets updated (jumps to top of sort)
Time 3: Page 2 (cursor -> F) = [X, F, G, H, I, J]   X is a DUPLICATE
         Product J was displaced → MISSED
```

### Why Snapshot Isolation Is Required

Plain cursor pagination solves INSERTs (new rows sort before the cursor, appearing on already-fetched pages). But **UPDATEs** cause duplicates because the updated product re-enters the visible range with a new timestamp.

**Solution: Snapshot boundary**

1. First request captures `snapshot = MAX(updated_at)`.
2. All subsequent queries add `WHERE updated_at <= snapshot`.
3. Updated products (with new timestamps) are excluded from later pages.
4. They were already returned on earlier pages with their old timestamps.
5. **No duplicates, no missed records.**

**Trade-off:** The user sees a frozen view during their browsing session. This is the correct behavior for paginated browsing — consistency matters more than real-time freshness.

### Composite Index

```sql
CREATE INDEX idx_products_category_updated_id
  ON products (category, updated_at DESC, id DESC);
```

This index covers:
- **Category filter** (`WHERE category = $1`) — prefix of index
- **Ordering** (`ORDER BY updated_at DESC, id DESC`) — middle + suffix
- **Keyset pagination** (`updated_at < X OR (updated_at = X AND id < Y)`) — covered by the same index columns

The query planner performs an **Index Only Scan** when visibility checks allow it, meaning zero heap fetches — maximum performance.

### Expected Performance

| Row Count  | Query Time (estimated) |
|------------|----------------------|
| 200K       | <5ms                  |
| 1M         | <10ms                 |
| 10M        | <20ms                 |
| 100M       | <50ms                 |

The limiting factor is I/O, not CPU. Postgres can traverse B-tree indexes at ~1,000 levels/μs.

## Seed Script

The seed script uses batched inserts (5,000 rows per batch) with `@faker-js/faker` for realistic product data:

- **Names**: Category-specific products with brand prefixes (e.g. "Barton and Sons Tablet Stand Holder")
- **Categories**: 10 realistic categories (Electronics, Clothing, etc.)
- **Prices**: Indian Rupee prices (₹49 – ₹84,999) with category-appropriate ranges
- **Timestamps**: Random dates within the past year

```bash
npm run db:seed   # Inserts 200,000 products
```

## Deployment

### Render + Neon

1. **Create a Neon database** at [neon.tech](https://neon.tech) and copy the connection string.

2. **Create a Render Web Service:**
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables:
     - `DATABASE_URL`: Your Neon connection string
     - `NODE_ENV`: `production`

3. **Run setup on first deploy** (add to Render startup command):
   ```bash
   node scripts/setup-db.js && node scripts/seed.js && node src/server.js
   ```

### Docker (optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "node scripts/setup-db.js && npm run db:seed && node src/server.js"]
```

## License

MIT
