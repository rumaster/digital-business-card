import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Skill } from '../../skill/models/skill.model.js';
import { Experience } from '../../experience/models/experience.model.js';
import { Project } from '../../project/models/project.model.js';

@ObjectType()
export class Profile {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field(() => String,{ nullable: true })
  githubUrl?: string | null;

  @Field(() => String,{ nullable: true })
  linkedinUrl?: string | null;

  @Field(() => String,{ nullable: true })
  websiteUrl?: string | null;

  @Field(() => [Skill])
  skills!: Skill[];

  @Field(() => [Experience])
  experience!: Experience[];

  @Field(() => [Project])
  projects!: Project[];
}
