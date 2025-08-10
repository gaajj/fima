import { Expose, Type } from 'class-transformer';
import { PublicUserProfileResponseDto } from './public-user-profile.response.dto';

export class PublicUserResponseDto {
  @Expose() id: string;
  @Expose() username: string;

  @Expose()
  @Type(() => PublicUserProfileResponseDto)
  profile: PublicUserProfileResponseDto;
}
