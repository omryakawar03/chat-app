"use client";

import { useState } from "react";
import axios from "axios";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!username || !password) {
      alert("Fill all fields");
      return;
    }

    setLoading(true);

    try {
      const url = isLogin
        ? "http://localhost:3001/auth/login"
        : "http://localhost:3001/auth/register";

      const res = await axios.post(url, {
        username: username.trim(),
        password,
      });

      console.log("AUTH RESPONSE 👉", res.data);

      // 🔒 SAFETY CHECK
      if (!res.data?.user || !res.data?.token) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);

      window.location.href = "/chat";
    } catch (err: any) {
      console.error(
        "LOGIN ERROR 👉",
        err?.response?.data || err.message
      );

      alert(
        err?.response?.data?.message ||
          "Invalid username or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center bg-[#0b141a] overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-10 left-20 w-72 h-72 bg-pink-500 opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-10 right-20 w-72 h-72 bg-purple-500 opacity-20 blur-3xl rounded-full"></div>

      <div className="relative w-full max-w-sm bg-[#111b21] p-8 rounded-xl shadow-lg z-10">
        <h1 className="text-white text-3xl font-bold text-center mb-6">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>

        <input
          placeholder="Username"
          value={username}
          className="w-full bg-[#1f2c33] text-white p-3 rounded mb-3 outline-none"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          className="w-full bg-[#1f2c33] text-white p-3 rounded mb-6 outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={submit}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-lg font-bold text-white transition ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading
            ? "Please wait..."
            : isLogin
            ? "Login"
            : "Register"}
        </button>

        <p className="text-center text-gray-400 mt-4">
          {isLogin ? "No account? " : "Already have an account? "}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-500 cursor-pointer"
          >
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}
