import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Query,
  Param,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { WebsitesService } from './websites.service';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';
import { UpdateWebsiteTechnologyMappingsDto } from './dto/update-website-technology-mapping.dto';

function fileName(req, file, cb) {
  const uniqueSuffix =
    Date.now() + '_' + file.originalname.replace(/\s+/g, '_');
  cb(null, uniqueSuffix);
}

@Controller('websites')
export class WebsitesController {
  constructor(private readonly service: WebsitesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: diskStorage({
        destination: './uploads/websites/thumbnails',
        filename: fileName,
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Only JPG, JPEG, PNG, and WebP files are allowed',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async create(
    @Body() dto: CreateWebsiteDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      dto.thumbnail = file.path.replace(/\\/g, '/');
    }
    if (!dto.client_id) {
      throw new BadRequestException('Client ID is required');
    }
    return this.service.create(dto);
  }

  @Get('list')
  async list(
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    limit: number = 10,
    @Query('keyword') keyword: string = '',
  ) {
    return this.service.list(page, limit, keyword);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: diskStorage({
        destination: './uploads/websites/thumbnails',
        filename: fileName,
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Only JPG, JPEG, PNG, and WebP files are allowed',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWebsiteDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      dto.thumbnail = file.path.replace(/\\/g, '/');
    }
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Put(':id/technology-mappings')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async updateTechnologyMappings(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWebsiteTechnologyMappingsDto,
  ) {
    return this.service.updateTechnologyMappings(id, dto);
  }
}
