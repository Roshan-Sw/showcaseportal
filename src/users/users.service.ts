import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-role-user.dto';
import { Prisma, $Enums } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ id: dto.id }, dto.email ? { email: dto.email } : {}],
        },
        include: {
          employee: true,
        },
      });

      if (existingUser) {
        return {
          message: 'User already exists',
          user: existingUser,
        };
      }

      const data: Prisma.UserCreateInput = {
        id: dto.id,
        first_name: dto.first_name ?? null,
        last_name: dto.last_name ?? null,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        role: dto.role ?? $Enums.UserRole.STANDARD_USER,
        createdBy: dto.created_by
          ? { connect: { id: dto.created_by } }
          : undefined,
        updatedBy: dto.updated_by
          ? { connect: { id: dto.updated_by } }
          : undefined,
      };

      const user = await this.prisma.user.create({
        data,
        include: {
          employee: true,
        },
      });

      return {
        message: 'User created successfully',
        user,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to create user');
    }
  }

  async getAllUsers(
    page: number,
    limit: number,
    keyword: string,
    role?: string,
  ) {
    try {
      const skip = (page - 1) * limit;

      const where: Prisma.UserWhereInput = {
        AND: [
          keyword
            ? {
                OR: [
                  { first_name: { contains: keyword, mode: 'insensitive' } },
                  { last_name: { contains: keyword, mode: 'insensitive' } },
                  { email: { contains: keyword, mode: 'insensitive' } },
                ],
              }
            : {},
          role ? { role: role as $Enums.UserRole } : {},
        ],
      };

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { id: 'desc' },
          include: {
            employee: true,
          },
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        users,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to fetch users');
    }
  }

  async updateUserRole(id: number, dto: UpdateUserRoleDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          role: dto.role,
          updatedBy: dto.updated_by
            ? { connect: { id: dto.updated_by } }
            : undefined,
        },
        include: {
          employee: true,
        },
      });

      return {
        message: 'User role updated successfully',
        user: updatedUser,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to update user role',
      );
    }
  }

  async getUserById(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          employee: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return {
        message: 'User retrieved successfully',
        user,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to retrieve user');
    }
  }

  async syncUsers(users: CreateUserDto[]) {
    try {
      let createdCount = 0;
      let skippedCount = 0;

      for (const user of users) {
        const existingUser = await this.prisma.user.findUnique({
          where: { id: user.id },
        });

        if (!existingUser) {
          const data: Prisma.UserCreateInput = {
            id: user.id,
            first_name: user.first_name ?? null,
            last_name: user.last_name ?? null,
            email: user.email ?? null,
            phone: user.phone ?? null,
            role: user.role ?? $Enums.UserRole.STANDARD_USER,
          };

          await this.prisma.user.create({
            data,
            include: {
              employee: true,
            },
          });
          createdCount++;
        } else {
          skippedCount++;
        }
      }

      return {
        message: `Sync completed: ${createdCount} users created, ${skippedCount} users skipped (already exist)`,
        created: createdCount,
        skipped: skippedCount,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to sync users');
    }
  }
}
