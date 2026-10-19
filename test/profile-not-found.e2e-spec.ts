import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('GraphQL /graphql - profile not found (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const prismaStub = {
      profile: { findFirst: vi.fn().mockResolvedValue(null) },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaStub)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a GraphQL error instead of crashing when no profile exists', async () => {
    const query = `
      query {
        profile {
          id
          name
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].message).toMatch(/profile is not found/i);
  });
});
