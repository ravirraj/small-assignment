const { fetchProducts } = require("../utils/pagination");

async function getProducts(req, res) {
  try {
    const { limit, cursor, category } = req.validated;
    const snapshot = req.query.snapshot || null;

    const result = await fetchProducts({ limit, cursor, category, snapshot });
    return res.json(result);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message });
  }
}

module.exports = { getProducts };
