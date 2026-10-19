import { Module } from '@nestjs/common';
import { SkillService } from './skill.service.js';

@Module({
  providers: [SkillService],
  exports: [SkillService],
})
export class SkillModule {}
