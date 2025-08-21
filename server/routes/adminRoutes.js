const express = require("express");
const { protect, admin, getAdminStats } = require("../controllers/userController"); 
const router = express.Router();

// Admin stats endpoint
router.get("/stats", protect, admin, getAdminStats);

module.exports = router;
