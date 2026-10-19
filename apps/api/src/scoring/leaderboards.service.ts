import { Injectable } from '@nestjs/common';
import { computeLeaderboard, type AvailableFormat } from '@round9/shared';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class LeaderboardsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Caller must have checked access to the round. */
  async forRound(roundId: string) {
    const round = await this.prisma.round.findUniqueOrThrow({
      where: { id: roundId },
      include: {
        course: { include: { holes: { orderBy: { holeNumber: 'asc' } } } },
        participants: { where: { status: 'JOINED' }, include: { user: { select: { displayName: true, username: true } }, scores: true } },
      },
    });
    // shortcut: 9-hole rounds on 18-hole courses always play the front nine; add a startHole column for back-nine rounds.
    const holes = round.course.holes.slice(0, round.holesCount);
    if (round.format === 'MATCH_PLAY') return { format: round.format, holes, rows: [] };
    const rows = computeLeaderboard(
      holes,
      round.participants.map((p) => ({
        participantId: p.id,
        name: p.user.displayName ?? p.user.username ?? '—',
        playingHandicap: p.playingHandicap,
        strokes: Object.fromEntries(p.scores.map((s) => [s.holeNumber, s.strokes])),
      })),
      round.format as AvailableFormat,
    );
    return { format: round.format, holes, rows };
  }
}
