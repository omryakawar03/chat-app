import { Body, Controller, Post, Req, Res , UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dtos/signin.dto';
import { SignupDto } from './dtos/signup.dto';
import { Response, Request } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto, @Req() req: Request, @Res() res: Response) {
    const ip = req.ip || '';
    const ua = req.headers['user-agent'] || '';
    const { accessToken, refreshToken } = await this.authService.signup(dto, ip, ua);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: false,
    });

    return res.json({ accessToken });
  }

  @Post('signin')
  async signin(@Body() dto: SigninDto, @Req() req: Request, @Res() res: Response) {
    const ip = req.ip || '';
    const ua = req.headers['user-agent'] || '';
    const { accessToken, refreshToken } = await this.authService.signin(dto, ip, ua);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: false,
    });

    return res.json({ accessToken });
    
  }
  
  @Post('refresh')
@UseGuards(JwtRefreshGuard)
refresh(@Req() req: any, @Res() res: Response) {
  const accessToken = this.authService.issueAccessToken(req.user.userId);
  return res.json({ accessToken });
}
}

