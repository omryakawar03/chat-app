"use client"
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
export default function Home() {
  
 const router = useRouter();

  return (
    <main className="h-screen w-full relative overflow-hidden bg-[#0b141a]">

      {/* Glow Circles */}
      <div className="absolute top-10 left-20 w-72 h-72 bg-green-500 opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-10 right-20 w-72 h-72 bg-blue-500 opacity-20 blur-3xl rounded-full"></div>

      {/* Content */}
      <div className="h-full w-full flex items-center justify-center text-center px-6 relative z-10 animate-fadeIn">
        <div className="max-w-2xl">
       

          <button
            onClick={() => router.push("/login")}
            className="px-10 py-4 bg-green-600 hover:bg-green-700 text-xl font-semibold rounded-xl transition shadow-lg"
          >
            Get Started
          </button>
        </div>
      </div>
</main>
)
}
