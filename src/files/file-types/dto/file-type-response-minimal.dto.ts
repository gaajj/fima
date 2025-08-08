import { Expose } from 'class-transformer';

export class MinimalFileTypeDto {
  @Expose() id: string;
  @Expose() name: string;
}
