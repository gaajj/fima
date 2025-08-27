import { Expose } from 'class-transformer';

export class PublicUserProfileResponseDto {
  @Expose() firstName?: string;
  @Expose() lastName?: string;
  @Expose() avatarUrl?: string;
}
