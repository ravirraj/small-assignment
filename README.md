# Product Browser

A full-stack application for browsing 200,000 products with cursor-based pagination and snapshot isolation for consistent browsing under concurrent data changes.

## Project Structure

```
small-assignment/
├── backend/          Node.js + Express API
│   ├── src/          Application source code
│   ├── scripts/      Database setup and seed scripts
│   └── sql/          Schema and migrations
└── frontend/         React + TypeScript UI
    └── src/          Components, services, types
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (local or hosted)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env    # Update DATABASE_URL with your credentials
npm run db:setup        # Create schema
npm run db:seed         # Seed 200,000 products
npm run dev             # Start on port 3000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev             # Start on port 5173 (proxies /api to :3000)
```

Open http://localhost:5173 in your browser.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Node.js, Express, PostgreSQL, `pg`  |
| Frontend | React, TypeScript, Vite, Tailwind   |
| Data     | 200,000 products with INR prices    |

## API

### `GET /api/products`

| Parameter  | Type   | Default | Description                     |
|------------|--------|---------|---------------------------------|
| `limit`    | int    | 20      | Products per page (1-100)       |
| `cursor`   | string | -       | Opaque cursor for next page     |
| `category` | string | -       | Filter by category              |
| `snapshot` | string | -       | Snapshot boundary for consistency |

**Response:**

```json
{
  "products": [{ "id": 1, "name": "...", "category": "...", "price": "499", "created_at": "...", "updated_at": "..." }],
  "nextCursor": "base64-encoded-cursor",
  "hasMore": true,
  "snapshot": "2026-06-25T12:00:00.000Z"
}
```

### Categories

Electronics, Clothing, Home & Garden, Sports, Books, Toys, Health, Automotive, Food, Office

## Pagination Design

This application uses **cursor (keyset) pagination** with **snapshot isolation** to guarantee no duplicate or skipped products under concurrent writes.

### Why not OFFSET?

OFFSET pagination discards rows and gets slower with depth. At OFFSET 100,000, Postgres reads 100,001 rows and throws away 100,000. Cursor pagination is O(1) at any depth.

### Why snapshot isolation?

Plain cursor pagination fails when existing products are updated (their timestamp changes, causing them to reappear on earlier pages as duplicates). The snapshot boundary (`WHERE updated_at <= snapshot`) freezes the view for the duration of a browsing session.

### Composite index

```sql
CREATE INDEX idx_products_category_updated_id
  ON products (category, updated_at DESC, id DESC);
```

Covers filtering, ordering, and keyset pagination in a single index.

## Deployment

### Backend (Render + Neon)

1. Create a Neon database and copy the connection string
2. Create a Render Web Service with:
   - Build: `npm install`
   - Start: `npm start`
   - Env: `DATABASE_URL=<your-neon-url>`, `NODE_ENV=production`
3. First deploy runs: `node scripts/setup-db.js && npm run db:seed && node src/server.js`

### Frontend (Vercel / Netlify)

1. Set build command to `npm run build` and output dir to `dist`
2. Set environment variable `VITE_API_URL` if backend is on a different domain

## License

MIT
