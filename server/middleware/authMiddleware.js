const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// Protect routes: validate JWT and attach user to req
exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // attach full user object
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

// Admin middleware: allow only if user.isAdmin
exports.admin = (req, res, next) => {
  if (!req.user?.isAdmin)
    return res.status(403).json({ message: "Admin access only" });
  next();
};
