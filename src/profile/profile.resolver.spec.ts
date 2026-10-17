import { Test } from '@nestjs/testing';
import { ProfileResolver } from './profile.resolver.js';
import { ProfileService } from './profile.service.js';
import type { Profile } from './models/profile.model.js';
import type { GraphQLContext } from '../common/dataloader/dataloader.interface.js';

describe('ProfileResolver', () => {
  let resolver: ProfileResolver;
  let profileService: { getProfile: ReturnType<typeof vi.fn> };

  const profile = { id: 'profile-1' } as Profile;

  function makeContext(): GraphQLContext {
    return {
      loaders: {
        skillsByProfileId: { load: vi.fn().mockResolvedValue(['skill']) },
        experienceByProfileId: {
          load: vi.fn().mockResolvedValue(['experience']),
        },
        projectsByProfileId: { load: vi.fn().mockResolvedValue(['project']) },
      } as unknown as GraphQLContext['loaders'],
    };
  }

  beforeEach(async () => {
    profileService = { getProfile: vi.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProfileResolver,
        { provide: ProfileService, useValue: profileService },
      ],
    }).compile();

    resolver = moduleRef.get(ProfileResolver);
  });

  describe('profile (Query)', () => {
    it('delegates to ProfileService.getProfile and returns its result', async () => {
      profileService.getProfile.mockResolvedValue(profile);

      await expect(resolver.profile()).resolves.toBe(profile);
      expect(profileService.getProfile).toHaveBeenCalledTimes(1);
    });

    it('propagates errors from the service (e.g. profile not found)', async () => {
      const error = new Error('not found');
      profileService.getProfile.mockRejectedValue(error);

      await expect(resolver.profile()).rejects.toThrow(error);
    });
  });

  describe('skills (ResolveField)', () => {
    it('loads skills for the parent profile via the skills loader', async () => {
      const ctx = makeContext();

      const result = await resolver.skills(profile, ctx);

      expect(ctx.loaders.skillsByProfileId.load).toHaveBeenCalledWith(
        'profile-1',
      );
      expect(result).toEqual(['skill']);
    });

    it('does not touch the other loaders', async () => {
      const ctx = makeContext();

      await resolver.skills(profile, ctx);

      expect(ctx.loaders.experienceByProfileId.load).not.toHaveBeenCalled();
      expect(ctx.loaders.projectsByProfileId.load).not.toHaveBeenCalled();
    });
  });

  describe('experience (ResolveField)', () => {
    it('loads experience for the parent profile via the experience loader', async () => {
      const ctx = makeContext();

      const result = await resolver.experience(profile, ctx);

      expect(ctx.loaders.experienceByProfileId.load).toHaveBeenCalledWith(
        'profile-1',
      );
      expect(result).toEqual(['experience']);
    });
  });

  describe('projects (ResolveField)', () => {
    it('loads projects for the parent profile via the projects loader', async () => {
      const ctx = makeContext();

      const result = await resolver.projects(profile, ctx);

      expect(ctx.loaders.projectsByProfileId.load).toHaveBeenCalledWith(
        'profile-1',
      );
      expect(result).toEqual(['project']);
    });
  });
});
