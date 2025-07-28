import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Param,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('list')
  @UseGuards(JwtAuthGuard)
  async list(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('keyword') keyword: string = '',
    @Query('client_id') client_id?: string,
  ) {
    const parsedPage = parseInt(page, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
      throw new BadRequestException(
        'Query parameter "page" must be a positive integer',
      );
    }

    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      throw new BadRequestException(
        'Query parameter "limit" must be a positive integer',
      );
    }

    return this.projectsService.getAllProjects(
      parsedPage,
      parsedLimit,
      keyword,
      client_id,
    );
  }

  @Put('update/:id')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(id, dto);
  }

  @Post('syncing')
  async syncProjects(@Body() body: { projects: CreateProjectDto[] }) {
    if (!body.projects || !Array.isArray(body.projects)) {
      throw new BadRequestException('Invalid projects data');
    }
    return this.projectsService.syncProjects(body.projects);
  }
}
