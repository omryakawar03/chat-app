import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private users: UserService,
    private jwt: JwtService,
  ) {}

  // -------------------------
  // TOKEN GENERATORS
  // -------------------------
  generateAccessToken(userId: string) {
    return this.jwt.sign(
      { sub: userId },
      { expiresIn: '15m' },
    );
  }

  generateRefreshToken(userId: string) {
    return this.jwt.sign(
      { sub: userId },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );
  }

  // -------------------------
  // REGISTER
  // -------------------------
  async register(username: string, password: string) {
    const existing = await this.users.findByUsername(username);
    if (existing) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.users.create({
      username,
      password: hashedPassword,
    });

    return {
      user,
      accessToken: this.generateAccessToken(user._id.toString()),
      refreshToken: this.generateRefreshToken(user._id.toString()),
    };
  }

  // -------------------------
  // LOGIN
  // -------------------------
  async login(username: string, password: string) {
    const user = await this.users.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
      
    }

  const accessToken = this.generateAccessToken(user._id.toString());
  const refreshToken = this.generateRefreshToken(user._id.toString());
    await this.users.updateRefreshToken(user._id.toString(), refreshToken);

    return {
      user,
      accessToken: this.generateAccessToken(user._id.toString()),
      refreshToken: this.generateRefreshToken(user._id.toString()),
    };
  }

  // -------------------------
  // REFRESH TOKEN
  // -------------------------
  async refresh(userId: string) {
    return {
      accessToken: this.generateAccessToken(userId),
    };
  }
}
