import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { env } from './config/env.js';

async function bootstrap() {
  const adapter = new FastifyAdapter({ logger: false, trustProxy: true });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    bufferLogs: true,
  });

  const fastify = app.getHttpAdapter().getInstance();
  await fastify.register(fastifyCookie, { hook: 'onRequest' });

  app.enableCors({
    origin: env.WEB_ORIGIN,
    credentials: true,
  });
  app.setGlobalPrefix('api');

  // pino-based logger (best-effort: if module not configured explicitly,
  // Nest falls back to default — we wire nestjs-pino as the app logger here).
  try {
    app.useLogger(app.get(PinoLogger));
  } catch {
    // PinoLogger provider not configured — use default logger.
  }

  await app.listen(env.API_PORT, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${env.API_PORT}/api`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[api] fatal', err);
  process.exit(1);
});
