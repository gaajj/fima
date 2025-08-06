import { PublicUserDto } from 'src/user/dto/public-user.dto';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { Expose, Type } from 'class-transformer';

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
  @Type(() => Category)
  categories: Category[];

  @Type(() => Tag)
  tags: Tag[];
}
