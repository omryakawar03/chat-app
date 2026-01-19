

import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,Post,Inject,forwardRef
} from "@nestjs/common";
import { UserService } from "./users.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import * as bcrypt from "bcryptjs";
import { ChatService } from "../chat/chat.service";
import { UseInterceptors, UploadedFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import cloudinary from "../config/cloudinary";

@UseGuards(JwtAuthGuard)
@Controller("user")
export class UserController {
  constructor(
    private users: UserService,
     @Inject(forwardRef(() => UserService))
    private chatService: ChatService
  ) {}

  // ---------------- ALL USERS (CHAT LIST) ----------------
  @Get("all")
  async all() {
    return this.users.getAllUsers();
  }

  // ---------------- MY PROFILE ----------------
  @Get("me")
  async me(@Req() req: any) {
    return this.users.findById(req.user.userId);
  }

  // ---------------- OTHER USER PROFILE ----------------
  @Get(":id")
  async getUser(@Param("id") id: string) {
    return this.users.findById(id);
  }

  // ---------------- UPDATE PROFILE (BIO + AVATAR) ----------------
  @Put("profile")
  async updateProfile(@Req() req: any, @Body() body: any) {
    return this.users.updateProfile(req.user.userId, body);
  }

  // ---------------- CHANGE USERNAME ----------------
  @Put("username")
  async changeUsername(
    @Req() req: any,
    @Body() body: { username: string }
  ) {
    return this.users.changeUsername(req.user.userId, body.username);
  }

  // ---------------- CHANGE PASSWORD ----------------
  @Put("password")
  async changePassword(
    @Req() req: any,
    @Body() body: { oldPassword: string; newPassword: string }
  ) {
    const userId = req.user.userId;

    const user = await this.users.findByIdWithPassword(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const match = await bcrypt.compare(body.oldPassword, user.password);
    if (!match) {
      throw new UnauthorizedException("Old password incorrect");
    }

    const hashed = await bcrypt.hash(body.newPassword, 10);
    await this.users.changePassword(userId, hashed);

    return { message: "Password updated successfully" };
  }

  // ---------------- DELETE ACCOUNT (DANGEROUS) ----------------
  @Delete("me")
  async deleteAccount(
    @Req() req: any,
    @Body() body: { password: string }
  ) {
    const userId = req.user.userId;

    const user = await this.users.findByIdWithPassword(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const match = await bcrypt.compare(body.password, user.password);
    if (!match) {
      throw new UnauthorizedException("Password incorrect");
    }

    // 1️⃣ delete all chats
    await this.chatService.deleteAllUserMessages(userId);

    // 2️⃣ invalidate refresh token
    await this.users.updateRefreshToken(userId, null);

    // 3️⃣ delete user
    await this.users.deleteUser(userId);

    return { message: "Account deleted permanently" };
  }
  @Post("avatar")
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor("file"))
async uploadAvatar(
  @Req() req: any,
  @UploadedFile() file: Express.Multer.File
) {
  if (!file) {
    throw new UnauthorizedException("File missing");
  }

  const upload = await cloudinary.uploader.upload(file.path, {
    folder: "chat-app/avatars",
  });

  await this.users.updateProfile(req.user.userId, {
    avatar: upload.secure_url,
  });

  return {
    avatar: upload.secure_url,
  };
}
}
