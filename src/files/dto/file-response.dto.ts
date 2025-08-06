import { PublicUserDto } from 'src/user/dto/public-user.dto';
import { Tag } from '../entities/tag.entity';
import { Expose, Type } from 'class-transformer';
import { CategoryDto } from '../categories/dto/category-response.dto';

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

  @Type(() => Tag)
  tags: Tag[];
}
