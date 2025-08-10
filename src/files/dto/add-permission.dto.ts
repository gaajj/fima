import { IsEnum, IsUUID } from 'class-validator';
import { PermissionType } from '../enums/permission-type.enum';

export class AddPermissionDto {
  @IsUUID()
  userId: string;

  @IsEnum(PermissionType)
  permission: PermissionType;
}
