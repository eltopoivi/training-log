import { Injectable, UnauthorizedException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { refreshAccessToken } from '@repo/strava';
import { CryptoService } from '../../common/crypto.service.js';
import { env } from '../../config/env.js';

@Injectable()
export class StravaTokenService {
  constructor(private readonly crypto: CryptoService) {}

  async getValidAccessToken(userId: string): Promise<string> {
    const ds = await prisma.dataSource.findUnique({
      where: { userId_type: { userId, type: 'strava' } },
    });
    if (!ds) throw new UnauthorizedException('Strava not connected');

    const now = Date.now();
    const expiresAtMs = ds.expiresAt ? ds.expiresAt.getTime() : 0;
    if (expiresAtMs > now + 60_000) {
      return this.crypto.decrypt(ds.accessToken);
    }

    const refreshToken = this.crypto.decrypt(ds.refreshToken);
    const fresh = await refreshAccessToken({
      clientId: env.STRAVA_CLIENT_ID,
      clientSecret: env.STRAVA_CLIENT_SECRET,
      refreshToken,
    });

    await prisma.dataSource.update({
      where: { id: ds.id },
      data: {
        accessToken: this.crypto.encrypt(fresh.accessToken),
        refreshToken: this.crypto.encrypt(fresh.refreshToken),
        expiresAt: fresh.expiresAt,
      },
    });

    return fresh.accessToken;
  }
}
