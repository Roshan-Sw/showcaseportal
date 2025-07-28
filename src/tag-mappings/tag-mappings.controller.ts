import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { TagMappingsService } from './tag-mappings.service';
import { CreateTagMappingDto } from './dto/create-tag-mapping.dto';

@Controller('tag-mappings')
export class TagMappingsController {
  constructor(private readonly service: TagMappingsService) {}

  @Post()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async create(@Body() dto: CreateTagMappingDto) {
    return this.service.create(dto);
  }

  @Get('website/:websiteId')
  async getTagsByWebsite(@Param('websiteId', ParseIntPipe) websiteId: number) {
    return this.service.getTagsByWebsite(websiteId);
  }

  @Get('video/:videoId')
  async getTagsByVideo(@Param('videoId', ParseIntPipe) videoId: number) {
    return this.service.getTagsByVideo(videoId);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
