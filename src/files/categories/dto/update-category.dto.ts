import { IsString, MinLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @MinLength(1)
  readonly name: string;
}
