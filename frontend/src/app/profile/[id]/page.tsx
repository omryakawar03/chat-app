"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useParams } from "next/navigation";

export default function OtherProfile() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api.get(`/user/${id}`).then(res => setUser(res.data));
  }, [id]);

  if (!user) return null;

  return (
    <div className="p-6 text-white bg-blue-950 flex flex-col items-center rounded min-h-screen justify-center">
      <div className="w-20 h-20 rounded-full bg-gray-600 mb-4">
        {user.avatar && <img src={user.avatar} className="rounded-full" />}
      </div>
      <h2 className="text-xl">{user.username}</h2>
      
      <p className="text-gray-400 ">{user.bio}</p>
    </div>
  );
}