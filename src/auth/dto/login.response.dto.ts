import { Expose, Type } from 'class-transformer';
import { MeUserResponseDto } from 'src/user/dto/me-user.response.dto';

export class LoginResponseDto {
  @Expose() @Type(() => MeUserResponseDto) user: MeUserResponseDto;
  @Expose() accessToken: string;
  @Expose() refreshToken: string;
}
