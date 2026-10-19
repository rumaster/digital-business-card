import { Test } from '@nestjs/testing';
import { ExperienceService } from './experience.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('ExperienceService', () => {
  let service: ExperienceService;
  let prisma: { experience: { findMany: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    prisma = {
      experience: {
        findMany: vi.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ExperienceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(ExperienceService);
  });
  describe('findManyByProfileIds', () => {
    it('queries experience filtered by the given profile ids, most recent first', async () => {
      prisma.experience.findMany.mockResolvedValue([]);

      await service.findManyByProfileIds(['profile-1', 'profile-2']);

      expect(prisma.experience.findMany).toHaveBeenCalledWith({
        where: { profileId: { in: ['profile-1', 'profile-2'] } },
        orderBy: { startDate: 'desc' },
      });
    });

    it('returns whatever Prisma resolves with', async () => {
      const rows = [
        {
          id: 'expa1',
          company: 'The best of the best',
          position: 'Engineer',
          startDate: new Date('2000-01-01'),
          endDate: null,
          achievements: [],
          profileId: 'profile-1',
        },
      ];
      prisma.experience.findMany.mockResolvedValue(rows);

      await expect(
        service.findManyByProfileIds(['profile-1']),
      ).resolves.toEqual(rows);
    });
  });
});
