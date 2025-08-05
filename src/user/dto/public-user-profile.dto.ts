import { Expose } from 'class-transformer';

export class PublicUserProfileDto {
  @Expose() firstName?: string;
  @Expose() lastName?: string;
  @Expose() avatarUrl?: string;
}
