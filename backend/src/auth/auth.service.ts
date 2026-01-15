import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import {SigninDto } from './dtos/signin.dto';
import { SignupDto } from './dtos/signup.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from '../sessions/session.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) {}

  async signup(dto: SignupDto, ip: string, userAgent: string) {
    const userExists = await this.usersService.findByEmail(dto.email);
    if (userExists) throw new UnauthorizedException('User already exists');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create(dto.email, hash, dto.name);

    const refreshToken = await this.generateRefresh(user._id.toString(), ip, userAgent);
    const accessToken = this.jwtService.sign({ sub: user._id });

    return { accessToken, refreshToken };
  }

  async signin(dto: SigninDto, ip: string, userAgent: string) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const refreshToken = await this.generateRefresh(user._id.toString(), ip, userAgent);
    const accessToken = this.jwtService.sign({ sub: user._id });

    return { accessToken, refreshToken };
  }

  private async generateRefresh(userId: string, ip: string, userAgent: string) {
    const token = crypto.randomUUID();
    const tokenHash = await bcrypt.hash(token, 10);

    await this.sessionModel.create({
      userId,
      tokenHash,
      ip,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    });

    return token;
  }
  issueAccessToken(userId: string) {
  return this.jwtService.sign({ sub: userId });
}
}
