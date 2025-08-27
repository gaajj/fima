import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class UploadFileRequestDto {
  @IsOptional() @IsUUID() typeId?: string;
  @IsOptional() @IsUUID() folderId?: string;
  @IsOptional() @IsUUID('4', { each: true }) tagIds?: string[];
}
