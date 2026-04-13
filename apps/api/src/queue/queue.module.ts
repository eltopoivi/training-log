import { Global, Module } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '../config/env.js';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');
export const STRAVA_SYNC_QUEUE = Symbol('STRAVA_SYNC_QUEUE');
export const STRAVA_SYNC_QUEUE_NAME = 'strava-sync';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => new Redis(env.REDIS_URL, { maxRetriesPerRequest: null }),
    },
    {
      provide: STRAVA_SYNC_QUEUE,
      useFactory: (redis: Redis) =>
        new Queue(STRAVA_SYNC_QUEUE_NAME, {
          connection: redis,
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: { count: 100 },
            removeOnFail: { count: 100 },
          },
        }),
      inject: [REDIS_CLIENT],
    },
  ],
  exports: [REDIS_CLIENT, STRAVA_SYNC_QUEUE],
})
export class QueueModule {}
