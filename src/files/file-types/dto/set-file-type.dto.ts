import { IsUUID } from 'class-validator';

export class SetFileTypeDto {
  @IsUUID() typeId: string;
}
