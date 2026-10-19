import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SkillService {
  constructor(private readonly prisma: PrismaService) {}

  findManyByProfileIds(profileIds: string[]) {
    return this.prisma.skill.findMany({
      where: { profileId: { in: profileIds } },
      orderBy: { name: 'asc' },
    });
  }
}
