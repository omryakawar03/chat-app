"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { initSocket, getSocket } from "@/lib/socket";
import { Message } from "@/types/chat";

export default function ChatPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketInitialized = useRef(false);

  /* ---------------- AUTH CHECK ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const uid = localStorage.getItem("userId");

    if (!token || !uid) {
      router.replace("/login");
      return;
    }

    setUserId(uid);
    setLoading(false);
  }, [router]);

  /* ---------------- RESTORE LAST CHAT (🔥 NEW) ---------------- */
  useEffect(() => {
    const lastChat = localStorage.getItem("activeChatUserId");
    if (lastChat) {
      setSelectedUserId(lastChat);
    }
  }, []);

  /* ---------------- LOAD USERS ---------------- */
  useEffect(() => {
    if (!userId) return;
    api.get("/user/all").then((res) => setUsers(res.data));
  }, [userId]);

  /* ---------------- INIT SOCKET (ONCE) ---------------- */
  useEffect(() => {
    if (!userId || socketInitialized.current) return;

    const socket = initSocket();
    if (!socket) return;

    socketInitialized.current = true;

    socket.on("chatMessages", (msgs: Message[]) => {
      setMessages(msgs);
    });

    socket.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);

      if (msg.sender === selectedUserId) {
        socket.emit("markSeen", { otherUserId: selectedUserId });
      }

      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    socket.on("typing", ({ from }: { from: string }) => {
      setTypingUser(from);
      setTimeout(() => setTypingUser(null), 1500);
    });

    socket.on("userStatus", (data: any) => {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === data.userId
            ? { ...u, isOnline: data.isOnline, lastSeen: data.lastSeen }
            : u
        )
      );
    });
  }, [userId, selectedUserId]);

  /* ---------------- OPEN CHAT ---------------- */
  useEffect(() => {
    if (!userId || !selectedUserId) return;

    // 🔥 persist active chat
    localStorage.setItem("activeChatUserId", selectedUserId);

    setMessages([]);
    getSocket()?.emit("openChat", {
      otherUserId: selectedUserId,
    });
  }, [selectedUserId, userId]);

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = () => {
    if (!text.trim() || !selectedUserId) return;

    getSocket()?.emit("sendMessage", {
      receiver: selectedUserId,
      text,
    });

    setText("");
  };

  const selectedUser = users.find((u) => u._id === selectedUserId);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0b141a] text-white">
        Loading chats...
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="flex h-screen bg-[#0b141a] text-white">
      {/* USERS LIST */}
      <div
        className={`w-full sm:w-72 bg-[#111b21] border-r border-gray-700 ${
          selectedUserId ? "hidden sm:block" : ""
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-bold">Chats</h2>

          {/* PROFILE MENU */}
          <div className="relative">
            <div
              onClick={() => setShowMenu(!showMenu)}
              className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center cursor-pointer"
            >
              {users.find((u) => u._id === userId)?.username?.[0]?.toUpperCase()}
            </div>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-[#202c33] rounded shadow-lg z-50">
                <p
                  onClick={() => router.push("/profile")}
                  className="px-4 py-2 hover:bg-[#2a3942] cursor-pointer"
                >
                  Profile
                </p>
                <p
                  onClick={() => router.push("/settings")}
                  className="px-4 py-2 hover:bg-[#2a3942] cursor-pointer"
                >
                  Settings
                </p>
                <p
                  onClick={() => {
                    localStorage.clear();
                    window.location.replace("/login");
                  }}
                  className="px-4 py-2 text-red-400 hover:bg-[#2a3942] cursor-pointer"
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>

        {users
          .filter((u) => u._id !== userId)
          .map((u) => (
            <div
              key={u._id}
              onClick={() => setSelectedUserId(u._id)}
              className="flex items-center gap-3 p-4 border-b border-gray-800 cursor-pointer hover:bg-[#1f2c33]"
            >
              <div className="w-10 h-10 rounded-full bg-[#2a3942] flex items-center justify-center">
                {u.username[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{u.username}</p>
                <p className="text-xs text-gray-400">
                  {u.isOnline ? "online" : "offline"}
                </p>
              </div>
            </div>
          ))}
      </div>

      {/* CHAT AREA */}
      {selectedUserId && (
        <div className="flex-1 flex flex-col">
          {/* HEADER */}
          <div className="p-4 bg-[#202c33] border-b border-gray-600 flex items-center gap-3">
            <button
              className="sm:hidden"
              onClick={() => {
                setSelectedUserId(null);
                localStorage.removeItem("activeChatUserId"); // 🔥 clear on back
              }}
            >
              ←
            </button>

            <div
              onClick={() => router.push(`/profile/${selectedUserId}`)}
              className="w-10 h-10 rounded-full bg-[#2a3942] flex items-center justify-center cursor-pointer"
            >
              {selectedUser?.username?.[0]?.toUpperCase()}
            </div>

            <div>
              <p className="font-bold">{selectedUser?.username}</p>
              <p className="text-xs text-gray-300">
                {selectedUser?.isOnline ? "online" : "offline"}
                {typingUser === selectedUserId && " • typing..."}
              </p>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-xs p-3 rounded-xl ${
                  m.sender === userId
                    ? "ml-auto bg-[#005c4b]"
                    : "bg-[#233138]"
                }`}
              >
                {m.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div className="p-3 bg-[#1f2c33] flex gap-3">
            <input
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                getSocket()?.emit("typing", { to: selectedUserId });
              }}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 p-3 bg-[#2a3942] rounded outline-none"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="px-4 bg-green-600 rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}