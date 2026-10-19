import { Module } from '@nestjs/common';
import { ExperienceService } from './experience.service.js';

@Module({
  providers: [ExperienceService],
  exports: [ExperienceService],
})
export class ExperienceModule {}
