const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const User = require("../models/User");
const { protect, admin } = require("../middleware/authMiddleware"); 

// ----------------------
// User routes
// ----------------------

// Update personal details
router.patch("/update-personal", protect, userController.updatePersonal);

// Update shipping address
router.patch("/update-address", protect, userController.updateAddress);

// Check if email exists
router.get("/check-email", userController.checkEmail);

// Register user directly (Signup)
router.post("/register", userController.registerUser);

// Login OTP send & verify
router.post("/send-login-otp", userController.sendLoginOtp);
router.post("/verify-login-otp", userController.verifyLoginOtp);

// Get logged-in user details
router.get("/me", protect, userController.getMe);

// Get user favorites
router.get("/:id/favorites", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("favorites");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ favorites: user.favorites || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching favorites" });
  }
});

// Update user favorites
router.put("/:id/favorites", protect, async (req, res) => {
  try {
    const { favorites } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { favorites },
      { new: true, runValidators: true }
    ).select("favorites");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating favorites" });
  }
});

// ----------------------
// Admin routes
// ----------------------

// Get all users (admin only)
router.get("/", protect, admin, userController.getAllUsers);

// Delete user (admin only)
router.delete("/:id", protect, userController.deleteUser);

// ----------------------
// Temporary public route to fetch all users (no auth, for initial setup)
// ----------------------
router.get("/all", async (req, res) => {
  try {
    const users = await User.find().select("name email orders");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

module.exports = router;
