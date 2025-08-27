import { IsString, MinLength } from 'class-validator';

export class CreateTagRequestDto {
  @IsString()
  @MinLength(1)
  readonly name: string;
}
