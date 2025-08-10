import { Expose, Type } from 'class-transformer';
import { PermissionType } from '../enums/permission-type.enum';
import { PublicUserDto } from 'src/user/dto/public-user.dto';

export class FilePermissionResponseDto {
  @Expose() id: string;
  @Expose() @Type(() => PublicUserDto) user: PublicUserDto;
  @Expose() permission: PermissionType;
  @Expose() grantedAt: Date;
}
