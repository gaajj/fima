import { AuthTokensDto } from './auth-tokens.dto';

export class LoginResponseDto extends AuthTokensDto {
  id: string;
}
