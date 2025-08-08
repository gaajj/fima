import { Expose } from 'class-transformer';
import { FieldKind } from '../entities/field-kind.entity';

export class FileTypeFieldResponseDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() kind: FieldKind;
  @Expose() required: boolean;
  @Expose() constraints: Record<string, any>;
}
