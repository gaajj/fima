import { PublicUserResponseDto } from 'src/user/dto/public-user.response.dto';
import { Expose, Type } from 'class-transformer';
import { TagResponseDto } from '../tags/dto/tag.response.dto';
import { FileTypeMinimalDto } from '../file-types/dto/file-type-minimal.response.dto';
import { FilePermissionResponseDto } from './file-permission.response.dto';

export class FileResponseDto {
  @Expose() id: string;
  @Expose() originalName: string;
  @Expose() displayName: string;
  @Expose() mimeType: string;
  @Expose() size: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  @Expose()
  @Type(() => PublicUserResponseDto)
  owner?: PublicUserResponseDto;

  @Expose()
  @Type(() => FileTypeMinimalDto)
  type?: FileTypeMinimalDto;

  @Expose()
  metadata: Record<string, any>;

  @Expose()
  @Type(() => TagResponseDto)
  tags: TagResponseDto[];

  @Expose()
  @Type(() => FilePermissionResponseDto)
  permissions: FilePermissionResponseDto[];
}
