import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const profile = await prisma.profile.upsert({
    where: { slug: 'main' },
    update: {},
    create: {
      slug: 'main',
      name: 'Ваше Имя',
      description:
        'Backend-разработчик, специализируюсь на Node.js, NestJS и GraphQL API.',
      githubUrl: 'https://github.com/your-username',
      linkedinUrl: 'https://linkedin.com/in/your-profile',
    },
  });

  await prisma.skill.createMany({
    data: [
      { profileId: profile.id, name: 'TypeScript' },
      { profileId: profile.id, name: 'Node.js' },
      { profileId: profile.id, name: 'NestJS' },
      { profileId: profile.id, name: 'GraphQL' },
      { profileId: profile.id, name: 'PostgreSQL' },
      { profileId: profile.id, name: 'Docker' },
    ],
    skipDuplicates: true,
  });

  await prisma.experience.createMany({
    data: [
      {
        profileId: profile.id,
        company: 'ООО «Ромашка»',
        position: 'Backend-разработчик',
        startDate: new Date('2023-01-01'),
        endDate: null,
        achievements: [
          'Спроектировал и внедрил GraphQL API на NestJS',
          'Сократил время ответа ключевых запросов на 40% за счёт оптимизации выборок из БД',
        ],
      },
    ],
  });

  await prisma.project.createMany({
    data: [
      {
        profileId: profile.id,
        name: 'Digital Business Card',
        description: 'GraphQL-визитка на NestJS, Prisma и PostgreSQL',
        url: 'https://github.com/your-username/digital-business-card',
      },
    ],
  });

  console.log(`Seed completed for profile: ${profile.name}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
