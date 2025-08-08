import { IsObject } from 'class-validator';

export class UpdateFileMetadataDto {
  @IsObject() metadata: Record<string, any>;
}
