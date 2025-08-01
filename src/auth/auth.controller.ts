import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@CurrentUser('id') userId: string) {
    return this.authService.login(userId);
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(
    @CurrentUser('id') userId: string,
    @CurrentUser('sid') sessionId: string,
  ) {
    return this.authService.refreshToken(userId, sessionId);
  }

  @Post('logout')
  logout(@CurrentUser('sid') sessionId: string) {
    return this.authService.logout(sessionId);
  }
}
