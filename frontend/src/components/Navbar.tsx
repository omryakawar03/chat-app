"use client";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="w-full py-4 px-6 bg-[#111b21] text-white flex justify-between items-center shadow-md">
      {/* Logo */}
      <div
        onClick={() => router.push("/")}
        className="text-2xl font-extrabold cursor-pointer tracking-wide"
      >
       O<span className="text-pink-300">P</span>
      </div>

      {/* Nav Buttons */}
      <div className="flex gap-6">
        <button
          onClick={() => router.push("/login")}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
        >
          Login
        </button>
      </div>
    </nav>
  );
}
