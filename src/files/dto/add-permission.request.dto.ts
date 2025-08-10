import { IsEnum, IsUUID } from 'class-validator';
import { PermissionType } from '../enums/permission-type.enum';

export class AddPermissionRequestDto {
  @IsUUID()
  userId: string;

  @IsEnum(PermissionType)
  permission: PermissionType;
}
