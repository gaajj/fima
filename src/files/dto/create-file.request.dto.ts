import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateFileRequestDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly tags?: string[];
}
