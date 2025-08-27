import { PartialType } from '@nestjs/mapped-types';
import { CreateTagRequestDto } from './create-tag.request.dto';

export class UpdateTagRequestDto extends PartialType(CreateTagRequestDto) {}
