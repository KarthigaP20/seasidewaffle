const CartItem = require("../models/cart");

// Get user's cart items
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await CartItem.find({ user: userId }).populate("product");

    res.json(
      cartItems.map((item) => ({
        id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        qty: item.qty,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add item to cart (no quantity increment)
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: productId } = req.body;

    // Check if product already exists in cart
    const exists = await CartItem.findOne({ user: userId, product: productId });
    if (exists) {
      return res.status(200).json({ message: "exists" }); // product already in cart
    }

    // Add new item
    const newItem = new CartItem({ user: userId, product: productId, qty: 1 });
    await newItem.save();

    res.status(201).json({ message: "added", item: newItem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update quantity (used in Cart page for + / -)
exports.updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { qty } = req.body;

    if (qty < 1) return res.status(400).json({ message: "Quantity must be at least 1" });

    const item = await CartItem.findOne({ user: userId, product: productId });
    if (!item) return res.status(404).json({ message: "Cart item not found" });

    item.qty = qty;
    await item.save();

    res.json({ message: "Quantity updated", item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await CartItem.findOneAndDelete({ user: userId, product: productId });
    res.json({ message: "removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await CartItem.deleteMany({ user: userId });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
