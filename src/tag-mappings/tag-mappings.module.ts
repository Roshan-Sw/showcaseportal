import { Module } from '@nestjs/common';
import { TagMappingsService } from './tag-mappings.service';
import { TagMappingsController } from './tag-mappings.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TagMappingsController],
  providers: [TagMappingsService],
})
export class TagMappingsModule {}
