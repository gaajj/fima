import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateFileTypeDto {
  @IsString() @MinLength(1) name: string;
  @IsOptional() @IsString() description?: string;
}
