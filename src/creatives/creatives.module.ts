import { Module } from '@nestjs/common';
import { CreativesService } from './creatives.service';
import { CreativesController } from './creatives.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CreativesController],
  providers: [CreativesService],
})
export class CreativesModule {}
