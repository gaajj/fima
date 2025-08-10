import { PartialType } from '@nestjs/mapped-types';
import { CreateFileRequestDto } from './create-file.request.dto';

export class UpdateFileRequestDto extends PartialType(CreateFileRequestDto) {}
