import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { prisma } from '@repo/db';
import { exchangeCode } from '@repo/strava';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { randomBytes } from 'node:crypto';
import { CryptoService } from '../../common/crypto.service.js';
import { CurrentUser, type RequestUser } from '../../common/current-user.decorator.js';
import { env } from '../../config/env.js';

const STATE_COOKIE = 'strava_oauth_state';

@Controller('integrations/strava')
export class StravaOAuthController {
  constructor(private readonly crypto: CryptoService) {}

  @Get('connect')
  connect(@Res({ passthrough: false }) res: FastifyReply) {
    const state = randomBytes(16).toString('hex');
    res.setCookie(STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60,
    });
    const params = new URLSearchParams({
      client_id: env.STRAVA_CLIENT_ID,
      redirect_uri: env.STRAVA_REDIRECT_URI,
      response_type: 'code',
      approval_prompt: 'auto',
      scope: 'read,activity:read_all',
      state,
    });
    return res.redirect(`https://www.strava.com/oauth/authorize?${params}`);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Req() req: FastifyRequest,
    @Res({ passthrough: false }) res: FastifyReply,
    @CurrentUser() user: RequestUser,
  ) {
    const cookieState = req.cookies?.[STATE_COOKIE];
    res.clearCookie(STATE_COOKIE, { path: '/' });

    if (error) {
      return res.redirect(`${env.WEB_ORIGIN}/settings?strava=error&reason=${encodeURIComponent(error)}`);
    }
    if (!code || !state || !cookieState || state !== cookieState) {
      return res.redirect(`${env.WEB_ORIGIN}/settings?strava=error&reason=invalid_state`);
    }

    try {
      const tokens = await exchangeCode({
        clientId: env.STRAVA_CLIENT_ID,
        clientSecret: env.STRAVA_CLIENT_SECRET,
        code,
      });

      await prisma.dataSource.upsert({
        where: { userId_type: { userId: user.id, type: 'strava' } },
        create: {
          userId: user.id,
          type: 'strava',
          accessToken: this.crypto.encrypt(tokens.accessToken),
          refreshToken: this.crypto.encrypt(tokens.refreshToken),
          expiresAt: tokens.expiresAt,
          externalUserId: tokens.athleteId ?? null,
        },
        update: {
          accessToken: this.crypto.encrypt(tokens.accessToken),
          refreshToken: this.crypto.encrypt(tokens.refreshToken),
          expiresAt: tokens.expiresAt,
          externalUserId: tokens.athleteId ?? null,
        },
      });

      return res.redirect(`${env.WEB_ORIGIN}/settings?strava=connected`);
    } catch (e) {
      const reason = e instanceof Error ? e.message : 'exchange_failed';
      return res.redirect(`${env.WEB_ORIGIN}/settings?strava=error&reason=${encodeURIComponent(reason)}`);
    }
  }

  @Post('disconnect')
  async disconnect(@CurrentUser() user: RequestUser) {
    await prisma.dataSource.deleteMany({ where: { userId: user.id, type: 'strava' } });
    return { ok: true };
  }

  @Get('status')
  async status(@CurrentUser() user: RequestUser) {
    const ds = await prisma.dataSource.findUnique({
      where: { userId_type: { userId: user.id, type: 'strava' } },
      select: { createdAt: true, externalUserId: true, lastSyncAt: true },
    });
    if (!ds) {
      return { connected: false, connectedSince: null, externalUserId: null, lastSyncAt: null };
    }
    return {
      connected: true,
      connectedSince: ds.createdAt,
      externalUserId: ds.externalUserId,
      lastSyncAt: ds.lastSyncAt,
    };
  }
}
