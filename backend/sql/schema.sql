DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  price       NUMERIC(10, 2) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Primary lookup index for category filtering + ordering.
-- Without a category filter: the DB scans this index backwards (DESC) for the
-- default "newest first" ordering.  With a category filter: the DB can do an
-- index-only scan limited to the matching category prefix, which is extremely
-- fast even on hundreds of millions of rows.
CREATE INDEX idx_products_category_updated_id
  ON products (category, updated_at DESC, id DESC);

-- Fallback index for the unfiltered case (all categories, newest first).
CREATE INDEX idx_products_updated_id
  ON products (updated_at DESC, id DESC);
