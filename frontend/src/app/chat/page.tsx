"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { initSocket, getSocket } from "@/lib/socket";
import { Message } from "@/types/chat";

export default function ChatPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* ---------------- LOAD USER ID ---------------- */
  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) setUserId(id);
  }, []);

  /* ---------------- LOAD USERS ---------------- */
  useEffect(() => {
    axios.get("http://localhost:3001/user/all").then((res) => {
      setUsers(res.data);
    });
  }, []);

  /* ---------------- INIT SOCKET (ONCE) ---------------- */
  useEffect(() => {
    if (!userId) return;

    const socket = initSocket(userId);

    socket.on("chatMessages", (msgs: Message[]) => {
      console.log("📦 history loaded:", msgs.length);
      setMessages(msgs);
    });

    socket.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);

      if (msg.sender === selectedUserId) {
        socket.emit("markSeen", {
          userId,
          otherUserId: selectedUserId,
        });
      }

      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    socket.on("seenUpdate", () => {
      setMessages((prev) =>
        prev.map((m) =>
          m.sender === userId ? { ...m, seen: true } : m
        )
      );
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

    // ❌ DO NOT DISCONNECT HERE
  }, [userId]);

  /* ---------------- OPEN CHAT (LOAD DB HISTORY) ---------------- */
  useEffect(() => {
    if (!userId || !selectedUserId) return;

    const socket = getSocket();
    if (!socket) return;

    setMessages([]); // clear previous chat

    socket.emit("openChat", {
      userId,
      otherUserId: selectedUserId,
    });
  }, [selectedUserId, userId]);

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = () => {
    if (!text.trim() || !selectedUserId) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit("sendMessage", {
      sender: userId,
      receiver: selectedUserId,
      text,
    });

    setText("");
  };

  const selectedUser = users.find((u) => u._id === selectedUserId);

  /* ---------------- UI ---------------- */
  return (
    <div className="flex h-screen bg-[#0b141a] text-white">
      {/* USERS LIST */}
      <div
        className={`w-full sm:w-72 bg-[#111b21] border-r border-gray-700 overflow-y-auto ${
          selectedUserId ? "hidden sm:block" : "block"
        }`}
      >
        <h2 className="p-4 text-xl font-bold">Chats</h2>

        {users
          .filter((u) => u._id !== userId)
          .map((u) => (
            <div
              key={u._id}
              onClick={() => setSelectedUserId(u._id)}
              className="p-4 border-b border-gray-800 cursor-pointer hover:bg-[#1f2c33]"
            >
              <p className="font-semibold">{u.username}</p>
              <p className="text-xs text-gray-400">
                {u.isOnline
                  ? "online"
                  : u.lastSeen
                  ? `last seen ${new Date(u.lastSeen).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : ""}
              </p>
            </div>
          ))}
      </div>

      {/* CHAT AREA */}
      {selectedUserId && (
        <div className="flex-1 flex flex-col">
          {/* HEADER */}
          <div className="p-4 bg-[#202c33] border-b border-gray-600 flex items-center gap-3">
            <button
              className="sm:hidden text-lg"
              onClick={() => setSelectedUserId(null)}
            >
              ←
            </button>
            <div>
              <p className="font-bold">{selectedUser?.username}</p>
              <p className="text-xs text-gray-300">
                {selectedUser?.isOnline
                  ? "online"
                  : selectedUser?.lastSeen
                  ? `last seen ${new Date(
                      selectedUser.lastSeen
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : ""}
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
                <div className="text-[10px] text-right mt-1 text-gray-300">
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {m.sender === userId && (
                    <span className="ml-2">
                      {m.seen ? "✔✔" : "✔"}
                    </span>
                  )}
                </div>
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
                getSocket()?.emit("typing", {
                  from: userId,
                  to: selectedUserId,
                });
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
