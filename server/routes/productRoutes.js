// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const path = require("path");
const productController = require(path.join(__dirname, "..", "controllers", "productController.js"));

// Place the featured route before the dynamic :id route
router.get('/featured', productController.getFeaturedProducts);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
