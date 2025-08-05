import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateFileDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly tags?: string[];
}
