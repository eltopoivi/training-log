import { Controller, Get, Inject } from '@nestjs/common';
import { prisma } from '@repo/db';
import type { HealthStatus } from '@repo/domain';
import { Redis } from 'ioredis';
import { StorageService } from '../../common/storage.module.js';
import { REDIS_CLIENT } from '../../queue/queue.module.js';

@Controller('health')
export class HealthController {
  constructor(
    private readonly storage: StorageService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  @Get()
  async check(): Promise<HealthStatus> {
    const [db, redis, s3] = await Promise.all([this.checkDb(), this.checkRedis(), this.storage.ping()]);
    const allOk = db && redis && s3;
    return {
      status: allOk ? 'ok' : 'degraded',
      services: { db, redis, s3 },
    };
  }

  private async checkDb(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }
}
