import { IsString, MinLength } from 'class-validator';

export class UpdateFileInfoRequestDto {
  @IsString()
  @MinLength(1)
  readonly displayName: string;
}
