const { Router } = require("express");
const { validateProductsQuery } = require("../middleware/validate");
const { getProducts } = require("../controllers/products");

const router = Router();

router.get("/products", validateProductsQuery, getProducts);

module.exports = router;
