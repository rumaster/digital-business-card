import { Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ProfileService } from './profile.service.js';
import { Profile } from './models/profile.model.js';
import { Skill } from '../skill/models/skill.model.js';
import { Experience } from '../experience/models/experience.model.js';
import { Project } from '../project/models/project.model.js';
import type { GraphQLContext } from '../common/dataloader/dataloader.interface.js';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => Profile, { description: 'Возвращает профиль визитки' })
  profile() {
    return this.profileService.getProfile();
  }

  @ResolveField(() => [Skill])
  skills(@Parent() profile: Profile, @Context() ctx: GraphQLContext) {
    return ctx.loaders.skillsByProfileId.load(profile.id);
  }

  @ResolveField(() => [Experience])
  experience(@Parent() profile: Profile, @Context() ctx: GraphQLContext) {
    return ctx.loaders.experienceByProfileId.load(profile.id);
  }

  @ResolveField(() => [Project])
  projects(@Parent() profile: Profile, @Context() ctx: GraphQLContext) {
    return ctx.loaders.projectsByProfileId.load(profile.id);
  }
}
