import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from './requestWithUser.interface';
import { AuthService } from './auth.service';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: RequestWithUser) {
    const jwt = await this.authService.login(req.user);
    return {
      status: 200,
      error: false,
      access_token: jwt.access_token,
    };
  }
}
