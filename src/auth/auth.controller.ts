import {
  Body,
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
import { LoginDto } from './dto/login.dto';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() _ /*validated*/ : LoginDto,
    @CurrentUser('id') userId: string,
  ): Promise<LoginResponseDto> {
    return this.authService.login(userId);
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(
    @CurrentUser('id') userId: string,
    @CurrentUser('sid') sessionId: string,
  ): Promise<AuthTokensDto> {
    return this.authService.refreshToken(userId, sessionId);
  }

  @Post('logout')
  logout(@CurrentUser('sid') sessionId: string) {
    return this.authService.logout(sessionId);
  }
}
