import { Expose, Type } from 'class-transformer';
import { PublicUserProfileResponseDto } from './public-user-profile.response.dto';
import { Role } from '../enums/role.enum';

export class MeUserResponseDto {
  @Expose() id: string;
  @Expose() username: string;
  @Expose() email: string;
  @Expose() emailVerified: boolean;
  @Expose() role: Role;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  @Expose()
  @Type(() => PublicUserProfileResponseDto)
  profile: PublicUserProfileResponseDto;
}
