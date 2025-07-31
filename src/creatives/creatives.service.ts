import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCreativeDto } from './dto/create-creative.dto';
import { UpdateCreativeDto } from './dto/update-creative.dto';
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
export class CreativesService {
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

  async create(dto: CreateCreativeDto) {
    try {
      const data: Prisma.CreativeCreateInput = {
        name: dto.name,
        description: dto.description,
        priority: dto.priority,
        type: dto.type,
        file: dto.file,
        thumbnail: dto.thumbnail,
        created_at: dto.created_at ? new Date(dto.created_at) : undefined,
        createdBy: dto.created_by
          ? { connect: { id: dto.created_by } }
          : undefined,
        updatedBy: dto.updated_by
          ? { connect: { id: dto.updated_by } }
          : undefined,
      };

      const creative = await this.prisma.creative.create({ data });
      return {
        message: 'Creative created successfully',
        creative,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to create creative',
      );
    }
  }

  async list(
    page: number,
    limit: number,
    keyword: string,
    type?: 'LOGO' | 'BROCHURE',
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.CreativeWhereInput = {
      ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
      ...(type && { type }),
    };

    const [creatives, total] = await Promise.all([
      this.prisma.creative.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          createdBy: { select: { id: true } },
          updatedBy: { select: { id: true } },
        },
      }),
      this.prisma.creative.count({ where }),
    ]);

    const creativesWithPublicUrls = creatives.map((creative) => {
      const file_public_url = this.getPublicUrlFromKey(creative.file);
      const thumbnail_public_url = this.getPublicUrlFromKey(creative.thumbnail);
      const { file, thumbnail, ...rest } = creative;
      return {
        ...rest,
        file_public_url,
        thumbnail_public_url,
      };
    });

    return { creatives: creativesWithPublicUrls, total, page, limit };
  }

  async listing(
    page: number,
    limit: number,
    keyword: string,
    type?: 'LOGO' | 'BROCHURE',
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.CreativeWhereInput = {
      ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
      ...(type && { type }),
    };

    const [creatives, total] = await Promise.all([
      this.prisma.creative.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          createdBy: { select: { id: true } },
          updatedBy: { select: { id: true } },
        },
      }),
      this.prisma.creative.count({ where }),
    ]);

    const creativesWithPublicUrls = creatives.map((creative) => {
      const file_public_url = this.getPublicUrlFromKey(creative.file);
      const thumbnail_public_url = this.getPublicUrlFromKey(creative.thumbnail);
      const { file, thumbnail, ...rest } = creative;
      return {
        ...rest,
        file_public_url,
        thumbnail_public_url,
      };
    });

    return { creatives: creativesWithPublicUrls, total, page, limit };
  }

  async update(id: number, dto: UpdateCreativeDto) {
    const existing = await this.prisma.creative.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Creative with ID ${id} not found`);
    }

    try {
      if (dto.file && existing.file && existing.file !== dto.file) {
        try {
          const oldKey = existing.file;
          const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: oldKey,
          });
          await this.s3Client.send(command);
        } catch (error) {
          console.warn(
            `Failed to delete old S3 file ${existing.file}: ${error.message}`,
          );
        }
      }

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
            `Failed to delete old S3 thumbnail ${existing.thumbnail}: ${error.message}`,
          );
        }
      }

      const data: Prisma.CreativeUpdateInput = {
        name: dto.name,
        description: dto.description,
        priority: dto.priority,
        type: dto.type,
        file: dto.file,
        thumbnail: dto.thumbnail,
        created_at: dto.created_at ? new Date(dto.created_at) : undefined,
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

      const updated = await this.prisma.creative.update({
        where: { id },
        data,
      });
      return {
        message: 'Creative updated successfully',
        creative: updated,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to update creative',
      );
    }
  }

  async delete(id: number) {
    const creative = await this.prisma.creative.findUnique({
      where: { id },
    });
    if (!creative) {
      throw new NotFoundException(`Creative with ID ${id} not found`);
    }

    try {
      if (creative.file) {
        const command = new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: creative.file,
        });
        await this.s3Client.send(command);
      }
      if (creative.thumbnail) {
        const command = new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: creative.thumbnail,
        });
        await this.s3Client.send(command);
      }
    } catch (error) {
      console.warn(
        `Failed to delete S3 objects for creative ${id}: ${error.message}`,
      );
    }

    const deleted = await this.prisma.creative.delete({
      where: { id },
    });
    return {
      message: `Creative with ID ${id} deleted successfully`,
      creative: deleted,
    };
  }
}
