import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller.js';

@Module({
  controllers: [ActivitiesController],
})
export class ActivitiesModule {}
