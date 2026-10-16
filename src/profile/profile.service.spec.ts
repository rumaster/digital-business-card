import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProfileService } from './profile.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('ProfileService', () => {
  let service: ProfileService;
  let prisma: { profile: { findFirst: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    prisma = {
      profile: {
        findFirst: vi.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(ProfileService);
  });

 describe('getProfile', () => {
    it('returns the profile when one exists', async () => {
      const profile = {
        id: 'profile-1',
        slug: 'vasia-ivanov',
        name: 'Vasia Ivanov',
        description: 'Backend developer',
        githubUrl: null,
        linkedinUrl: null,
        websiteUrl: null,
      };
      prisma.profile.findFirst.mockResolvedValue(profile);

      await expect(service.getProfile()).resolves.toEqual(profile);
    });

    it('queries the earliest created profile, oldest first', async () => {
      prisma.profile.findFirst.mockResolvedValue({ id: 'profile-1' });

      await service.getProfile();

      expect(prisma.profile.findFirst).toHaveBeenCalledWith({
        orderBy: { createdAt: 'asc' },
      });
      expect(prisma.profile.findFirst).toHaveBeenCalledTimes(1);
    });

    it('throws NotFoundException when the database has no profile', async () => {
      prisma.profile.findFirst.mockResolvedValue(null);

      await expect(service.getProfile()).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
