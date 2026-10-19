import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { CrewRole, Prisma, PrismaClient } from '@prisma/client';

type Db = PrismaClient | Prisma.TransactionClient;

/** Returns the caller's membership or throws 404 so private crews stay unguessable. */
export async function requireCrewMember(db: Db, crewId: string, userId: string, roles?: CrewRole[]) {
  const member = await db.crewMember.findUnique({ where: { crewId_userId: { crewId, userId } } });
  if (!member) throw new NotFoundException('Crew not found');
  if (roles && !roles.includes(member.role)) throw new ForbiddenException('Insufficient crew role');
  return member;
}

/** A round is visible to its creator, its participants and members of its crew. 404 otherwise. */
export function roundVisibleTo(userId: string): Prisma.RoundWhereInput {
  return {
    OR: [
      { creatorId: userId },
      { participants: { some: { userId, status: 'JOINED' } } },
      { crew: { members: { some: { userId } } } },
    ],
  };
}

export async function requireRound(db: Db, roundId: string, userId: string) {
  const round = await db.round.findFirst({ where: { id: roundId, ...roundVisibleTo(userId) } });
  if (!round) throw new NotFoundException('Round not found');
  return round;
}

export async function sharesCrew(db: Db, a: string, b: string) {
  const count = await db.crewMember.count({ where: { userId: a, crew: { members: { some: { userId: b } } } } });
  return count > 0;
}

export const publicUserSelect = { id: true, displayName: true, username: true, avatarUrl: true } as const;
