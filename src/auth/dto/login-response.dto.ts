import { Expose } from 'class-transformer';
import { AuthTokensDto } from './auth-tokens.dto';

export class LoginResponseDto extends AuthTokensDto {
  @Expose() id: string;
}
