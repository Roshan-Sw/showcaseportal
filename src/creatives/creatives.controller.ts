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
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { CreativesService } from './creatives.service';
import { CreateCreativeDto } from './dto/create-creative.dto';
import { UpdateCreativeDto } from './dto/update-creative.dto';

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
  const folder = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ].includes(file.mimetype)
    ? 'public/creatives/files'
    : 'public/creatives/thumbnails';
  cb(null, `${folder}/${uniqueSuffix}`);
}

@Controller('creatives')
export class CreativesController {
  constructor(private readonly service: CreativesService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 2, {
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
        const allowedFileTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];
        if (!allowedFileTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              `Invalid file type for ${file.originalname}. Allowed: PDF, DOC, DOCX, JPG, JPEG, PNG, WebP`,
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
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
    @Body() dto: CreateCreativeDto,
    @UploadedFiles() files: Array<S3File> | undefined,
  ) {
    const fileMap: { file: string | null; thumbnail: string | null } = {
      file: null,
      thumbnail: null,
    };
    if (files) {
      files.forEach((file) => {
        if (
          [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ].includes(file.mimetype) &&
          !fileMap.file
        ) {
          fileMap.file = file.key;
        } else if (
          ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(
            file.mimetype,
          ) &&
          !fileMap.thumbnail
        ) {
          fileMap.thumbnail = file.key;
        }
      });
    }
    if (fileMap.file) dto.file = fileMap.file;
    if (fileMap.thumbnail) dto.thumbnail = fileMap.thumbnail;
    return this.service.create(dto);
  }

  @Get('list')
  async list(
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    limit: number = 10,
    @Query('keyword') keyword: string = '',
    @Query('type') type?: 'LOGO' | 'BROCHURE',
  ) {
    return this.service.list(page, limit, keyword, type);
  }

  @Get('listing')
  async listing(
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    page: number = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: 400 }))
    limit: number = 10,
    @Query('keyword') keyword: string = '',
    @Query('type') type?: 'LOGO' | 'BROCHURE',
  ) {
    return this.service.listing(page, limit, keyword, type);
  }

  @Put(':id')
  @UseInterceptors(
    FilesInterceptor('files', 2, {
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
        const allowedFileTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];
        if (!allowedFileTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              `Invalid file type for ${file.originalname}. Allowed: PDF, DOC, DOCX, JPG, JPEG, PNG, WebP`,
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
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
    @Body() dto: UpdateCreativeDto,
    @UploadedFiles() files: Array<S3File> | undefined,
  ) {
    const fileMap: { file: string | null; thumbnail: string | null } = {
      file: null,
      thumbnail: null,
    };
    if (files) {
      files.forEach((file) => {
        if (
          [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ].includes(file.mimetype) &&
          !fileMap.file
        ) {
          fileMap.file = file.key;
        } else if (
          ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(
            file.mimetype,
          ) &&
          !fileMap.thumbnail
        ) {
          fileMap.thumbnail = file.key;
        }
      });
    }
    if (fileMap.file) dto.file = fileMap.file;
    if (fileMap.thumbnail) dto.thumbnail = fileMap.thumbnail;
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
