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
      const existingTag = await this.prisma.tag_Mapping.findFirst({
        where: {
          entity_type: dto.entity_type,
          entity_id: dto.entity_id,
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
        website:
          dto.entity_type === 'WEBSITE'
            ? { connect: { id: dto.entity_id } }
            : undefined,
        video:
          dto.entity_type === 'VIDEO'
            ? { connect: { id: dto.entity_id } }
            : undefined,
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
          entity_id: websiteId,
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
          entity_id: videoId,
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
  }
}
