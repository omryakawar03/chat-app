import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

interface AuthenticatedRequest extends Request {
  user: any;
}

@Controller('users')
export class UsersController {
  @UseGuards(JwtAccessGuard)
  @Get('me')
  getMe(@Req() req: AuthenticatedRequest) {
    return req.user;
  }
}
