/**
 * Validation middleware for the GET /products endpoint.
 *
 * Validates and normalizes query parameters:
 *  - limit: integer between 1 and 100 (default 20)
 *  - cursor: base64url-encoded string or null
 *  - category: non-empty string or null
 */
function validateProductsQuery(req, res, next) {
  const errors = [];

  // --- limit ---
  let limit = 20;
  if (req.query.limit !== undefined) {
    const parsed = parseInt(req.query.limit, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 100) {
      errors.push("limit must be an integer between 1 and 100");
    } else {
      limit = parsed;
    }
  }

  // --- cursor ---
  let cursor = null;
  if (req.query.cursor !== undefined) {
    const raw = String(req.query.cursor).trim();
    if (raw.length > 0) {
      cursor = raw;
    }
  }

  // --- category ---
  let category = null;
  if (req.query.category !== undefined) {
    const raw = String(req.query.category).trim();
    if (raw.length > 0) {
      category = raw;
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join("; ") });
  }

  req.validated = { limit, cursor, category };
  next();
}

module.exports = { validateProductsQuery };
