import { IsString, IsUUID } from 'class-validator';

export class VerifyEmailRequestDto {
  @IsUUID()
  id: string;

  @IsString()
  token: string;
}
