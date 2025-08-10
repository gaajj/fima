import { IsObject } from 'class-validator';

export class UpdateFileMetadataRequestDto {
  @IsObject() metadata: Record<string, any>;
}
