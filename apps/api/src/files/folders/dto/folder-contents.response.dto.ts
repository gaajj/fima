import { Expose, Type } from 'class-transformer';
import { FolderResponseDto } from './folder.response.dto';
import { FileResponseDto } from 'src/files/dto/file.response.dto';

export class FolderContentsResponseDto {
  @Expose() @Type(() => FolderResponseDto) folder: FolderResponseDto;
  @Expose() @Type(() => FolderResponseDto) subFolders: FolderResponseDto[];
  @Expose() @Type(() => FileResponseDto) files: FileResponseDto[];
}
