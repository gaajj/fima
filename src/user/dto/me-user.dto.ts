import { Expose, Type } from 'class-transformer';
import { PublicUserProfileDto } from './public-user-profile.dto';
import { Role } from '../enums/role.enum';

export class MeUserDto {
  @Expose() id: string;
  @Expose() username: string;
  @Expose() email: string;
  @Expose() emailVerified: boolean;
  @Expose() role: Role;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  @Expose()
  @Type(() => PublicUserProfileDto)
  profile: PublicUserProfileDto;
}
