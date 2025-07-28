import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TechnologiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTechnologyDto) {
    try {
      const existingTechnology = await this.prisma.technology.findFirst({
        where: { name: dto.name },
      });

      if (existingTechnology) {
        throw new ConflictException(
          `Technology with name '${dto.name}' already exists`,
        );
      }

      const data: Prisma.TechnologyCreateInput = {
        name: dto.name,
        createdBy: dto.created_by
          ? { connect: { id: dto.created_by } }
          : undefined,
        updatedBy: dto.updated_by
          ? { connect: { id: dto.updated_by } }
          : undefined,
      };

      const technology = await this.prisma.technology.create({ data });
      return {
        message: 'Technology created successfully',
        technology,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Failed to create technology',
      );
    }
  }

  async list(page: number, limit: number, keyword: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.TechnologyWhereInput = {
      ...(keyword && { name: { contains: keyword, mode: 'insensitive' } }),
    };

    const [technologies, total] = await Promise.all([
      this.prisma.technology.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          websites: {
            include: {
              website: { select: { id: true, title: true } },
            },
          },
        },
      }),
      this.prisma.technology.count({ where }),
    ]);

    return { technologies, total, page, limit };
  }

  async update(id: number, dto: UpdateTechnologyDto) {
    const existing = await this.prisma.technology.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Technology with ID ${id} not found`);
    }

    try {
      if (dto.name && dto.name !== existing.name) {
        const existingWithSameName = await this.prisma.technology.findFirst({
          where: {
            name: dto.name,
            id: { not: id },
          },
        });

        if (existingWithSameName) {
          throw new ConflictException(
            `Technology with name '${dto.name}' already exists`,
          );
        }
      }

      const data: Prisma.TechnologyUpdateInput = {
        name: dto.name,
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

      const updated = await this.prisma.technology.update({
        where: { id },
        data,
      });
      return {
        message: 'Technology updated successfully',
        technology: updated,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Failed to update technology',
      );
    }
  }

  async delete(id: number) {
    const technology = await this.prisma.technology.findUnique({
      where: { id },
    });
    if (!technology) {
      throw new NotFoundException(`Technology with ID ${id} not found`);
    }

    const deleted = await this.prisma.technology.delete({
      where: { id },
    });
    return {
      message: `Technology with ID ${id} deleted successfully`,
      technology: deleted,
    };
  }
}
