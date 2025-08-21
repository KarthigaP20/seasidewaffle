import express from "express";
import { sendOTPEmail } from "../services/emailService.js";

const router = express.Router();
const otpStore = {}; // TEMP storage, replace with DB in production

// Signup request
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  // Send OTP via email
  await sendOTPEmail(email, otp);

  res.json({ message: "OTP sent to email. Please verify to complete signup." });
});

// Verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ message: "No OTP found for this email" });
  }

  if (record.expires < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // Create user in DB here
  delete otpStore[email];

  res.json({ message: "Account verified successfully!" });
});

export default router;
