import { Module } from '@nestjs/common';
import { StravaOAuthController } from './strava-oauth.controller.js';
import { StravaSyncController } from './strava-sync.controller.js';
import { StravaSyncProcessor } from './strava-sync.processor.js';
import { StravaTokenService } from './strava-token.service.js';

@Module({
  controllers: [StravaOAuthController, StravaSyncController],
  providers: [StravaTokenService, StravaSyncProcessor],
  exports: [StravaTokenService],
})
export class StravaModule {}
