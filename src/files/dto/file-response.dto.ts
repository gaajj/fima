import { PublicUserDto } from 'src/user/dto/public-user.dto';
import { Expose, Type } from 'class-transformer';
import { TagResponseDto } from '../tags/dto/tag-response.dto';
import { MinimalFileTypeDto } from '../file-types/dto/file-type-response-minimal.dto';
import { FilePermissionResponseDto } from './file-permission-response.dto';

export class FileResponseDto {
  @Expose() id: string;
  @Expose() originalName: string;
  @Expose() displayName: string;
  @Expose() mimeType: string;
  @Expose() size: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  @Expose()
  @Type(() => PublicUserDto)
  owner?: PublicUserDto;

  @Expose()
  @Type(() => MinimalFileTypeDto)
  type?: MinimalFileTypeDto;

  @Expose()
  metadata: Record<string, any>;

  @Expose()
  @Type(() => TagResponseDto)
  tags: TagResponseDto[];

  @Expose()
  @Type(() => FilePermissionResponseDto)
  permissions: FilePermissionResponseDto[];
}
