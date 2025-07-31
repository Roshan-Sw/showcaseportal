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
import * as multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { WebsitesService } from './websites.service';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';
import { UpdateWebsiteTechnologyMappingsDto } from './dto/update-website-technology-mapping.dto';

interface S3File extends Express.Multer.File {
  key: string;
}

function validateEnv() {
  const requiredEnvVars = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET_NAME',
  ];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
  return {
    region: process.env.AWS_REGION as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    bucket: process.env.AWS_S3_BUCKET_NAME as string,
  };
}

const { region, accessKeyId, secretAccessKey, bucket } = validateEnv();

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

function generateFileName(req, file, cb) {
  const uniqueSuffix =
    Date.now() + '_' + file.originalname.replace(/\s+/g, '_');
  cb(null, `public/websites/thumbnails/${uniqueSuffix}`);
}

@Controller('websites')
export class WebsitesController {
  constructor(private readonly service: WebsitesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: multerS3({
        s3: s3Client,
        bucket,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        contentDisposition: 'inline',
        metadata: (req, file, cb) => {
          cb(null, { fieldName: file.fieldname });
        },
        key: generateFileName,
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
  async create(@Body() dto: CreateWebsiteDto, @UploadedFile() file: S3File) {
    if (file) {
      dto.thumbnail = file.key;
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

  @Get('listing')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async listing(
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    limit: number = 10,
    @Query('keyword') keyword: string = '',
    @Query('client_id') client_id?: number,
    @Query('technology_id') technology_id?: number,
    @Query('type') type?: 'WEBSITE' | 'LANDING_PAGE',
  ) {
    return this.service.listWithFilters(
      page,
      limit,
      keyword,
      client_id,
      technology_id,
      type,
    );
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: multerS3({
        s3: s3Client,
        bucket,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        contentDisposition: 'inline',
        metadata: (req, file, cb) => {
          cb(null, { fieldName: file.fieldname });
        },
        key: generateFileName,
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
    @UploadedFile() file?: S3File,
  ) {
    if (file) {
      dto.thumbnail = file.key;
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
