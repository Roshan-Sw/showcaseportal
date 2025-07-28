import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllProjects(
    page: number,
    limit: number,
    keyword: string,
    client_id?: string,
  ) {
    try {
      const skip = (page - 1) * limit;

      const where: Prisma.ProjectWhereInput = {
        AND: [
          keyword
            ? {
                OR: [
                  { project_name: { contains: keyword, mode: 'insensitive' } },
                  {
                    description: {
                      not: null,
                      contains: keyword,
                      mode: 'insensitive',
                    },
                  },
                ],
              }
            : {},
          client_id && !isNaN(parseInt(client_id, 10))
            ? { client_id: parseInt(client_id, 10) }
            : {},
        ],
      };

      const [projects, total] = await Promise.all([
        this.prisma.project.findMany({
          where,
          skip,
          take: limit,
          orderBy: { priority: 'desc' },
        }),
        this.prisma.project.count({ where }),
      ]);

      const serializedProjects = projects.map((project) => ({
        ...project,
        id: project.id.toString(),
      }));

      return {
        projects: serializedProjects,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in getAllProjects:', error);
      throw new BadRequestException(
        error.message || 'Failed to fetch projects',
      );
    }
  }

  async updateProject(id: number, dto: UpdateProjectDto) {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id },
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      const updatedProject = await this.prisma.project.update({
        where: { id },
        data: {
          description1: dto.description1 ?? project.description1,
          priority: dto.priority ?? project.priority,
        },
      });

      const serializedProject = {
        ...updatedProject,
        id: updatedProject.id.toString(),
      };

      return {
        message: 'Project updated successfully',
        project: serializedProject,
      };
    } catch (error) {
      console.error('Error in updateProject:', error);
      throw new BadRequestException(
        error.message || 'Failed to update project',
      );
    }
  }

  private generateScopeId(): bigint {
    return BigInt(Date.now()) + BigInt(Math.floor(Math.random() * 1000));
  }

  async syncProjects(projects: CreateProjectDto[]) {
    try {
      let createdCount = 0;
      let skippedCount = 0;

      for (const project of projects) {
        const existingProject = await this.prisma.project.findUnique({
          where: { id: project.id },
        });

        if (project.clientId !== null && project.clientId !== undefined) {
          const clientExists = await this.prisma.client.findUnique({
            where: { id: project.clientId },
          });
          if (!clientExists) {
            throw new BadRequestException(
              `Client with ID ${project.clientId} does not exist`,
            );
          }
        }

        const projectData: Prisma.ProjectCreateInput = {
          id: project.id,
          project_name: project.projectName,
          description: project.description ?? null,
          priority: project.priority ?? 0,
          ...(project.clientId !== null && project.clientId !== undefined
            ? { client: { connect: { id: project.clientId } } }
            : {}),
          start_date: project.startdate ? new Date(project.startdate) : null,
          scopes: {
            create: project.scopes?.map((scope) => ({
              id: this.generateScopeId(),
              scopeType: scope.scopeType,
              isSelected: scope.isSelected ?? false,
            })),
          },
        };

        if (!existingProject) {
          await this.prisma.project.create({
            data: projectData,
            include: { scopes: true },
          });
          createdCount++;
        } else {
          await this.prisma.project.update({
            where: { id: project.id },
            data: {
              project_name: project.projectName,
              description: project.description ?? null,
              priority: project.priority ?? 0,
              ...(project.clientId !== null && project.clientId !== undefined
                ? { client: { connect: { id: project.clientId } } }
                : { client: { disconnect: true } }),
              start_date: project.startdate
                ? new Date(project.startdate)
                : existingProject.start_date,
              scopes: {
                deleteMany: {},
                create: project.scopes?.map((scope) => ({
                  id: this.generateScopeId(),
                  scopeType: scope.scopeType,
                  isSelected: scope.isSelected ?? false,
                })),
              },
            },
            include: { scopes: true },
          });
          skippedCount++;
        }
      }

      return {
        message: `Sync completed: ${createdCount} projects created, ${skippedCount} projects updated`,
        created: createdCount,
        updated: skippedCount,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to sync projects');
    }
  }
}
