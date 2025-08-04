import { Expose, Type } from 'class-transformer';

export class PublicUserProfileDto {
  @Expose()
  firstName?: string;
  @Expose()
  lastName?: string;
  @Expose()
  avatarUrl?: string;
}

export class PublicUserDto {
  @Expose()
  id: string;
  @Expose()
  username: string;
  @Expose()
  @Type(() => PublicUserProfileDto)
  profile: PublicUserProfileDto;
}
