import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Prisma } from '@prisma/client';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

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

@Injectable()
export class VideosService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly prisma: PrismaService) {
    const { region, accessKeyId, secretAccessKey, bucket } = validateEnv();
    this.bucket = bucket;
    this.region = region;
    this.s3Client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  private getPublicUrlFromKey(key: string | null): string | null {
    if (!key) return null;
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async create(dto: CreateVideoDto) {
    try {
      const data: Prisma.VideoCreateInput = {
        title: dto.title,
        description: dto.description,
        video_url: dto.video_url,
        thumbnail: dto.thumbnail,
        format: dto.format,
        type: dto.type,
        client: { connect: { id: dto.client_id } },
        createdBy: dto.created_by
          ? { connect: { id: dto.created_by } }
          : undefined,
        updatedBy: dto.updated_by
          ? { connect: { id: dto.updated_by } }
          : undefined,
      };

      const video = await this.prisma.video.create({ data });
      return {
        message: 'Video created successfully',
        video,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to create video');
    }
  }

  async list(page: number, limit: number, keyword: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.VideoWhereInput = {
      ...(keyword && { title: { contains: keyword, mode: 'insensitive' } }),
    };

    const [videos, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          client: { select: { id: true, client_name: true } },
          tags: { select: { id: true, tag_name: true, entity_type: true } },
        },
      }),
      this.prisma.video.count({ where }),
    ]);

    const videosWithPublicUrls = videos.map((video) => {
      const thumbnail_public_url = this.getPublicUrlFromKey(video.thumbnail);
      const { thumbnail, ...rest } = video;
      return {
        ...rest,
        thumbnail_public_url,
      };
    });

    return { videos: videosWithPublicUrls, total, page, limit };
  }

  async listWithFilters(
    page: number,
    limit: number,
    keyword: string,
    client_id?: number,
    type?:
      | 'CORPORATE_VIDEO'
      | 'AD_FILM'
      | 'REEL'
      | 'ANIMATION'
      | 'INTERVIEW'
      | 'PORTRAIT',
    format?: 'LANDSCAPE' | 'PORTRAIT' | 'SQUARE',
  ) {
    const skip = (page - 1) * limit;

    let where: Prisma.VideoWhereInput = {
      ...(client_id && { client_id }),
      ...(type && { type }),
      ...(format && { format }),
    };

    if (keyword) {
      where = {
        ...where,
        tags: {
          some: {
            tag_name: { contains: keyword, mode: 'insensitive' },
            entity_type: 'VIDEO',
          },
        },
      };
    }

    const [videos, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          client: { select: { id: true, client_name: true } },
          tags: { select: { id: true, tag_name: true, entity_type: true } },
        },
      }),
      this.prisma.video.count({ where }),
    ]);

    const videosWithPublicUrls = videos.map((video) => {
      const thumbnail_public_url = this.getPublicUrlFromKey(video.thumbnail);
      const { thumbnail, ...rest } = video;
      return {
        ...rest,
        thumbnail_public_url,
      };
    });

    return { videos: videosWithPublicUrls, total, page, limit };
  }

  async update(id: number, dto: UpdateVideoDto) {
    const existing = await this.prisma.video.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }

    try {
      if (
        dto.thumbnail &&
        existing.thumbnail &&
        existing.thumbnail !== dto.thumbnail
      ) {
        try {
          const oldKey = existing.thumbnail;
          const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: oldKey,
          });
          await this.s3Client.send(command);
        } catch (error) {
          console.warn(
            `Failed to delete old S3 object ${existing.thumbnail}: ${error.message}`,
          );
        }
      }

      const data: Prisma.VideoUpdateInput = {
        title: dto.title,
        description: dto.description,
        video_url: dto.video_url,
        thumbnail: dto.thumbnail,
        format: dto.format,
        type: dto.type,
        ...(dto.client_id && { client: { connect: { id: dto.client_id } } }),
        ...(dto.created_by !== undefined && {
          createdBy: dto.created_by
            ? { connect: { id: dto.created_by } }
            : { disconnect: true },
        }),
        ...(dto.updated_by !== undefined && {
          updatedBy: dto.updated_by
            ? { connect: { id: dto.updated_by } }
            : { disconnect: true },
        }),
      };

      const updated = await this.prisma.video.update({
        where: { id },
        data,
      });
      return {
        message: 'Video updated successfully',
        video: updated,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to update video');
    }
  }

  async delete(id: number) {
    const video = await this.prisma.video.findUnique({
      where: { id },
    });
    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }

    try {
      if (video.thumbnail) {
        const key = video.thumbnail;
        const command = new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        });
        await this.s3Client.send(command);
      }
    } catch (error) {
      console.warn(
        `Failed to delete S3 object ${video.thumbnail}: ${error.message}`,
      );
    }

    const deleted = await this.prisma.video.delete({
      where: { id },
    });
    return {
      message: `Video with ID ${id} deleted successfully`,
      video: deleted,
    };
  }
}
