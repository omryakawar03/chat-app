import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../users/users.service";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private usersService: UserService
  ) {}

  // -------------------------
  // REGISTER
  // -------------------------
  @Post("register")
  async register(@Body() body: { username: string; password: string }) {
    return this.authService.register(body.username, body.password);
  }

  // -------------------------
  // LOGIN
  // -------------------------
  @Post("login")
  async login(@Body() body: { username: string; password: string }) {
    return this.authService.login(body.username, body.password);
  }

  // -------------------------
  // REFRESH TOKEN
  // -------------------------
  @Post("refresh")
  async refresh(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new UnauthorizedException("Refresh token missing");
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(body.refreshToken);
    } catch (e) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const user = await this.usersService.findById(payload.userId);

    if (!user || user.refreshToken !== body.refreshToken) {
      throw new UnauthorizedException("Refresh token mismatch");
    }

    const newAccessToken =
      this.authService.generateAccessToken(payload.userId);

    return {
      accessToken: newAccessToken,
    };
  }

  // -------------------------
  // LOGOUT (OPTIONAL BUT CLEAN)
  // -------------------------
  @Post("logout")
  async logout(@Body() body: { userId: string }) {
    if (!body.userId) return { message: "Logged out" };

    await this.usersService.updateRefreshToken(body.userId, null);
    return { message: "Logged out" };
  }
}
