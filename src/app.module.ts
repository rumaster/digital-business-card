import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { SkillModule } from './skill/skill.module.js';
import { SkillService } from './skill/skill.service.js';
import { ExperienceModule } from './experience/experience.module.js';
import { ExperienceService } from './experience/experience.service.js';
import { ProjectModule } from './project/project.module.js';
import { ProjectService } from './project/project.service.js';
import { createLoaders } from './common/dataloader/create-loaders.js';
import { HealthModule } from './health/health.module.js';

const SANDBOX_EXAMPLE_QUERY = /* GraphQL */ `
  query GetProfile {
    profile {
      name
      description
      githubUrl
      skills {
        name
      }
      experience {
        company
        position
        startDate
        endDate
        achievements
      }
      projects {
        name
        url
      }
    }
  }
`;

@Module({
  imports: [
    PrismaModule,
    HealthModule,
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
      ) => {
        const playgroundEnabled =
          process.env.GRAPHQL_PLAYGROUND_ENABLED !== 'false';

        return {
          autoSchemaFile: join(process.cwd(), 'schema.gql'),
          sortSchema: true,
          graphiql: false,
          introspection: playgroundEnabled,
          plugins: [
            playgroundEnabled
              ? ApolloServerPluginLandingPageLocalDefault({
                  embed: true,
                  document: SANDBOX_EXAMPLE_QUERY,
                })
              : ApolloServerPluginLandingPageDisabled(),
          ],
          context: () => ({
            loaders: createLoaders(
              skillService,
              experienceService,
              projectService,
            ),
          }),
        };
      },
    }),
  ],
})
export class AppModule {}