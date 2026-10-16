import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}

  findManyByProfileIds(profileIds: string[]) {
    return this.prisma.experience.findMany({
      where: { profileId: { in: profileIds } },
      orderBy: { startDate: 'desc' },
    });
  }
}
