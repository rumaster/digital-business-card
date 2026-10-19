import { Test } from '@nestjs/testing';
import { SkillService } from './skill.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('SkillService', () => {
  let service: SkillService;
  let prisma: { skill: { findMany: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    prisma = {
      skill: {
        findMany: vi.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [SkillService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(SkillService);
  });

  describe('findManyByProfileIds', () => {
    it('queries skills filtered by the given profile ids, sorted by name', async () => {
      prisma.skill.findMany.mockResolvedValue([]);

      await service.findManyByProfileIds(['profile-1', 'profile-2']);

      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        where: { profileId: { in: ['profile-1', 'profile-2'] } },
        orderBy: { name: 'asc' },
      });
    });

    it('returns whatever Prisma resolves with', async () => {
      const rows = [{ id: 's1', name: 'TypeScript', profileId: 'profile-1' }];
      prisma.skill.findMany.mockResolvedValue(rows);

      await expect(
        service.findManyByProfileIds(['profile-1']),
      ).resolves.toEqual(rows);
    });

    it('does not reject on an empty id list', async () => {
      prisma.skill.findMany.mockResolvedValue([]);

      await expect(service.findManyByProfileIds([])).resolves.toEqual([]);
      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        where: { profileId: { in: [] } },
        orderBy: { name: 'asc' },
      });
    });
  });
});
