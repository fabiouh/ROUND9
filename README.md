# ROUND9

Golf is better together. Private rounds, crews, tournaments and live scoring for golfers who play together.

```
apps/web        Next.js 16 (App Router) · Tailwind 4 · next-intl (de/en) · Auth0 · TanStack Query · R3F
apps/api        NestJS 12 · Prisma 6 · PostgreSQL · Auth0 JWT validation · Swagger
packages/shared Scoring + handicap logic, pricing config, zod form schemas (used by web and api)
packages/config Shared tsconfig
```

## Quick start

```bash
pnpm install
pnpm db:up                                  # Postgres 17 on localhost:5433
cp apps/api/.env.example apps/api/.env      # fill AUTH0_* (see below)
cp apps/web/.env.example apps/web/.env.local
pnpm db:migrate                             # apply migrations
pnpm db:seed                                # optional: one clearly fictional demo course
pnpm dev                                    # web :3000, api :4000, Swagger at :4000/api/docs
```

Tests: `pnpm test` (scoring unit tests, API access-control integration tests against the dev DB, de/en message parity).

## Auth0 setup

1. **API**: create an API with identifier = `AUTH0_AUDIENCE` (e.g. `https://api.round9.app`), signing RS256.
   Add the permission **`round9:play`**. Every API endpoint except `/health` requires it.
2. **Application** (Regular Web Application):
   - Allowed Callback URLs: `http://localhost:3000/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
   - Grant the application access to the API with the `round9:play` scope (APIs → Machine/User access), so user tokens carry it.
   - Enable a refresh-token grant (the web app requests `offline_access`).
3. **Connections**: Username-Password (with email verification), Google, and Apple if configured.
   Set `AUTH0_SOCIAL_CONNECTIONS=google-oauth2,apple` in `apps/web/.env.local` to show the matching sign-up buttons.

Passwords never touch ROUND9: login and signup go through Auth0 Universal Login. The browser never sees an access
token either: it calls `/api/r9/*`, a server route that attaches the session's token and forwards to the API. The API
verifies signature, issuer, audience, expiry and scope, and derives the user from the token subject (`auth0Subject`).

## What's implemented

- Landing page (de/en) with a Three.js hero (dimpled ball, shadow-mapped light, pointer parallax, offscreen pause,
  DPR cap) plus a static SVG fallback for reduced motion, low-power devices and missing WebGL.
- Login/signup entry pages, `/auth/error`, and a resumable 5-step onboarding stored in Postgres.
- App shell (sidebar / bottom nav), dashboard, rounds, tournaments, crews, leaderboards, profile, settings,
  invite acceptance (`/invite/[token]`), and adding courses with hole/tee data.
- Scoring: **stroke play** (gross/net) and **Stableford** using WHS course handicap and 95% allowance, with stroke
  allocation by stroke index and plus-handicap support. Match play and flights are shown as *upcoming*.
- Invitations: 32-byte random tokens, stored as SHA-256 only, single-use (atomic claim), 14-day expiry, optional
  email binding, exactly one target (DB `CHECK` constraint).
- Privacy: rounds, crews, tournaments and scorecards return 404 to anyone who isn't creator, participant or crew member.
  Crew handicaps are shown only with the member's consent.
- Pricing is configuration in `packages/shared/src/pricing.ts`. Only the Free plan is available; Plus/Crew are
  labelled "coming soon". The Free plan's 8-player tournament limit is enforced by the API.

## Known gaps (also marked `shortcut:` in code)

- Photography is placeholder: every `PhotoSlot` is labelled until licensed images are supplied.
- Legal pages are drafts with bracketed placeholders for the operator's details.
- Account deletion removes ROUND9 data; deleting the Auth0 identity needs a Management API client.
- Avatars are https links (no upload storage yet).
- 9-hole rounds play the front nine and derive 9-hole ratings from 18-hole tee values.
- Email notifications are not sent yet; the preferences are stored for later.
