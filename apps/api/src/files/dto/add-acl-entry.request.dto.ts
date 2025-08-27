import { IsEnum, IsUUID } from 'class-validator';
import { AclRole } from '../enums/acl-role.enum';

export class AddAclEntryRequestDto {
  @IsUUID() userId: string;
  @IsEnum(AclRole) role: AclRole;
}
