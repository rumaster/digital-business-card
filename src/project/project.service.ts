import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  findManyByProfileIds(profileIds: string[]) {
    return this.prisma.project.findMany({
      where: { profileId: { in: profileIds } },
      orderBy: { name: 'asc' },
    });
  }
}
