import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { computeLeaderboard } from '@round9/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import type { UpdateMeDto } from './users.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  me(user: User) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      include: { golfProfile: { include: { homeCourse: { select: { id: true, name: true, city: true } } } } },
    });
  }

  async update(user: User, dto: UpdateMeDto) {
    if (dto.username && dto.username !== user.username) {
      const taken = await this.prisma.user.findUnique({ where: { username: dto.username } });
      if (taken) throw new ConflictException('Username taken');
    }
    if (dto.onboardingCompleted && !(dto.username ?? user.username)) {
      throw new BadRequestException('Username required to finish onboarding');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      // Onboarding never moves backwards, so repeating a step is a no-op.
      data: { ...dto, onboardingStep: dto.onboardingStep === undefined ? undefined : Math.max(dto.onboardingStep, user.onboardingStep) },
    });
    return this.me(user);
  }

  /** shortcut: removes ROUND9 data only; deleting the Auth0 identity needs the Management API (M2M client). */
  async remove(user: User) {
    await this.prisma.user.delete({ where: { id: user.id } });
  }

  async stats(user: User) {
    const rounds = await this.prisma.round.findMany({
      where: { status: 'COMPLETED', participants: { some: { userId: user.id, status: 'JOINED' } }, format: { not: 'MATCH_PLAY' } },
      include: {
        course: { include: { holes: { orderBy: { holeNumber: 'asc' } } } },
        participants: { where: { userId: user.id }, include: { scores: true } },
      },
    });

    let best18: number | null = null;
    let pointsTotal = 0;
    let pointsRounds = 0;
    for (const r of rounds) {
      const p = r.participants[0]!;
      const holes = r.course.holes.slice(0, r.holesCount);
      const strokes = Object.fromEntries(p.scores.map((s) => [s.holeNumber, s.strokes]));
      const row = computeLeaderboard(holes, [{ participantId: p.id, name: '', playingHandicap: p.playingHandicap, strokes }], 'STABLEFORD')[0]!;
      if (!row.complete) continue;
      if (r.holesCount === 18 && row.gross !== null) best18 = best18 === null ? row.gross : Math.min(best18, row.gross);
      pointsTotal += row.points ?? 0;
      pointsRounds++;
    }

    const [tournaments, crews] = await Promise.all([
      this.prisma.tournament.count({ where: { round: { participants: { some: { userId: user.id, status: 'JOINED' } } } } }),
      this.prisma.crewMember.count({ where: { userId: user.id } }),
    ]);

    return {
      roundsCompleted: rounds.length,
      bestGross18: best18,
      averageStablefordPoints: pointsRounds ? Math.round((pointsTotal / pointsRounds) * 10) / 10 : null,
      tournaments,
      crews,
    };
  }
}

