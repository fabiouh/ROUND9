import { Injectable, Logger, SetMetadata, UnauthorizedException, ForbiddenException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { User } from '@prisma/client';
import type { Request } from 'express';
import { createRemoteJWKSet, errors, jwtVerify, type JWTPayload } from 'jose';
import { env } from '../env.js';
import { PrismaService } from '../prisma/prisma.service.js';

/** Scope every ROUND9 app token must carry. Define it as a permission on the Auth0 API. */
export const REQUIRED_SCOPE = 'round9:play';

export const IS_PUBLIC = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true);

export interface AuthedRequest extends Request {
  user: User;
}

const jwks = createRemoteJWKSet(new URL('.well-known/jwks.json', env.AUTH0_ISSUER_BASE_URL));

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [ctx.getHandler(), ctx.getClass()])) return true;

    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) throw new UnauthorizedException('Missing bearer token');

    let payload: JWTPayload & { scope?: string; permissions?: string[] };
    try {
      // Verifies signature (RS256 via JWKS), issuer, audience, exp and nbf.
      ({ payload } = await jwtVerify(token, jwks, {
        issuer: env.AUTH0_ISSUER_BASE_URL,
        audience: env.AUTH0_AUDIENCE,
        algorithms: ['RS256'],
      }));
    } catch (e) {
      if (!(e instanceof errors.JOSEError)) throw e;
      throw new UnauthorizedException('Invalid token');
    }

    const granted = new Set([...(payload.scope?.split(' ') ?? []), ...(payload.permissions ?? [])]);
    if (!granted.has(REQUIRED_SCOPE)) throw new ForbiddenException('Missing required scope');
    if (!payload.sub) throw new UnauthorizedException('Invalid token');

    req.user = await this.provision(payload.sub, token);
    return true;
  }

  /** Users are created from the verified token subject on first request. */
  private async provision(sub: string, token: string) {
    const existing = await this.prisma.user.findUnique({ where: { auth0Subject: sub } });
    if (existing) return existing;

    const info = await this.userInfo(token);
    return this.prisma.user.upsert({
      where: { auth0Subject: sub },
      create: {
        auth0Subject: sub,
        email: info?.email_verified ? info.email : null,
        displayName: info?.name && info.name !== info.email ? info.name : null,
        avatarUrl: info?.picture ?? null,
      },
      update: {},
    });
  }

  private async userInfo(token: string) {
    try {
      const res = await fetch(new URL('userinfo', env.AUTH0_ISSUER_BASE_URL), { headers: { authorization: `Bearer ${token}` } });
      if (!res.ok) return null;
      return (await res.json()) as { email?: string; email_verified?: boolean; name?: string; picture?: string };
    } catch (e) {
      this.logger.warn(`userinfo failed: ${String(e)}`);
      return null;
    }
  }
}
