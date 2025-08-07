import { IsUUID } from 'class-validator';

export class AddTagDto {
  @IsUUID()
  readonly tagId: string;
}
