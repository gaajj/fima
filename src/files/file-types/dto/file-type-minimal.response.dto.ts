import { Expose } from 'class-transformer';

export class FileTypeMinimalDto {
  @Expose() id: string;
  @Expose() name: string;
}
