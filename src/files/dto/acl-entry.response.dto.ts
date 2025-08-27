import { Expose, Type } from 'class-transformer';
import { PublicUserResponseDto } from 'src/user/dto/public-user.response.dto';
import { AclRole } from '../enums/acl-role.enum';

export class AclEntryResponseDto {
  @Expose() id: string;
  @Expose() @Type(() => PublicUserResponseDto) user: PublicUserResponseDto;
  @Expose() role: AclRole;
  @Expose() grantedAt: Date;
}
