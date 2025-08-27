import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProfileRequestDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  avatarUrl?: string;
}
