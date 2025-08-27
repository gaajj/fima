import { IsUUID } from 'class-validator';

export class AddTagRequestDto {
  @IsUUID()
  readonly tagId: string;
}
