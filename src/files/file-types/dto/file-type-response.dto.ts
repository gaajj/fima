import { Expose, Type } from 'class-transformer';
import { FileTypeFieldResponseDto } from './file-type-field-response.dto';

export class FileTypeResponseDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() description?: string;

  @Expose()
  @Type(() => FileTypeFieldResponseDto)
  fields: FileTypeFieldResponseDto[];
}
