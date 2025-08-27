import { IsUUID } from 'class-validator';

export class MoveFileToFolderRequestDto {
  @IsUUID() folderId: string;
}
