// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect } = require("../controllers/userController");

// Place a new order
router.post("/", protect, orderController.placeOrder);

// Get orders by user ID
router.get("/:userId", protect, orderController.getUserOrders);

//  Get all orders (Admin)
router.get("/", orderController.getAllOrders);



module.exports = router;
