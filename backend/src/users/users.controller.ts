import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserService } from './users.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    return this.userService.create(body);
  }

  @Get('all')
  async all() {
    return this.userService.getAllUsers();
  }
}
