import { Expose } from 'class-transformer';

export class AuthTokensResponseDto {
  @Expose() accessToken: string;
  @Expose() refreshToken: string;
}
