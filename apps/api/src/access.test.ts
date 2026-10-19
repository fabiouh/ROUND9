// Integration test against the dev database: proves private data stays private and invitations behave.
import { PrismaClient, type User } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { CrewsService } from './crews/crews.service.js';
import { InvitationsService } from './invitations/invitations.service.js';
import type { PrismaService } from './prisma/prisma.service.js';
import { RoundsService } from './rounds/rounds.service.js';
import { LeaderboardsService } from './scoring/leaderboards.service.js';

const prisma = new PrismaClient() as PrismaService;
const invitations = new InvitationsService(prisma);
const rounds = new RoundsService(prisma, invitations, new LeaderboardsService(prisma));
const crews = new CrewsService(prisma, invitations);

let alice: User, bob: User, carol: User, courseId: string;

beforeAll(async () => {
  const mk = () => prisma.user.create({ data: { auth0Subject: `test|${randomUUID()}`, displayName: 'Test' } });
  [alice, bob, carol] = await Promise.all([mk(), mk(), mk()]);
  const course = await prisma.golfCourse.create({
    data: {
      name: `Test course ${randomUUID()}`,
      country: 'AT',
      holes: { create: Array.from({ length: 9 }, (_, i) => ({ holeNumber: i + 1, par: 4, strokeIndex: i + 1 })) },
    },
  });
  courseId = course.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: { in: [alice.id, bob.id, carol.id] } } });
  await prisma.golfCourse.delete({ where: { id: courseId } });
  await prisma.$disconnect();
});

const newRound = () =>
  rounds.create(alice, { title: 'Sunday nine', courseId, scheduledAt: new Date().toISOString(), holesCount: 9, format: 'STABLEFORD' });

describe('access control', () => {
  it('hides a private round from non-participants', async () => {
    const round = await newRound();
    await expect(rounds.get(bob, round.id)).rejects.toThrow('Round not found');
    expect((await rounds.get(alice, round.id)).canManage).toBe(true);
  });

  it('rejects rounds that ask for more holes than the course has', async () => {
    await expect(
      rounds.create(alice, { title: 'Too long', courseId, scheduledAt: new Date().toISOString(), holesCount: 18, format: 'STROKE_PLAY' }),
    ).rejects.toThrow('fewer holes');
  });

  it('hides a crew from non-members and blocks adding strangers to rounds', async () => {
    const crew = await crews.create(alice, { name: 'Sunday Crew' });
    await expect(crews.get(bob, crew.id)).rejects.toThrow('Crew not found');
    const round = await newRound();
    await expect(rounds.addParticipant(alice, round.id, bob.id)).rejects.toThrow('crews');
  });
});

describe('invitations', () => {
  it('stores only a hash, joins once and cannot be reused', async () => {
    const round = await newRound();
    const { token } = await rounds.invite(alice, round.id);
    expect(await prisma.invitation.count({ where: { tokenHash: token } })).toBe(0);

    await expect(invitations.accept(bob, token)).resolves.toEqual({ type: 'round', id: round.id });
    expect((await rounds.get(bob, round.id)).myParticipantId).not.toBeNull();
    await expect(invitations.accept(carol, token)).rejects.toThrow('already used');
  });

  it('rejects a crew token presented for another crew', async () => {
    const a = await crews.create(alice, { name: 'Crew A' });
    const b = await crews.create(alice, { name: 'Crew B' });
    const { token } = await crews.invite(alice, a.id);
    await expect(crews.join(bob, b.id, token)).rejects.toThrow('Invitation not found');
  });

  it('enforces email-bound invitations', async () => {
    const crew = await crews.create(alice, { name: 'Crew C' });
    const { token } = await crews.invite(alice, crew.id, 'someone@example.com');
    await expect(invitations.accept(bob, token)).rejects.toThrow('different email');
  });
});
