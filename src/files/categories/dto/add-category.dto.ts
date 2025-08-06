import { IsUUID } from 'class-validator';

export class AddCategoryDto {
  @IsUUID() readonly categoryId: string;
}
