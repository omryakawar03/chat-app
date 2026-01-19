import { io, Socket } from "socket.io-client";

let socket: Socket | null=null;

export const initSocket = (userId: string) => {
  if (!socket) {
    socket = io("http://localhost:3001", {
      query: {  userId: typeof window !== "undefined" ? localStorage.getItem("userId") : "", }, // 🔥 userId guaranteed
    transports: ["websocket"]
    
    });
  }
  return socket;
};
export const getSocket = () => socket;