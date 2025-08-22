import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { auth, provider } from "../firebase"; // import firebase auth
import { signInWithPopup } from "firebase/auth";
import { FaGoogle } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [sendButtonText, setSendButtonText] = useState("Send OTP");

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // If user already logged in, block Login page
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  // ----------------- OTP HANDLERS -----------------
  const sendOtp = async () => {
    setError("");
    if (!validateEmail(email)) return setError("Invalid email format.");

    try {
      setSendingOtp(true);
      const res = await fetch(
        "http://localhost:5000/api/users/send-login-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        // Instead of redirect, show inline error
        if (data.message === "Email not registered. Please signup first.") {
          return setError("Email not registered. Please sign up first.");
        }
        return setError(data.message || "Failed to send OTP");
      }

      setOtpSent(true);
      setTimer(data.otpExpiry);
      setOtp(""); // clear OTP input
      setSendButtonText("OTP Sent");
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    if (!otp.trim()) return setError("OTP is required.");

    try {
      setVerifyingOtp(true);
      const res = await fetch(
        "http://localhost:5000/api/users/verify-login-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );
      const data = await res.json();

      if (!res.ok) return setError(data.message || "OTP verification failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ----------------- GOOGLE LOGIN -----------------
  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email;
      const name = user.displayName;

      const res = await fetch("http://localhost:5000/api/users/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Google login failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#faeed8]  px-4">
      <div className="p-8 md:p-10 bg-[#f4dcb1] rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">
          Login
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {!otpSent ? (
          <>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4 p-3 w-full border border-yellow-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800 focus:border-yellow-800 bg-yellow-50 placeholder-gray-400"
            />
            <button
              onClick={sendOtp}
              disabled={sendingOtp}
              className="w-full bg-yellow-700 hover:bg-yellow-800 text-gray-900 font-semibold py-3 rounded-lg mb-4 shadow-sm transition-all duration-200"
            >
              {sendingOtp ? "Sending OTP..." : sendButtonText}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mb-4 p-3 w-full border border-yellow-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800 focus:border-yellow-800 bg-[#faeed8]  placeholder-gray-400"
            />
            <button
              onClick={verifyOtp}
              disabled={verifyingOtp}
              className="w-full bg-yellow-800 hover:bg-yellow-600 text-gray-900 font-semibold py-3 rounded-lg mb-2 shadow-sm transition-all duration-200"
            >
              {verifyingOtp ? "Verifying OTP..." : "Verify OTP"}
            </button>

            <p className="text-center text-gray-700 mt-2">
              {timer > 0 ? (
                `Resend OTP in ${timer}s`
              ) : (
                <button
                  onClick={() => {
                    setOtp("");
                    sendOtp();
                    setSendButtonText("OTP Sent");
                  }}
                  disabled={sendingOtp}
                  className="text-yellow-600 font-semibold underline cursor-pointer bg-transparent border-0"
                >
                  Resend OTP
                </button>
              )}
            </p>
          </>
        )}
        {/* -------- Google Sign-In -------- */}
        <button
          onClick={googleLogin}
          className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3 rounded-lg mb-4 shadow-sm transition-all duration-200 mt-4 flex items-center justify-center gap-2"
        >
          <FaGoogle size={20} />
          Sign in with Google
        </button>

        <p className="mt-4 text-center text-gray-700">
          New user?{" "}
          <span
            className="text-yellow-600 cursor-pointer font-semibold"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
