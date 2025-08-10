import { Expose } from 'class-transformer';
import { AuthTokensResponseDto } from './auth-tokens.response.dto';

export class LoginResponseDto extends AuthTokensResponseDto {
  @Expose() id: string;
}
