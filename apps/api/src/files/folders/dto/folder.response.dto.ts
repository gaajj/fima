import { Expose, Type } from 'class-transformer';
import { PublicUserResponseDto } from 'src/user/dto/public-user.response.dto';

export class FolderResponseDto {
  @Expose() id: string;
  @Expose() name: string;

  @Expose() parentId?: string;

  @Expose()
  @Type(() => PublicUserResponseDto)
  owner?: PublicUserResponseDto;

  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}
