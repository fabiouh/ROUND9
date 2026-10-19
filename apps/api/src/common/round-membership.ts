import { ConflictException } from '@nestjs/common';
import type { Prisma, Round } from '@prisma/client';
import { courseHandicap, playingHandicap, type HolesCount } from '@round9/shared';

/** Adds (or re-activates) a participant and snapshots their playing handicap for this round. */
export async function joinRound(db: Prisma.TransactionClient, round: Round, userId: string) {
  if (round.status === 'COMPLETED' || round.status === 'CANCELLED') throw new ConflictException('Round is closed');

  // Tournament rounds enforce the tournament's participant limit on every join path.
  // shortcut: count-then-insert can overshoot by one under concurrent joins; lock the tournament row if limits become billable.
  const tournament = await db.tournament.findUnique({ where: { roundId: round.id }, select: { maxParticipants: true } });
  if (tournament) {
    const joined = await db.roundParticipant.count({ where: { roundId: round.id, status: 'JOINED', NOT: { userId } } });
    if (joined >= tournament.maxParticipants) throw new ConflictException('Participant limit reached');
  }

  const playingHcp = await computePlayingHandicap(db, round, userId);
  return db.roundParticipant.upsert({
    where: { roundId_userId: { roundId: round.id, userId } },
    create: { roundId: round.id, userId, playingHandicap: playingHcp },
    update: { status: 'JOINED', playingHandicap: playingHcp },
  });
}

async function computePlayingHandicap(db: Prisma.TransactionClient, round: Round, userId: string) {
  if (!round.teeId) return null;
  const [profile, tee, holes] = await Promise.all([
    db.golfProfile.findUnique({ where: { userId } }),
    db.courseTee.findUnique({ where: { id: round.teeId } }),
    db.golfHole.findMany({ where: { courseId: round.courseId, holeNumber: { lte: round.holesCount } } }),
  ]);
  if (profile?.handicapIndex == null || !tee) return null;
  const par = holes.reduce((s, h) => s + h.par, 0);
  const ch = courseHandicap(
    Number(profile.handicapIndex),
    { courseRating: Number(tee.courseRating), slopeRating: tee.slopeRating, par },
    round.holesCount as HolesCount,
    par,
  );
  return playingHandicap(ch, round.format);
}
