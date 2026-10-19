import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextResponse } from 'next/server';

/** Scope the ROUND9 API requires on every token (see apps/api REQUIRED_SCOPE). */
const API_SCOPE = 'round9:play';

export const auth0 = new Auth0Client({
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
    scope: `openid profile email offline_access ${API_SCOPE}`,
  },
  async onCallback(error, ctx) {
    const base = ctx.appBaseUrl ?? process.env.APP_BASE_URL!;
    if (error) {
      const url = new URL('/auth/error', base);
      url.searchParams.set('code', error.code);
      return NextResponse.redirect(url);
    }
    // returnTo is validated as same-origin by the SDK.
    return NextResponse.redirect(new URL(ctx.returnTo ?? '/app', base));
  },
});
