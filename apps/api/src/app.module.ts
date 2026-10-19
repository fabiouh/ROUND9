import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AuthGuard } from './auth/auth.guard.js';
import { AuthModule } from './auth/auth.module.js';
import { HttpExceptionFilter } from './common/http-exception.filter.js';
import { ResponseInterceptor } from './common/response.interceptor.js';
import { CoursesModule } from './courses/courses.module.js';
import { CrewsModule } from './crews/crews.module.js';
import { env } from './env.js';
import { HealthModule } from './health/health.module.js';
import { InvitationsModule } from './invitations/invitations.module.js';
import { PrismaModule } from './prisma/prisma.service.js';
import { ProfilesModule } from './profiles/profiles.module.js';
import { RoundsModule } from './rounds/rounds.module.js';
import { LeaderboardsModule, ScoresModule } from './scoring/scoring.module.js';
import { TournamentsModule } from './tournaments/tournaments.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: env.LOG_LEVEL,
        serializers: {
          req: (req: { id: unknown; method: string; url: string }) => ({ id: req.id, method: req.method, url: req.url }),
          res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
        },
        transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty', options: { singleLine: true } } : undefined,
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuthModule,
    HealthModule,
    UsersModule,
    ProfilesModule,
    CrewsModule,
    InvitationsModule,
    CoursesModule,
    RoundsModule,
    TournamentsModule,
    ScoresModule,
    LeaderboardsModule,
  ],
  providers: [
    // Throttle before auth so unauthenticated floods never reach JWKS or the DB.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useExisting: AuthGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
