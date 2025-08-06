import { IsString, MinLength } from 'class-validator';

export class UpdateFileInfoDto {
  @IsString()
  @MinLength(1)
  readonly displayName: string;
}
