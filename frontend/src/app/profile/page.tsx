"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function ProfilePage() {
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  /* LOAD PROFILE */
  useEffect(() => {
    api.get("/user/me").then((res) => {
      setBio(res.data.bio || "");
      setAvatar(res.data.avatar || "");
    });
  }, []);

  /* UPLOAD AVATAR */
  const uploadAvatar = async () => {
    if (!file) return alert("Select an image");

    const form = new FormData();
    form.append("file", file);

    try {
      setLoading(true);
      const res = await api.post("/user/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatar(res.data.avatar);
      alert("Profile image updated");
    } catch (err: any) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* SAVE BIO */
  const saveBio = async () => {
    try {
      setLoading(true);
      await api.put("/user/profile", { bio });
      alert("Profile updated");
    } catch {
      alert("Failed to update bio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-white p-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      {/* AVATAR */}
      <div className="mb-6">
        <div className="w-24 h-24 rounded-full bg-[#2a3942] overflow-hidden mb-3">
          {avatar && (
            <img
              src={avatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-2"
        />

        <button
          onClick={uploadAvatar}
          disabled={loading}
          className="bg-green-600 px-4 py-2 rounded disabled:opacity-50"
        >
          Upload Image
        </button>
      </div>

      {/* BIO */}
      <div className="max-w-md">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write something about yourself..."
          className="w-full bg-[#2a3942] p-3 rounded outline-none mb-3"
        />

        <button
          onClick={saveBio}
          disabled={loading}
          className="bg-green-600 px-4 py-2 rounded disabled:opacity-50"
        >
          Save Bio
        </button>
      </div>
    </div>
  );
}
