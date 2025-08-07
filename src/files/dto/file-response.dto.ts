import { PublicUserDto } from 'src/user/dto/public-user.dto';
import { Expose, Type } from 'class-transformer';
import { CategoryDto } from '../categories/dto/category-response.dto';
import { TagResponseDto } from '../tags/dto/tag-response.dto';

export class FileResponseDto {
  @Expose() id: string;

  @Expose() originalName: string;

  @Expose() displayName: string;

  @Expose() mimeType: string;

  @Expose() size: string;

  @Expose() createdAt: Date;

  @Expose() updatedAt: Date;

  @Expose()
  @Type(() => PublicUserDto)
  owner?: PublicUserDto;

  @Expose()
  @Type(() => CategoryDto)
  categories: CategoryDto[];

  @Expose()
  @Type(() => TagResponseDto)
  tags: TagResponseDto[];
}
