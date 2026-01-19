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

  generateToken(userId: string) {
    return this.jwt.sign({ userId });
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
      token: this.generateToken(user._id.toString()),
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

    return {
      user,
      token: this.generateToken(user._id.toString()),
    };
  }
}
