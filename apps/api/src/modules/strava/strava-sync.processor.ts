import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { prisma } from '@repo/db';
import {
  StravaApiError,
  getActivity,
  getLaps,
  getStreams,
  mapLaps,
  mapStravaActivity,
  mapStreams,
} from '@repo/strava';
import { UnrecoverableError, Worker } from 'bullmq';
import type { Redis } from 'ioredis';
import { REDIS_CLIENT, STRAVA_SYNC_QUEUE_NAME } from '../../queue/queue.module.js';
import { StravaTokenService } from './strava-token.service.js';
import type { StravaSyncJobData } from './strava-sync.controller.js';

@Injectable()
export class StravaSyncProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('StravaSyncProcessor');
  private worker: Worker<StravaSyncJobData> | null = null;

  constructor(
    private readonly tokens: StravaTokenService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  onModuleInit(): void {
    this.worker = new Worker<StravaSyncJobData>(
      STRAVA_SYNC_QUEUE_NAME,
      async (job) => this.process(job.data),
      {
        connection: this.redis,
        concurrency: 2,
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(
        `job ${job?.id} failed attempt=${job?.attemptsMade}: ${err.message}`,
      );
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }

  private async process(data: StravaSyncJobData): Promise<void> {
    const { ownerId, externalId } = data;
    const start = Date.now();

    let token: string;
    try {
      token = await this.tokens.getValidAccessToken(ownerId);
    } catch (e) {
      this.logger.warn(
        `strava_token_invalid owner=${ownerId} external=${externalId} reason=${
          e instanceof Error ? e.message : 'unknown'
        }`,
      );
      throw new UnrecoverableError('no valid strava token');
    }

    const ds = await prisma.dataSource.findUnique({
      where: { userId_type: { userId: ownerId, type: 'strava' } },
      select: { id: true },
    });
    if (!ds) throw new UnrecoverableError('Strava DataSource missing');

    try {
      const stage = { v: 'activity' as string };
      const t1 = Date.now();
      const raw = await getActivity(token, externalId);
      this.logStage(externalId, stage.v, Date.now() - t1);

      const input = mapStravaActivity(raw, ds.id, ownerId);
      const activity = await prisma.activity.upsert({
        where: { sourceId_externalId: { sourceId: ds.id, externalId: input.externalId } },
        create: input,
        update: { ...input, updatedAt: new Date() },
      });

      stage.v = 'streams';
      const t2 = Date.now();
      const streamsRaw = await getStreams(token, externalId);
      const streams = mapStreams(streamsRaw);
      await prisma.activityStream.upsert({
        where: { activityId: activity.id },
        create: {
          activityId: activity.id,
          data: streams,
          sampleRateSec: 1,
        },
        update: { data: streams, sampleRateSec: 1 },
      });
      this.logStage(externalId, stage.v, Date.now() - t2);

      stage.v = 'laps';
      const t3 = Date.now();
      try {
        const lapsRaw = await getLaps(token, externalId);
        const laps = mapLaps(lapsRaw);
        await prisma.$transaction([
          prisma.activityLap.deleteMany({ where: { activityId: activity.id } }),
          prisma.activityLap.createMany({
            data: laps.map((l) => ({ ...l, activityId: activity.id })),
          }),
        ]);
      } catch (e) {
        // Some activities (e.g. gym) may not have laps — log and skip.
        this.logger.warn(
          `laps_failed activity=${externalId} reason=${e instanceof Error ? e.message : 'unknown'}`,
        );
      }
      this.logStage(externalId, stage.v, Date.now() - t3);

      await prisma.dataSource.update({
        where: { id: ds.id },
        data: { lastSyncAt: new Date() },
      });

      this.logger.log(
        `synced activity=${activity.id} external=${externalId} duration_ms=${Date.now() - start}`,
      );
    } catch (err) {
      if (err instanceof StravaApiError) {
        if (err.status === 401) {
          this.logger.warn(`strava_token_invalid owner=${ownerId} external=${externalId}`);
          throw new UnrecoverableError('strava 401');
        }
        if (err.status === 429 && err.retryAfter) {
          // BullMQ doesn't honor a per-throw delay; we rethrow normally so the
          // exponential backoff kicks in. Log the suggested retry window.
          this.logger.warn(
            `strava_429 owner=${ownerId} external=${externalId} retry_after=${err.retryAfter}s`,
          );
        }
      }
      throw err;
    }
  }

  private logStage(externalId: string, stage: string, ms: number): void {
    this.logger.debug(`stage=${stage} activity=${externalId} duration_ms=${ms}`);
  }
}
