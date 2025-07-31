import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';
import { UpdateWebsiteTechnologyMappingsDto } from './dto/update-website-technology-mapping.dto';
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
export class WebsitesService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly prisma: PrismaService) {
    const { region, accessKeyId, secretAccessKey, bucket } = validateEnv();
    this.bucket = bucket;
    this.region = region;
    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  private getPublicUrlFromKey(key: string | null): string | null {
    if (!key) return null;
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async create(dto: CreateWebsiteDto) {
    try {
      const data: Prisma.WebsiteCreateInput = {
        title: dto.title,
        url: dto.url,
        type: dto.type,
        description: dto.description,
        thumbnail: dto.thumbnail,
        launch_date: dto.launch_date ? new Date(dto.launch_date) : undefined,
        client: { connect: { id: dto.client_id } },
        createdBy: dto.created_by
          ? { connect: { id: dto.created_by } }
          : undefined,
        updatedBy: dto.updated_by
          ? { connect: { id: dto.updated_by } }
          : undefined,
      };

      const website = await this.prisma.website.create({ data });
      return {
        message: 'Website created successfully',
        website,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to create website',
      );
    }
  }

  async list(page: number, limit: number, keyword: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.WebsiteWhereInput = {
      ...(keyword && { title: { contains: keyword, mode: 'insensitive' } }),
    };

    const [websites, total] = await Promise.all([
      this.prisma.website.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          client: { select: { id: true, client_name: true } },
          technologies: {
            include: { technology: { select: { id: true, name: true } } },
          },
          tags: { select: { id: true, tag_name: true, entity_type: true } },
        },
      }),
      this.prisma.website.count({ where }),
    ]);

    const websitesWithPublicUrls = websites.map((website) => {
      const thumbnail_public_url = this.getPublicUrlFromKey(website.thumbnail);
      const { thumbnail, ...rest } = website;
      return {
        ...rest,
        thumbnail_public_url,
      };
    });

    return { websites: websitesWithPublicUrls, total, page, limit };
  }

  async listWithFilters(
    page: number,
    limit: number,
    keyword: string,
    client_id?: number,
    technology_id?: number,
    type?: 'WEBSITE' | 'LANDING_PAGE',
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.WebsiteWhereInput = {
      ...(keyword && {
        tags: {
          some: {
            tag_name: { contains: keyword, mode: 'insensitive' },
            entity_type: 'WEBSITE',
          },
        },
      }),
      ...(client_id && { client_id }),
      ...(technology_id && {
        technologies: {
          some: {
            technology_id,
          },
        },
      }),
      ...(type && { type }),
    };

    const [websites, total] = await Promise.all([
      this.prisma.website.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          client: { select: { id: true, client_name: true } },
          technologies: {
            include: { technology: { select: { id: true, name: true } } },
          },
          tags: { select: { id: true, tag_name: true, entity_type: true } },
        },
      }),
      this.prisma.website.count({ where }),
    ]);

    const websitesWithPublicUrls = websites.map((website) => {
      const thumbnail_public_url = this.getPublicUrlFromKey(website.thumbnail);
      const { thumbnail, ...rest } = website;
      return {
        ...rest,
        thumbnail_public_url,
      };
    });

    return { websites: websitesWithPublicUrls, total, page, limit };
  }

  async update(id: number, dto: UpdateWebsiteDto) {
    const existing = await this.prisma.website.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Website with ID ${id} not found`);
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

      const data: Prisma.WebsiteUpdateInput = {
        title: dto.title,
        url: dto.url,
        type: dto.type,
        description: dto.description,
        thumbnail: dto.thumbnail,
        launch_date: dto.launch_date ? new Date(dto.launch_date) : undefined,
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

      const updated = await this.prisma.website.update({
        where: { id },
        data,
      });
      return {
        message: 'Website updated successfully',
        website: updated,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to update website',
      );
    }
  }

  async delete(id: number) {
    const website = await this.prisma.website.findUnique({
      where: { id },
    });
    if (!website) {
      throw new NotFoundException(`Website with ID ${id} not found`);
    }

    try {
      if (website.thumbnail) {
        const key = website.thumbnail;
        const command = new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        });
        await this.s3Client.send(command);
      }
    } catch (error) {
      console.warn(
        `Failed to delete S3 object ${website.thumbnail}: ${error.message}`,
      );
    }

    const deleted = await this.prisma.website.delete({
      where: { id },
    });
    return {
      message: `Website with ID ${id} deleted successfully`,
      website: deleted,
    };
  }

  async updateTechnologyMappings(
    id: number,
    dto: UpdateWebsiteTechnologyMappingsDto,
  ) {
    try {
      const website = await this.prisma.website.findUnique({
        where: { id },
      });
      if (!website) {
        throw new NotFoundException(`Website with ID ${id} not found`);
      }

      const technologies = await this.prisma.technology.findMany({
        where: { id: { in: dto.technology_ids } },
      });
      if (technologies.length !== dto.technology_ids.length) {
        throw new BadRequestException('One or more technology IDs are invalid');
      }

      await this.prisma.$transaction([
        this.prisma.website_Technology_Mapping.deleteMany({
          where: { website_id: id },
        }),
        ...dto.technology_ids.map((technology_id) =>
          this.prisma.website_Technology_Mapping.create({
            data: {
              website: { connect: { id } },
              technology: { connect: { id: technology_id } },
              createdBy: dto.created_by
                ? { connect: { id: dto.created_by } }
                : undefined,
              updatedBy: dto.updated_by
                ? { connect: { id: dto.updated_by } }
                : undefined,
            },
          }),
        ),
      ]);

      return {
        message: 'Website-Technology mappings updated successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to update website-technology mappings',
      );
    }
  }
}
