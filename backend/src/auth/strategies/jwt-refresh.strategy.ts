import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from '../../sessions/session.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @InjectModel(Session.name)
    private sessionModel: Model<Session>,
  ) {
    super();
  }

  async validate(req: Request) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const sessions = await this.sessionModel.find({
      expiresAt: { $gt: new Date() },
    });

    for (const session of sessions) {
      const isMatch = await bcrypt.compare(
        refreshToken,
        session.tokenHash,
      );
      if (isMatch) {
        return { userId: session.userId, sessionId: session._id };
      }
    }

    throw new UnauthorizedException('Invalid refresh token');
  }
}
