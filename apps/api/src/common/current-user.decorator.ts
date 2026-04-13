import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

export interface RequestUser {
  id: string;
}

export const CurrentUser = createParamDecorator((_data, ctx: ExecutionContext): RequestUser => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest & { user?: RequestUser }>();
  if (!req.user) {
    throw new Error('No user on request — auth middleware did not run');
  }
  return req.user;
});
