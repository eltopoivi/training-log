import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AuthMiddleware } from './common/auth.middleware.js';
import { env } from './config/env.js';
import { CryptoModule } from './common/crypto.module.js';
import { PrismaModule } from './common/prisma.service.js';
import { StorageModule } from './common/storage.module.js';
import { ActivitiesModule } from './modules/activities/activities.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { StravaModule } from './modules/strava/strava.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { QueueModule } from './queue/queue.module.js';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          env.NODE_ENV === 'development'
            ? { target: 'pino-pretty', options: { singleLine: true, colorize: true } }
            : undefined,
      },
    }),
    PrismaModule,
    CryptoModule,
    StorageModule,
    QueueModule,
    HealthModule,
    UsersModule,
    StravaModule,
    ActivitiesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
