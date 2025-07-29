import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTagMappingDto } from './dto/create-tag-mapping.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TagMappingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTagMappingDto) {
    try {
      if (dto.website_id && dto.video_id) {
        throw new BadRequestException(
          'Only one of website_id or video_id should be provided',
        );
      }

      if (dto.entity_type === 'WEBSITE' && !dto.website_id) {
        throw new BadRequestException(
          'website_id is required for WEBSITE entity type',
        );
      }

      if (dto.entity_type === 'VIDEO' && !dto.video_id) {
        throw new BadRequestException(
          'video_id is required for VIDEO entity type',
        );
      }

      const existingTag = await this.prisma.tag_Mapping.findFirst({
        where: {
          entity_type: dto.entity_type,
          website_id: dto.website_id,
          video_id: dto.video_id,
          tag_name: dto.tag_name,
        },
      });

      if (existingTag) {
        throw new BadRequestException(
          `Tag with name '${dto.tag_name}' already exists for this entity`,
        );
      }

      const data: Prisma.Tag_MappingCreateInput = {
        entity_type: dto.entity_type,
        tag_name: dto.tag_name,
        website: dto.website_id
          ? { connect: { id: dto.website_id } }
          : undefined,
        video: dto.video_id ? { connect: { id: dto.video_id } } : undefined,
        createdBy: dto.created_by
          ? { connect: { id: dto.created_by } }
          : undefined,
        updatedBy: dto.updated_by
          ? { connect: { id: dto.updated_by } }
          : undefined,
      };

      const tag_Mapping = await this.prisma.tag_Mapping.create({ data });
      return {
        message: 'Tag mapping created successfully',
        tagMapping: tag_Mapping,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to create tag mapping',
      );
    }
  }

  async getTagsByWebsite(websiteId: number) {
    try {
      const tags = await this.prisma.tag_Mapping.findMany({
        where: {
          entity_type: 'WEBSITE',
          website_id: websiteId,
        },
        orderBy: { id: 'desc' },
      });
      return {
        message: 'Tags retrieved successfully',
        tags,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to retrieve tags');
    }
  }

  async getTagsByVideo(videoId: number) {
    try {
      const tags = await this.prisma.tag_Mapping.findMany({
        where: {
          entity_type: 'VIDEO',
          video_id: videoId,
        },
        orderBy: { id: 'desc' },
      });
      return {
        message: 'Tags retrieved successfully',
        tags,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to retrieve tags');
    }
  }

  async delete(id: number) {
    try {
      const tag_Mapping = await this.prisma.tag_Mapping.findUnique({
        where: { id },
      });

      if (!tag_Mapping) {
        throw new NotFoundException(`Tag mapping with ID ${id} not found`);
      }

      const deleted = await this.prisma.tag_Mapping.delete({
        where: { id },
      });

      return {
        message: `Tag mapping with ID ${id} deleted successfully`,
        tagMapping: deleted,
      };
    } catch (error) {
      throw error instanceof NotFoundException
        ? error
        : new BadRequestException(
            error.message || 'Failed to delete tag mapping',
          );
    }
  }
}
