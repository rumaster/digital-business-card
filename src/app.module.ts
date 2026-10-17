import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { SkillModule } from './skill/skill.module.js';
import { SkillService } from './skill/skill.service.js';
import { ExperienceModule } from './experience/experience.module.js';
import { ExperienceService } from './experience/experience.service.js';
import { ProjectModule } from './project/project.module.js';
import { ProjectService } from './project/project.service.js';
import { createLoaders } from './common/dataloader/create-loaders.js';

@Module({
  imports: [
    PrismaModule,
    ProfileModule,
    SkillModule,
    ExperienceModule,
    ProjectModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [SkillModule, ExperienceModule, ProjectModule],
      inject: [SkillService, ExperienceService, ProjectService],
      useFactory: (
        skillService: SkillService,
        experienceService: ExperienceService,
        projectService: ProjectService,
      ) => ({
        autoSchemaFile: true,
        sortSchema: true,
        graphiql: false,
        plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
        context: () => ({
          loaders: createLoaders(skillService, experienceService, projectService),
        }),
      }),
    }),
  ],
})
export class AppModule {}
