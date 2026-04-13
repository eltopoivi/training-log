import {
  Controller,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { prisma } from '@repo/db';
import type { Prisma } from '@repo/db';
import type { ActivityStreamData } from '@repo/domain';
import { ALL_SPORTS, isSport } from '@repo/domain';
import type { Queue } from 'bullmq';
import { CurrentUser, type RequestUser } from '../../common/current-user.decorator.js';
import { STRAVA_SYNC_QUEUE } from '../../queue/queue.module.js';
import type { StravaSyncJobData } from '../strava/strava-sync.controller.js';

function parseDate(v: string | undefined): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d : undefined;
}

@Controller('activities')
export class ActivitiesController {
  constructor(
    @Inject(STRAVA_SYNC_QUEUE) private readonly queue: Queue<StravaSyncJobData>,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: RequestUser,
    @Query('sport') sport?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') pageRaw?: string,
    @Query('pageSize') pageSizeRaw?: string,
  ) {
    const page = Math.max(1, Number(pageRaw) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(pageSizeRaw) || 20));

    const where: Prisma.ActivityWhereInput = { ownerId: user.id };
    if (sport && sport !== 'all' && isSport(sport)) {
      where.sport = sport;
    }
    const fromD = parseDate(from);
    const toD = parseDate(to);
    if (fromD || toD) {
      where.startedAt = {};
      if (fromD) where.startedAt.gte = fromD;
      if (toD) where.startedAt.lte = toD;
    }

    const [items, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.activity.count({ where }),
    ]);

    return { items, page, pageSize, total, sports: ALL_SPORTS };
  }

  @Get(':id')
  async get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    const a = await prisma.activity.findFirst({ where: { id, ownerId: user.id } });
    if (!a) throw new NotFoundException();
    return a;
  }

  @Get(':id/stream')
  async stream(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    const a = await prisma.activity.findFirst({
      where: { id, ownerId: user.id },
      select: { id: true, stream: true },
    });
    if (!a) throw new NotFoundException();
    if (!a.stream) return { data: {} as ActivityStreamData, sampleRateSec: 1 };
    return { data: a.stream.data as ActivityStreamData, sampleRateSec: a.stream.sampleRateSec };
  }

  @Get(':id/laps')
  async laps(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    const a = await prisma.activity.findFirst({
      where: { id, ownerId: user.id },
      select: { id: true },
    });
    if (!a) throw new NotFoundException();
    return prisma.activityLap.findMany({
      where: { activityId: a.id },
      orderBy: { index: 'asc' },
    });
  }

  @Post(':id/resync')
  @HttpCode(202)
  async resync(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    const a = await prisma.activity.findFirst({
      where: { id, ownerId: user.id },
      select: { externalId: true },
    });
    if (!a) throw new NotFoundException();
    await this.queue.add('sync-strava-activity', {
      ownerId: user.id,
      externalId: a.externalId,
    });
    return { enqueued: true };
  }
}
