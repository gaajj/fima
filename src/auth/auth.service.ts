import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { AuthJwtPayloadDto } from './types/auth-jwt-payload.dto';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { hash, verify } from 'argon2';
import { CurrentUser } from './types/current-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private readonly refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findByUsername(username);
    if (!user) throw new UnauthorizedException('User not found.');

    const passwordMatch = await compare(password, user.hashedPassword);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials.');

    return { id: user.id };
  }

  async login(userId: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshedToken = await hash(refreshToken);
    await this.userService.updateHashedRefreshToken(
      userId,
      hashedRefreshedToken,
    );
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: string) {
    const payload: AuthJwtPayloadDto = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(userId: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    await this.userService.updateHashedRefreshToken(
      userId,
      await hash(refreshToken),
    );
    return { accessToken, refreshToken };
    // const payload: AuthJwtPayloadDto = { sub: userId };
    // const accessToken = this.jwtService.sign(payload);
    // return {
    //   id: userId,
    //   accessToken,
    // };
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.findOneForAuth(userId);
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Invalid refresh token.');

    const refreshTokenMatch = await verify(user.refreshToken, refreshToken);
    if (!refreshTokenMatch)
      throw new UnauthorizedException('Invalid refresh token.');

    return { id: userId };
  }

  async logout(userId: string) {
    await this.userService.updateHashedRefreshToken(userId, null);
    return { message: 'Logged out.' };
  }

  async validateJwtUser(userId: string) {
    const user = await this.userService.findOneForAuth(userId);
    if (!user) throw new UnauthorizedException('User not found.');
    if (!user.refreshToken) throw new UnauthorizedException('Not logged in.');
    return { id: user.id, role: user.role };
  }
}
