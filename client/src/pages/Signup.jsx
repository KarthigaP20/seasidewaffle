import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Block Signup if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setErr("");

    if (!username.trim()) return setErr("Username is required.");
    if (!validateEmail(email)) return setErr("Invalid email format.");
    if (password.length < 6)
      return setErr("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setErr("Passwords do not match.");

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, email, password }),
      });
      const data = await res.json();

      if (!res.ok) return setErr(data.message || "Signup failed");

      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      setErr("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#faeed8] px-4">
      <form
        onSubmit={handleSignup}
        className="p-8 md:p-10 bg-[#F4DCB1] rounded-2xl shadow-2xl w-full max-w-md"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-gray-800 text-center">
          Create Your Account
        </h2>

        {err && <p className="text-red-500 text-sm mb-4">{err}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4 p-3 w-full border border-yellow-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800 bg-[#faeed8] "
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 p-3 w-full border border-yellow-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800 bg-[#faeed8] "
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 p-3 w-full border border-yellow-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800 bg-[#faeed8] "
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mb-4 p-3 w-full border border-yellow-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-800 bg-[#faeed8] "
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-800 hover:bg-yellow-700 text-gray-900 font-bold py-3 rounded-xl mb-4 shadow-lg transition-colors duration-200"
        >
          {loading ? "Registering..." : "Sign Up"}
        </button>

        <p className="mt-4 text-center text-gray-700">
          Already have an account?{" "}
          <span
            className="text-yellow-600 cursor-pointer font-semibold hover:underline"
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </p>
      </form>
    </div>
  );
}

export default Signup;
