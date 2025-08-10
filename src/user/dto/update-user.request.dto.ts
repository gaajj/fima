import { PartialType } from '@nestjs/mapped-types';
import { CreateUserRequestDto } from './create-user.request.dto';
import { UpdateProfileRequestDto } from './update-profile.request.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserRequestDto extends PartialType(CreateUserRequestDto) {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProfileRequestDto)
  profile?: UpdateProfileRequestDto;
}
