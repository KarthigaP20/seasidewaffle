const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Order = require("../models/Order");
const Product = require('../models/Product.js')



// Temporary in-memory OTP store for login
const loginOtpStore = new Map();

// ------------------------
// Check Email
// ------------------------
const checkEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists. Please login." });

    res.json({ message: "Email available" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------
// Register User
// ------------------------
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, isVerified: true });
    await user.save();

    // Send welcome email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Sea Side Waffle" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Sea Side Waffle!",
      html: `<h2>Welcome ${name}!</h2><p>Thank you for joining Sea Side Waffle. Enjoy our delicious waffles 🍫🧇.</p>`,
    });

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------
// Send Login OTP
// ------------------------
const sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not registered. Please signup first." });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    loginOtpStore.set(email, { otp, expires: Date.now() + 50 * 1000 }); // 50 seconds

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Sea Side Waffle" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Login",
      text: `Your login OTP is ${otp}. It will expire in 50 seconds.`,
    });

    res.json({ message: "OTP sent to your email", otpExpiry: 50 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------
// Verify Login OTP
// ------------------------
const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const record = loginOtpStore.get(email);
    if (!record) return res.status(400).json({ message: "No OTP requested for this email" });
    if (record.expires < Date.now()) {
      loginOtpStore.delete(email);
      return res.status(400).json({ message: "OTP expired. Please request again." });
    }
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    
    // Enforce admin ONLY for seasidewaffle@gmail.com
    if (email.toLowerCase() === "seasidewaffle@gmail.com") {
      if (!user.isAdmin) {
        user.isAdmin = true;
        await user.save();
      }
    } else {
      // Force remove admin for all other users
      if (user.isAdmin) {
        user.isAdmin = false;
        await user.save();
      }
    }

    
    // Create JWT with isAdmin flag
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    loginOtpStore.delete(email);

    res.json({
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------
// Google Login
// ------------------------
const googleLogin = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) return res.status(400).json({ message: "Email and name required" });

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      // Reject unregistered users
      return res.status(400).json({ message: "This email is not registered. Please signup first." });
    }

    // Ensure admin flag is correct
    if (email.toLowerCase() === "seasidewaffle@gmail.com") {
      if (!user.isAdmin) {
        user.isAdmin = true;
        await user.save();
      }
    } else {
      if (user.isAdmin) {
        user.isAdmin = false;
        await user.save();
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google login failed" });
  }
};


// ------------------------
// Protect middleware
// ------------------------
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};
// ------------------------
// Get Logged-in User
// ------------------------
const getMe = async (req, res) => {
  try {
    // req.user comes from your protect middleware
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Personal Details
const updatePersonal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body; // only allow name & phone to update
    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(user); // return updated user
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating personal details" });
  }
};

// Update Address
const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { line1, city, state, pincode, country } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { address: { line1, city, state, pincode, country } },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(user); // return updated user
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating address" });
  }
};


// ------------------------
// NEW: Admin Middleware
// ------------------------
const admin = (req, res, next) => {
  if (req.user?.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
};


const getAllUsers = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find();

    // For each user, fetch order count
    const formattedUsers = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ user: user._id });
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
        
        };
      })
    );

    res.json(formattedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Delete user by ID
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------
// Admin Stats (total users, orders)
// ------------------------
const getAdminStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const orderCount = await Order.countDocuments();
    const productCount = await Product.countDocuments(); 

    res.json({
      users: userCount,
      orders: orderCount,
      products: productCount, 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

// ------------------------
// Export all functions
// ------------------------
module.exports = {
  checkEmail,
  registerUser,
  sendLoginOtp,
  verifyLoginOtp,
  googleLogin, 
  protect,
  getMe,
  updatePersonal,
  updateAddress,
  admin,
  getAllUsers,
  deleteUser,
  getAdminStats,
};
