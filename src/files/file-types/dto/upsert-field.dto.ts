import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { FieldKind } from '../entities/field-kind.entity';

export class UpsertFieldDto {
  @IsString() @MinLength(1) name: string;
  @IsIn(['string', 'number', 'boolean', 'date', 'enum', 'array', 'object'])
  kind: FieldKind;
  @IsBoolean() @IsOptional() required?: boolean = false;
  @IsObject() @IsOptional() constraints?: Record<string, any>;
}
