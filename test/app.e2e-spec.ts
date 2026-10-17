import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { randomUUID } from 'node:crypto';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('GraphQL /graphql - profile query (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let profileId: string;
  let existingProfiles: Awaited<
    ReturnType<typeof snapshotProfiles>
  > = [];
  const slug = `e2e-${randomUUID()}`;

  function snapshotProfiles(client: PrismaService) {
    return client.profile.findMany({
      include: { skills: true, experience: true, projects: true },
    });
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    existingProfiles = await snapshotProfiles(prisma);
    await prisma.profile.deleteMany({
      where: { id: { in: existingProfiles.map((p) => p.id) } },
    });

    const profile = await prisma.profile.create({
      data: {
        slug,
        name: 'E2E Test User',
        description: 'Homo',
        githubUrl: 'https://github.com/test',
        skills: { create: [{ name: 'TypeScript' }, { name: 'GraphQL' }] },
        experience: {
          create: [
            {
              company: 'OpenAI',
              position: 'QA Engineer',
              startDate: new Date('2022-01-01'),
              achievements: ['Shipped the thing'],
            },
          ],
        },
        projects: {
          create: [
            {
              name: 'Digital Business Card',
              url: 'https://example.com/card',
            },
          ],
        },
      },
    });

    profileId = profile.id;
  });

  afterAll(async () => {
    await prisma.profile.delete({ where: { id: profileId } });

    for (const original of existingProfiles) {
      const { skills, experience, projects, ...profileData } = original;
      await prisma.profile.create({
        data: {
          ...profileData,
          skills: {
            create: skills.map(
              ({ id: _id, profileId: _profileId, ...s }) => s,
            ),
          },
          experience: {
            create: experience.map(
              ({ id: _id, profileId: _profileId, ...e }) => e,
            ),
          },
          projects: {
            create: projects.map(
              ({ id: _id, profileId: _profileId, ...p }) => p,
            ),
          },
        },
      });
    }

    await app.close();
  });

  it('returns the profile with its nested skills, experience and projects', async () => {
    const query = `
      query {
        profile {
          id
          name
          description
          githubUrl
          skills {
            name
          }
          experience {
            company
            position
            achievements
          }
          projects {
            name
            url
          }
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);

    expect(response.body.errors).toBeUndefined();

    const { profile } = response.body.data;
    expect(profile.name).toBe('E2E Test User');
    expect(profile.githubUrl).toBe('https://github.com/test');
    expect(profile.skills).toEqual(
      expect.arrayContaining([{ name: 'TypeScript' }, { name: 'GraphQL' }]),
    );
    expect(profile.experience).toEqual([
      {
        company: 'OpenAI',
        position: 'QA Engineer',
        achievements: ['Shipped the thing'],
      },
    ]);
    expect(profile.projects).toEqual([
      { name: 'Digital Business Card', url: 'https://example.com/card' },
    ]);
  });

  it('returns a GraphQL error (not a 500) for a malformed query', async () => {
    const query = `
      query {
        profile {
          doesNotExist
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(400);

    expect(response.body.errors?.[0]?.message).toContain('doesNotExist');
  });
});
