import { IsUUID } from 'class-validator';

export class SetFileTypeRequestDto {
  @IsUUID() typeId: string;
}
