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
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientPriorityDto } from './dto/update-client-priority.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('list')
  @UseGuards(JwtAuthGuard)
  async list(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('keyword') keyword: string = '',
    @Query('country_id') country_id?: string,
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

    return this.clientsService.getAllClients(
      parsedPage,
      parsedLimit,
      keyword,
      country_id,
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
    @Body() dto: UpdateClientPriorityDto,
  ) {
    return this.clientsService.update(id, dto);
  }

  @Post('syncing')
  async syncClients(@Body() body: { clients: CreateClientDto[] }) {
    if (!body.clients || !Array.isArray(body.clients)) {
      throw new BadRequestException('Invalid clients data');
    }
    return this.clientsService.syncClients(body.clients);
  }
}
