const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, cartController.getCart);            // fetch cart
router.post("/", protect, cartController.addToCart);         // add item
router.put("/:productId", protect, cartController.updateCart); // update quantity
router.delete("/:productId", protect, cartController.removeFromCart); // remove item
router.delete("/", protect, cartController.clearCart);       // clear cart


module.exports = router;
