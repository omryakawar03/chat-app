import { Inject, forwardRef } from "@nestjs/common";
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { ChatService } from "./chat.service";
import { UserService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";

@WebSocketGateway({
  cors: { origin: "*" },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService
  ) {}

  afterInit(server: Server) {
    this.server = server;
    console.log("🚀 WebSocket initialized");
  }

  /* ================= SOCKET AUTH ================= */
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) throw new WsException("No token");

      const payload: any = this.jwtService.verify(token);

      const userId = payload.sub || payload.userId;
      if (!userId) throw new WsException("Invalid token payload");

      client.data.userId = userId;

      await this.userService.setOnline(userId);

      this.server.emit("userStatus", {
        userId,
        isOnline: true,
        lastSeen: null,
      });

      console.log("🔥 Authenticated socket:", userId);
    } catch (err) {
      console.log("❌ Socket auth failed");
      client.disconnect();
    }
  }

  /* ================= DISCONNECT ================= */
  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    setTimeout(async () => {
      const sockets = await this.server.fetchSockets();
      const stillOnline = sockets.some(
        (s) => s.data.userId === userId
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

  /* ================= OPEN CHAT ================= */
  @SubscribeMessage("openChat")
  async openChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { otherUserId: string }
  ) {
    const userId = client.data.userId;
    const { otherUserId } = data;

    if (!userId || !otherUserId) return;

    const roomId =
      userId < otherUserId
        ? `${userId}_${otherUserId}`
        : `${otherUserId}_${userId}`;

    client.join(roomId);

    const messages = await this.chatService.getMessages(roomId);
    client.emit("chatMessages", messages);
  }

  /* ================= SEND MESSAGE ================= */
  @SubscribeMessage("sendMessage")
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiver: string; text: string }
  ) {
    const sender = client.data.userId;
    const { receiver, text } = data;

    if (!sender || !receiver || !text) return;

    const conversationId =
      sender < receiver
        ? `${sender}_${receiver}`
        : `${receiver}_${sender}`;

    const message = await this.chatService.saveMessage({
      sender,
      receiver,
      text,
      conversationId,
      delivered: true,
      seen: false,
      createdAt: new Date(),
    });

    this.server.to(conversationId).emit("receiveMessage", message);
  }

  /* ================= TYPING ================= */
  @SubscribeMessage("typing")
  typing(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { to: string }
  ) {
    const from = client.data.userId;
    if (!from || !data.to) return;

    const roomId =
      from < data.to
        ? `${from}_${data.to}`
        : `${data.to}_${from}`;

    client.to(roomId).emit("typing", { from });
  }

  /* ================= SEEN ================= */
  @SubscribeMessage("markSeen")
  async markSeen(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { otherUserId: string }
  ) {
    const userId = client.data.userId;
    const { otherUserId } = data;

    if (!userId || !otherUserId) return;

    const roomId =
      userId < otherUserId
        ? `${userId}_${otherUserId}`
        : `${otherUserId}_${userId}`;

    await this.chatService.markMessagesAsSeen(roomId, userId);

    this.server.to(roomId).emit("seenUpdate", {
      seenBy: userId,
    });
  }
}