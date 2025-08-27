import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateFileTypeRequestDto {
  @IsString() @MinLength(1) name: string;
  @IsOptional() @IsString() description?: string;
}
