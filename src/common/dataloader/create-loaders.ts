import DataLoader from 'dataloader';
import { SkillService } from '../../skill/skill.service.js';
import { ExperienceService } from '../../experience/experience.service.js';
import { ProjectService } from '../../project/project.service.js';
import type { GraphQLContext } from './dataloader.interface.js';

function groupByProfileId<T extends { profileId: string }>(
  profileIds: readonly string[],
  rows: T[],
): T[][] {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const bucket = grouped.get(row.profileId) ?? [];
    bucket.push(row);
    grouped.set(row.profileId, bucket);
  }
  return profileIds.map((id) => grouped.get(id) ?? []);
}

export function createLoaders(
  skillService: SkillService,
  experienceService: ExperienceService,
  projectService: ProjectService,
): GraphQLContext['loaders'] {
  return {
    skillsByProfileId: new DataLoader(async (profileIds) => {
      const rows = await skillService.findManyByProfileIds([...profileIds]);
      return groupByProfileId(profileIds, rows);
    }),
    experienceByProfileId: new DataLoader(async (profileIds) => {
      const rows = await experienceService.findManyByProfileIds([...profileIds]);
      return groupByProfileId(profileIds, rows);
    }),
    projectsByProfileId: new DataLoader(async (profileIds) => {
      const rows = await projectService.findManyByProfileIds([...profileIds]);
      return groupByProfileId(profileIds, rows);
    }),
  };
}
