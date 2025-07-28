import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientPriorityDto } from './dto/update-client-priority.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllClients(
    page: number,
    limit: number,
    keyword: string,
    country_id?: string,
  ) {
    try {
      const skip = (page - 1) * limit;

      const where: Prisma.ClientWhereInput = {
        AND: [
          keyword
            ? {
                OR: [
                  { client_name: { contains: keyword, mode: 'insensitive' } },
                  { description: { contains: keyword, mode: 'insensitive' } },
                  { description1: { contains: keyword, mode: 'insensitive' } },
                ],
              }
            : {},
          country_id ? { country_id: parseInt(country_id, 10) } : {},
        ],
      };

      const [clients, total] = await Promise.all([
        this.prisma.client.findMany({
          where,
          skip,
          take: limit,
          orderBy: { priority: 'desc' },
        }),
        this.prisma.client.count({ where }),
      ]);

      return {
        clients,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to fetch clients');
    }
  }

  async update(id: number, dto: UpdateClientPriorityDto) {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id },
      });

      if (!client) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }

      const updatedClient = await this.prisma.client.update({
        where: { id },
        data: {
          priority: dto.priority ?? 0,
          description1: dto.description1 ?? client.description1,
        },
      });

      return {
        message: 'Client updated successfully',
        client: updatedClient,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to update client');
    }
  }

  async syncClients(clients: CreateClientDto[]) {
    try {
      let createdCount = 0;
      let skippedCount = 0;

      for (const client of clients) {
        const existingClient = await this.prisma.client.findUnique({
          where: { id: client.id },
        });

        if (!existingClient) {
          const data: Prisma.ClientCreateInput = {
            id: client.id,
            client_name: client.client_name ?? null,
            country_id: client.country_id ?? null,
            description: client.description ?? null,
            description1: client.description1 ?? null,
            thumbnail: client.thumbnail ?? null,
            priority: client.priority ?? 0,
          };

          await this.prisma.client.create({
            data,
          });
          createdCount++;
        } else {
          skippedCount++;
        }
      }

      return {
        message: `Sync completed: ${createdCount} clients created, ${skippedCount} clients skipped (already exist)`,
        created: createdCount,
        skipped: skippedCount,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to sync clients');
    }
  }
}
