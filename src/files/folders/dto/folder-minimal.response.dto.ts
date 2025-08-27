import { Expose } from 'class-transformer';

export class FolderMinimalResponseDto {
  @Expose() id: string;
  @Expose() name: string;
}
