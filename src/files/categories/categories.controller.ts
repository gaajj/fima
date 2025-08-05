import { Body, Controller, Get, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CategoryDto } from './dto/category-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('files/category')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(@CurrentUser('id') userId: string): Promise<CategoryDto[]> {
    const categories = await this.categoriesService.findAll(userId);
    return plainToInstance(CategoryDto, categories);
  }

  @Post()
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser('id') userId: string,
  ): Promise<CategoryDto> {
    const category = await this.categoriesService.create(dto.name, userId);
    return plainToInstance(CategoryDto, category);
  }
}
