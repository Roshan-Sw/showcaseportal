import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { ProjectsModule } from './projects/projects.module';
import { WebsitesModule } from './websites/websites.module';
import { TechnologiesModule } from './technologies/technologies.module';
import { TagMappingsModule } from './tag-mappings/tag-mappings.module';
import { VideosModule } from './videos/videos.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    ClientsModule,
    ProjectsModule,
    WebsitesModule,
    TechnologiesModule,
    TagMappingsModule,
    VideosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
