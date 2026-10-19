import { Test } from '@nestjs/testing';
import { ProjectService } from './project.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('ProjectService', () => {
  let service: ProjectService;
  let prisma: { project: { findMany: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    prisma = {
      project: {
        findMany: vi.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [ProjectService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(ProjectService);
  });

  describe('findManyByProfileIds', () => {
    it('queries projects filtered by the given profile ids, sorted by name', async () => {
      prisma.project.findMany.mockResolvedValue([]);

      await service.findManyByProfileIds(['profile-1', 'profile-2']);

      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { profileId: { in: ['profile-1', 'profile-2'] } },
        orderBy: { name: 'asc' },
      });
    });

    it('returns whatever Prisma resolves with', async () => {
      const rows = [
        {
          id: 'p1',
          name: 'Digital Business Card',
          description: null,
          url: 'https://example.com',
          profileId: 'profile-1',
        },
      ];
      prisma.project.findMany.mockResolvedValue(rows);

      await expect(
        service.findManyByProfileIds(['profile-1']),
      ).resolves.toEqual(rows);
    });
  });
});
