"use client";

import { useState } from "react";
import api from "@/lib/axios";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- CHANGE USERNAME ---------------- */
  const changeUsername = async () => {
    if (!username.trim()) {
      alert("Username cannot be empty");
      return;
    }

    try {
      setLoading(true);
      await api.put("/user/username", { username });
      alert("Username updated successfully");
      setUsername("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Username update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CHANGE PASSWORD ---------------- */
  const changePassword = async () => {
    if (!oldPassword || !newPassword) {
      alert("Both passwords required");
      return;
    }

    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await api.put("/user/password", { oldPassword, newPassword });
      alert("Password updated successfully");
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Password update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE ACCOUNT (DANGER) ---------------- */
  const deleteAccount = async () => {
    const password = prompt(
      "⚠️ This will permanently delete your account.\nEnter your password to confirm:"
    );

    if (!password) return;

    try {
      setLoading(true);
      await api.delete("/user/me", {
        data: { password },
      });

      localStorage.clear();
      window.location.replace("/login");
    } catch (err: any) {
      alert(err.response?.data?.message || "Account deletion failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-[#0b141a] text-white p-6">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {/* USERNAME */}
      <div className="mb-8 max-w-md">
        <h2 className="text-lg mb-2">Change Username</h2>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-[#2a3942] p-3 rounded outline-none mb-3"
          placeholder="New username"
        />
        <button
          onClick={changeUsername}
          disabled={loading}
          className="bg-green-600 px-4 py-2 rounded disabled:opacity-50"
        >
          Save Username
        </button>
      </div>

      {/* PASSWORD */}
      <div className="mb-10 max-w-md">
        <h2 className="text-lg mb-2">Change Password</h2>
        <input
          type="password"
          placeholder="Old password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="w-full bg-[#2a3942] p-3 rounded outline-none mb-3"
        />
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full bg-[#2a3942] p-3 rounded outline-none mb-3"
        />
        <button
          onClick={changePassword}
          disabled={loading}
          className="bg-green-600 px-4 py-2 rounded disabled:opacity-50"
        >
          Update Password
        </button>
      </div>

      {/* DANGER ZONE */}
      <div className="border-t border-gray-700 pt-6 max-w-md">
        <h2 className="text-red-500 text-lg mb-3">Danger Zone</h2>
        <button
          onClick={deleteAccount}
          disabled={loading}
          className="bg-red-600 px-4 py-2 rounded disabled:opacity-50"
        >
          Delete Account Permanently
        </button>
      </div>
    </div>
  );
}
