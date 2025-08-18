import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { UserAgent } from './decorators/user-agent.decorator';
import { AuthTokensResponseDto } from './dto/auth-tokens.response.dto';
import { LoginRequestDto } from './dto/login.request.dto';
import { LoginResponseDto } from './dto/login.response.dto';
import { SessionResponseDto } from './dto/session.response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() _ /*validated*/ : LoginRequestDto,
    @Ip() ip: string,
    @UserAgent() userAgent: string,
    @CurrentUser('id') userId: string,
  ): Promise<LoginResponseDto> {
    const result = await this.authService.login(userId, ip, userAgent);
    return plainToInstance(LoginResponseDto, result);
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @CurrentUser('id') userId: string,
    @CurrentUser('sid') sessionId: string,
  ): Promise<AuthTokensResponseDto> {
    const tokens = await this.authService.refreshToken(userId, sessionId);
    return plainToInstance(AuthTokensResponseDto, tokens);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@CurrentUser('sid') sessionId: string) {
    return this.authService.logout(sessionId);
  }

  @Get('sessions')
  async listSessions(
    @CurrentUser('id') userId: string,
  ): Promise<SessionResponseDto[]> {
    const sessions = await this.authService.listSessions(userId);
    return plainToInstance(SessionResponseDto, sessions);
  }

  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeSession(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    await this.authService.revokeSession(userId, sessionId);
  }
}
