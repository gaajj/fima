import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { UserService } from '../user/user.service';
import { AuthJwtPayloadDto } from './types/auth-jwt-payload.dto';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Session } from '../user/entities/session.entity';
import { AuthTokensDto } from './dto/auth-tokens.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private readonly refreshCfg: ConfigType<typeof refreshJwtConfig>,
    @InjectRepository(Session)
    private readonly sesRepo: Repository<Session>,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findByUsername(username, true);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const passwordMatch = await compare(
      password,
      user.credential.hashedPassword,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return { id: user.id };
  }

  async login(
    userId: string,
    ip: string,
    userAgent: string,
  ): Promise<AuthTokensDto & { id: string }> {
    const session = await this.sesRepo.save(
      this.sesRepo.create({
        user: { id: userId } as User,
        hashedRefreshToken: '',
        userAgent: userAgent,
        ip: ip,
      }),
    );

    const tokens = await this.generateTokens(userId, session);

    await this.rotateRefreshToken(session.id, {
      newHash: await hash(tokens.refreshToken, 10),
      bumpVersion: false,
    });

    return { id: userId, ...tokens };
  }

  async refreshToken(
    userId: string,
    sessionId: string,
  ): Promise<AuthTokensDto> {
    let session: Session;
    try {
      session = await this.sesRepo.findOneByOrFail({
        id: sessionId,
        user: { id: userId },
        revoked: false,
      });
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new UnauthorizedException('Session not found or revoked.');
      }
      throw err;
    }

    await this.rotateRefreshToken(sessionId, { bumpVersion: true });

    const updatedSession = {
      ...session,
      tokenVersion: session.tokenVersion + 1,
    };
    const tokens = await this.generateTokens(userId, updatedSession);

    await this.rotateRefreshToken(sessionId, {
      newHash: await hash(tokens.refreshToken, 10),
    });

    return tokens;
  }

  async generateTokens(sub: string, session: Session): Promise<AuthTokensDto> {
    const payload: AuthJwtPayloadDto = {
      sub,
      sid: session.id,
      ver: session.tokenVersion,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshCfg),
    ]);
    return { accessToken, refreshToken };
  }

  async rotateRefreshToken(
    sessionId: string,
    opts: { newHash?: string | null; bumpVersion?: boolean } = {},
  ) {
    if (opts.bumpVersion) {
      await this.sesRepo.increment({ id: sessionId }, 'tokenVersion', 1);
    }

    await this.sesRepo.update(sessionId, {
      hashedRefreshToken: opts.newHash ?? undefined,
      revoked: opts.newHash === null,
    });
  }

  async logout(sessionId: string) {
    try {
      await this.rotateRefreshToken(sessionId, {
        newHash: null,
        bumpVersion: true,
      });
      return { message: 'Logged out.' };
    } catch {
      throw new UnauthorizedException('Failed to logout, session invalid.');
    }
  }

  async validateRefreshToken(
    sessionId: string,
    userId: string,
    candidate: string,
  ) {
    const session = await this.sesRepo.findOneBy({
      id: sessionId,
      user: { id: userId },
    });
    if (!session || session.revoked)
      throw new UnauthorizedException('Session revoked.');

    const tokenMatch = await compare(candidate, session.hashedRefreshToken);
    if (!tokenMatch) throw new UnauthorizedException('Invalid refresh token.');

    return { id: userId, sid: sessionId };
  }

  async validateJwtUser(userId: string, sessionId: string, tokenVer: number) {
    const session = await this.sesRepo.findOne({
      where: { id: sessionId, user: { id: userId } },
      relations: ['user'],
    });
    if (!session || session.revoked)
      throw new UnauthorizedException('Session revoked.');
    if (session.tokenVersion !== tokenVer)
      throw new UnauthorizedException('Access token outdated.');
    return { id: userId, role: session.user.role, sid: sessionId };
  }
}
