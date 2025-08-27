import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateFolderRequestDto {
  @IsOptional() @IsString() @MinLength(1) name?: string;
  @IsOptional() @IsUUID() newParentId?: string;
}
