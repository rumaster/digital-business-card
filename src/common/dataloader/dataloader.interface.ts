import type DataLoader from 'dataloader';
import type { Skill } from '../../skill/models/skill.model.js';
import type { Experience } from '../../experience/models/experience.model.js';
import type { Project } from '../../project/models/project.model.js';

export interface GraphQLContext {
  loaders: {
    skillsByProfileId: DataLoader<string, Skill[]>;
    experienceByProfileId: DataLoader<string, Experience[]>;
    projectsByProfileId: DataLoader<string, Project[]>;
  };
}
