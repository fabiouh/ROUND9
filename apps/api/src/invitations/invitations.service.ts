import { ConflictException, ForbiddenException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';
import { FREE_PLAN } from '@round9/shared';
import { createHash, randomBytes } from 'node:crypto';
import { joinRound } from '../common/round-membership.js';
import { env } from '../env.js';
import { PrismaService } from '../prisma/prisma.service.js';

const TTL_DAYS = 14;
const hash = (token: string) => createHash('sha256').update(token).digest('hex');

export type InvitationTarget = { crewId: string } | { roundId: string } | { tournamentId: string };

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns the plaintext token exactly once; only its SHA-256 hash is stored. */
  async create(user: User, target: InvitationTarget, invitedEmail?: string) {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + TTL_DAYS * 864e5);
    await this.prisma.invitation.create({
      data: { ...target, tokenHash: hash(token), invitedEmail: invitedEmail?.toLowerCase(), createdById: user.id, expiresAt },
    });
    return { token, url: `${env.WEB_ORIGIN}/invite/${token}`, expiresAt };
  }

  async preview(token: string) {
    const inv = await this.findUsable(this.prisma, token);
    const [crew, round, tournament] = await Promise.all([
      inv.crewId ? this.prisma.crew.findUnique({ where: { id: inv.crewId }, select: { name: true } }) : null,
      inv.roundId ? this.prisma.round.findUnique({ where: { id: inv.roundId }, select: { title: true, scheduledAt: true } }) : null,
      inv.tournamentId ? this.prisma.tournament.findUnique({ where: { id: inv.tournamentId }, select: { name: true } }) : null,
    ]);
    const invitedBy = await this.prisma.user.findUnique({ where: { id: inv.createdById }, select: { displayName: true } });
    return {
      type: inv.crewId ? 'crew' : inv.roundId ? 'round' : 'tournament',
      name: crew?.name ?? round?.title ?? tournament?.name ?? '',
      scheduledAt: round?.scheduledAt ?? null,
      invitedBy: invitedBy?.displayName ?? null,
      expiresAt: inv.expiresAt,
    };
  }

  /** Single-use: claimed atomically so the same token can't be redeemed twice. */
  accept(user: User, token: string, expected?: InvitationTarget) {
    return this.prisma.$transaction(async (tx) => {
      const inv = await this.findUsable(tx, token);
      if (expected && Object.entries(expected).some(([k, v]) => inv[k as keyof typeof inv] !== v)) {
        throw new NotFoundException('Invitation not found');
      }
      if (inv.invitedEmail && inv.invitedEmail !== user.email?.toLowerCase()) {
        throw new ForbiddenException('Invitation was sent to a different email');
      }
      const claimed = await tx.invitation.updateMany({ where: { id: inv.id, acceptedAt: null }, data: { acceptedAt: new Date() } });
      if (claimed.count !== 1) throw new GoneException('Invitation already used');

      if (inv.crewId) {
        const count = await tx.crewMember.count({ where: { crewId: inv.crewId } });
        if (count >= FREE_PLAN.limits.maxCrewMembers) throw new ConflictException('Crew is full');
        await tx.crewMember.upsert({
          where: { crewId_userId: { crewId: inv.crewId, userId: user.id } },
          create: { crewId: inv.crewId, userId: user.id },
          update: {},
        });
        return { type: 'crew' as const, id: inv.crewId };
      }
      if (inv.roundId) {
        await joinRound(tx, await tx.round.findUniqueOrThrow({ where: { id: inv.roundId } }), user.id);
        return { type: 'round' as const, id: inv.roundId };
      }
      const t = await tx.tournament.findUniqueOrThrow({ where: { id: inv.tournamentId! }, include: { round: true } });
      await joinRound(tx, t.round, user.id);
      return { type: 'tournament' as const, id: t.id };
    });
  }

  private async findUsable(db: Prisma.TransactionClient, token: string) {
    const inv = await db.invitation.findUnique({ where: { tokenHash: hash(token) } });
    if (!inv || inv.revokedAt) throw new NotFoundException('Invitation not found');
    if (inv.acceptedAt) throw new GoneException('Invitation already used');
    if (inv.expiresAt < new Date()) throw new GoneException('Invitation expired');
    return inv;
  }
}
