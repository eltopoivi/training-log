import { Controller, Get, HttpCode, Inject, Post, Query, Req } from '@nestjs/common';
import { prisma } from '@repo/db';
import { listActivities } from '@repo/strava';
import type { Queue } from 'bullmq';
import type { FastifyRequest } from 'fastify';
import { STRAVA_SYNC_QUEUE } from '../../queue/queue.module.js';
import { CurrentUser, type RequestUser } from '../../common/current-user.decorator.js';
import { env } from '../../config/env.js';
import { StravaTokenService } from './strava-token.service.js';

export interface StravaSyncJobData {
  ownerId: string;
  externalId: string;
}

@Controller('integrations/strava')
export class StravaSyncController {
  constructor(
    private readonly tokens: StravaTokenService,
    @Inject(STRAVA_SYNC_QUEUE) private readonly queue: Queue<StravaSyncJobData>,
  ) {}

  @Post('sync-now')
  @HttpCode(202)
  async syncNow(@CurrentUser() user: RequestUser) {
    const token = await this.tokens.getValidAccessToken(user.id);
    const activities = await listActivities(token, { perPage: 30 });
    for (const a of activities) {
      await this.queue.add(
        'sync-strava-activity',
        { ownerId: user.id, externalId: String(a.id) },
        { jobId: `manual:${user.id}:${a.id}` },
      );
    }
    return { enqueued: activities.length };
  }

  @Get('webhook')
  webhookVerify(
    @Query('hub.mode') mode: string | undefined,
    @Query('hub.challenge') challenge: string | undefined,
    @Query('hub.verify_token') verifyToken: string | undefined,
  ) {
    if (mode === 'subscribe' && verifyToken === env.STRAVA_VERIFY_TOKEN && challenge) {
      return { 'hub.challenge': challenge };
    }
    return { error: 'invalid_verification' };
  }

  @Post('webhook')
  @HttpCode(200)
  async webhookEvent(@Req() req: FastifyRequest) {
    try {
      const body = req.body as
        | {
            object_type?: string;
            aspect_type?: string;
            object_id?: number | string;
            owner_id?: number | string;
          }
        | undefined;
      if (body?.object_type === 'activity' && body.aspect_type === 'create' && body.object_id) {
        const athleteId = body.owner_id != null ? String(body.owner_id) : null;
        if (athleteId) {
          const ds = await prisma.dataSource.findFirst({
            where: { type: 'strava', externalUserId: athleteId },
            select: { userId: true },
          });
          if (ds) {
            await this.queue.add(
              'sync-strava-activity',
              { ownerId: ds.userId, externalId: String(body.object_id) },
              { jobId: `wh:${ds.userId}:${body.object_id}` },
            );
          }
        }
      }
    } catch {
      // swallow — we always return 200 so Strava doesn't hammer us
    }
    return { ok: true };
  }
}
