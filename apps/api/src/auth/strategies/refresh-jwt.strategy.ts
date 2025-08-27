import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import refreshJwtConfig from '../config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { AuthJwtPayloadDto } from '../types/auth-jwt-payload.type';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private readonly refreshJwtConfiguration: ConfigType<
      typeof refreshJwtConfig
    >,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refreshJwtConfiguration.secret!,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: AuthJwtPayloadDto) {
    const authHeader = req.get('authorization');
    if (!authHeader)
      throw new UnauthorizedException('Missing authorization header');

    const refreshToken = authHeader.replace('Bearer', '').trim();

    return this.authService.validateRefreshToken(
      payload.sid,
      payload.sub,
      refreshToken,
    );
  }
}
