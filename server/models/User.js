const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
   favorites: { type: [String], default: [] },

  phone: { type: String, default: "" }, // Add phone
  address: {
    line1: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    country: { type: String, default: "" },
    
  },

  otp: { type: String },             // to store the current OTP (optional)
  isVerified: { type: Boolean, default: false },  // track if user verified via OTP

   orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
