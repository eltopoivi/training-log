import { Injectable, NestMiddleware } from '@nestjs/common';
import { prisma } from '@repo/db';
import type { FastifyRequest } from 'fastify';
import { env } from '../config/env.js';
import type { RequestUser } from './current-user.decorator.js';

// TODO: reemplazar por Better-Auth al abrir a multi-usuario
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private cachedSeedUserId: string | null = null;

  async use(req: FastifyRequest & { user?: RequestUser }, _res: unknown, next: () => void) {
    const headerId = (req.headers['x-user-id'] as string | undefined) ?? undefined;
    let userId = headerId;

    if (!userId) {
      if (!this.cachedSeedUserId) {
        const seed = await prisma.user.findUnique({
          where: { email: env.SEED_USER_EMAIL },
          select: { id: true },
        });
        if (!seed) {
          throw new Error(
            `Seed user not found (email=${env.SEED_USER_EMAIL}). Run pnpm db:seed.`,
          );
        }
        this.cachedSeedUserId = seed.id;
      }
      userId = this.cachedSeedUserId;
    }

    req.user = { id: userId };
    next();
  }
}
