const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOTPEmail(to, otp) {
  try {
    const mailOptions = {
      from: `"Sea Side Waffle" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your OTP for Account Verification",
      text: `Your OTP code is ${otp}. It will expire in 50s`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${to}: ${info.response}`);
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Failed to send OTP email");
  }
}

module.exports = { sendOTPEmail };
