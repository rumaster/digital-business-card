import { createLoaders } from './create-loaders.js';
import type { SkillService } from '../../skill/skill.service.js';
import type { ExperienceService } from '../../experience/experience.service.js';
import type { ProjectService } from '../../project/project.service.js';

function makeServices() {
  const skillService = {
    findManyByProfileIds: vi.fn(),
  } as unknown as SkillService;

  const experienceService = {
    findManyByProfileIds: vi.fn(),
  } as unknown as ExperienceService;

  const projectService = {
    findManyByProfileIds: vi.fn(),
  } as unknown as ProjectService;

  return { skillService, experienceService, projectService };
}

describe('createLoaders', () => {
  it('batches concurrent .load() calls into a single service call (no N+1)', async () => {
    const { skillService, experienceService, projectService } =
      makeServices();
    vi.mocked(skillService.findManyByProfileIds).mockResolvedValue([
      { id: 's1', name: 'TypeScript', profileId: 'p1' },
      { id: 's2', name: 'GraphQL', profileId: 'p2' },
    ]);

    const loaders = createLoaders(
      skillService,
      experienceService,
      projectService,
    );

    await Promise.all([
      loaders.skillsByProfileId.load('p1'),
      loaders.skillsByProfileId.load('p2'),
      loaders.skillsByProfileId.load('p3'),
    ]);

    expect(skillService.findManyByProfileIds).toHaveBeenCalledTimes(1);
    expect(skillService.findManyByProfileIds).toHaveBeenCalledWith([
      'p1',
      'p2',
      'p3',
    ]);
  });

  it('groups rows by profileId and preserves the key order/shape', async () => {
    const { skillService, experienceService, projectService } =
      makeServices();

    vi.mocked(skillService.findManyByProfileIds).mockResolvedValue([
      { id: 's2', name: 'GraphQL', profileId: 'p2' },
      { id: 's1', name: 'TypeScript', profileId: 'p1' },
      { id: 's1b', name: 'NestJS', profileId: 'p1' },

    ]);

    const loaders = createLoaders(
      skillService,
      experienceService,
      projectService,
    );

    const [p1Skills, p2Skills, p3Skills] = await Promise.all([
      loaders.skillsByProfileId.load('p1'),
      loaders.skillsByProfileId.load('p2'),
      loaders.skillsByProfileId.load('p3'),
    ]);

    expect(p1Skills).toEqual([
      { id: 's1', name: 'TypeScript', profileId: 'p1' },
      { id: 's1b', name: 'NestJS', profileId: 'p1' },
    ]);

    expect(p2Skills).toEqual([
      { id: 's2', name: 'GraphQL', profileId: 'p2' },
    ]);

    expect(p3Skills).toEqual([]);
  });

  it('keeps each entity type on its own loader and service', async () => {
    const { skillService, experienceService, projectService } =
      makeServices();
    vi.mocked(skillService.findManyByProfileIds).mockResolvedValue([]);
    vi.mocked(experienceService.findManyByProfileIds).mockResolvedValue([]);
    vi.mocked(projectService.findManyByProfileIds).mockResolvedValue([]);

    const loaders = createLoaders(
      skillService,
      experienceService,
      projectService,
    );

    await Promise.all([
      loaders.skillsByProfileId.load('p1'),
      loaders.experienceByProfileId.load('p1'),
      loaders.projectsByProfileId.load('p1'),
    ]);

    expect(skillService.findManyByProfileIds).toHaveBeenCalledTimes(1);
    expect(experienceService.findManyByProfileIds).toHaveBeenCalledTimes(1);
    expect(projectService.findManyByProfileIds).toHaveBeenCalledTimes(1);
    expect(experienceService.findManyByProfileIds).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
    );
  });

  it('caches repeated loads for the same key within one request', async () => {
    const { skillService, experienceService, projectService } =
      makeServices();
    vi.mocked(skillService.findManyByProfileIds).mockResolvedValue([]);

    const loaders = createLoaders(
      skillService,
      experienceService,
      projectService,
    );

    await loaders.skillsByProfileId.load('p1');
    await loaders.skillsByProfileId.load('p1');

    expect(skillService.findManyByProfileIds).toHaveBeenCalledTimes(1);
  });

  it('returns a fresh set of loaders (and cache) on every call', () => {
    const { skillService, experienceService, projectService } =
      makeServices();

    const first = createLoaders(skillService, experienceService, projectService);
    const second = createLoaders(
      skillService,
      experienceService,
      projectService,
    );

    expect(first.skillsByProfileId).not.toBe(second.skillsByProfileId);
  });
});