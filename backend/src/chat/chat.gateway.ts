import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { ChatService } from "./chat.service";
import { UserService } from "../users/users.service";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  server: Server;

  constructor(
    private chatService: ChatService,
    private userService: UserService
  ) {}

  afterInit(server: Server) {
    this.server = server;
    console.log("🚀 WebSocket initialized");
  }

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string | undefined;
    if (!userId) return;

    await this.userService.setOnline(userId);

    this.server.emit("userStatus", {
      userId,
      isOnline: true,
      lastSeen: null,
    });

    console.log("🔥 Client connected:", userId);
  }

  async handleDisconnect(client: Socket) {
  const userId = client.handshake.query.userId as string;
  if (!userId) return;

  // ⏱ delay to avoid flicker
  setTimeout(async () => {
    const sockets = await this.server.fetchSockets();
    const stillOnline = sockets.some(
      (s) => s.handshake.query.userId === userId
    );

    if (!stillOnline) {
      await this.userService.setOffline(userId);

      this.server.emit("userStatus", {
        userId,
        isOnline: false,
        lastSeen: new Date(),
      });

      console.log("⚠ Client truly offline:", userId);
    }
  }, 2000);
}

  @SubscribeMessage("joinRoom")
  joinRoom(client: Socket, roomId: string) {
    console.log("📌 Joined room:", roomId);
    client.join(roomId);
  }

  @SubscribeMessage("openChat")
  async openChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; otherUserId: string }
  ) {
    const { userId, otherUserId } = data;
    const roomId =
      userId < otherUserId ? `${userId}_${otherUserId}` : `${otherUserId}_${userId}`;

    client.join(roomId);

    const messages = await this.chatService.getMessages(roomId);

    client.emit("chatMessages", messages);
  }

  @SubscribeMessage("sendMessage")
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { sender: string; receiver: string; text: string }
  ) {
    const { sender, receiver, text } = data;
    const conversationId =
       sender < receiver
    ? `${sender}_${receiver}`
    : `${receiver}_${sender}`;

    const message = await this.chatService.saveMessage({
      sender,
      receiver,
      text,
      conversationId,
      createdAt: new Date(),
      delivered: true,
      seen: false,
    });

    this.server.to(conversationId).emit("receiveMessage", message);
  }
@SubscribeMessage("typing")
typing(@MessageBody() data: { from: string; to: string }) {
  this.server.emit("typing", data);
}
  @SubscribeMessage("markSeen")
  async markSeen(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; otherUserId: string }
  ) {
    const { userId, otherUserId } = data;

    const roomId =
      userId < otherUserId ? `${userId}_${otherUserId}` : `${otherUserId}_${userId}`;

    await this.chatService.markMessagesAsSeen(roomId, userId);

    this.server.to(roomId).emit("seenUpdate", {
      seenBy: userId,
      roomId,
    });
  }
}
