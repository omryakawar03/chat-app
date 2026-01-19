import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = () => {
  if (socket) return socket;

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  if (!token) {
    console.warn("❌ No token found for socket");
    return null;
  }

  socket = io("http://localhost:3001", {
    auth: {
      token, // ✅ ONLY JWT
    },
    transports: ["websocket"],
  });

  return socket;
};

export const getSocket = () => socket;
