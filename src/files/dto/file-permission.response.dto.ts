import { Expose, Type } from 'class-transformer';
import { PermissionType } from '../enums/permission-type.enum';
import { PublicUserResponseDto } from 'src/user/dto/public-user.response.dto';

export class FilePermissionResponseDto {
  @Expose() id: string;
  @Expose() @Type(() => PublicUserResponseDto) user: PublicUserResponseDto;
  @Expose() permission: PermissionType;
  @Expose() grantedAt: Date;
}
