import { IsString, IsUUID } from 'class-validator';

export class VerifyEmailDto {
  @IsUUID()
  id: string;

  @IsString()
  token: string;
}
