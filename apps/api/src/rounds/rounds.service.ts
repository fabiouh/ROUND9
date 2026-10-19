import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';
import { publicUserSelect, requireCrewMember, requireRound, roundVisibleTo, sharesCrew } from '../common/access.js';
import { joinRound } from '../common/round-membership.js';
import { InvitationsService } from '../invitations/invitations.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { LeaderboardsService } from '../scoring/leaderboards.service.js';
import type { CreateRoundDto, UpdateRoundDto } from './rounds.dto.js';

export const roundSummaryInclude = {
  course: { select: { id: true, name: true, city: true } },
  crew: { select: { id: true, name: true } },
  _count: { select: { participants: { where: { status: 'JOINED' } } } },
} satisfies Prisma.RoundInclude;

@Injectable()
export class RoundsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invitations: InvitationsService,
    private readonly leaderboards: LeaderboardsService,
  ) {}

  /** Validates course, tee and crew for a new round. Shared with tournaments. */
  async validateSetup(user: User, dto: Pick<CreateRoundDto, 'courseId' | 'teeId' | 'crewId' | 'holesCount'>) {
    const course = await this.prisma.golfCourse.findUnique({ where: { id: dto.courseId }, include: { _count: { select: { holes: true } } } });
    if (!course) throw new NotFoundException('Course not found');
    if (course._count.holes < dto.holesCount) throw new BadRequestException('Course has fewer holes than the round');
    if (dto.teeId && !(await this.prisma.courseTee.findFirst({ where: { id: dto.teeId, courseId: dto.courseId } }))) {
      throw new BadRequestException('Tee does not belong to course');
    }
    if (dto.crewId) await requireCrewMember(this.prisma, dto.crewId, user.id);
  }

  async create(user: User, dto: CreateRoundDto) {
    await this.validateSetup(user, dto);
    return this.prisma.$transaction(async (tx) => {
      const round = await tx.round.create({ data: { ...dto, scheduledAt: new Date(dto.scheduledAt), creatorId: user.id } });
      await joinRound(tx, round, user.id);
      return round;
    });
  }

  list(user: User, scope: 'upcoming' | 'completed') {
    const upcoming = scope === 'upcoming';
    return this.prisma.round.findMany({
      where: {
        ...roundVisibleTo(user.id),
        tournament: null,
        status: { in: upcoming ? ['SCHEDULED', 'IN_PROGRESS'] : ['COMPLETED', 'CANCELLED'] },
      },
      orderBy: { scheduledAt: upcoming ? 'asc' : 'desc' },
      take: 50,
      include: roundSummaryInclude,
    });
  }

  async get(user: User, id: string) {
    await requireRound(this.prisma, id, user.id);
    const [round, leaderboard] = await Promise.all([
      this.prisma.round.findUniqueOrThrow({
        where: { id },
        include: {
          ...roundSummaryInclude,
          tee: true,
          creator: { select: publicUserSelect },
          tournament: { select: { id: true, name: true } },
          participants: {
            where: { status: 'JOINED' },
            orderBy: { joinedAt: 'asc' },
            include: { user: { select: publicUserSelect }, scores: { select: { holeNumber: true, strokes: true } } },
          },
        },
      }),
      this.leaderboards.forRound(id),
    ]);
    return {
      ...round,
      holes: leaderboard.holes,
      leaderboard: leaderboard.rows,
      myParticipantId: round.participants.find((p) => p.userId === user.id)?.id ?? null,
      canManage: round.creatorId === user.id,
    };
  }

  async update(user: User, id: string, dto: UpdateRoundDto) {
    await this.requireCreator(user, id);
    return this.prisma.round.update({
      where: { id },
      data: { ...dto, scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined },
    });
  }

  async addParticipant(user: User, id: string, userId: string) {
    const round = await this.requireCreator(user, id);
    if (userId !== user.id && !(await sharesCrew(this.prisma, user.id, userId))) {
      throw new ForbiddenException('You can only add golfers from your crews');
    }
    return this.prisma.$transaction((tx) => joinRound(tx, round, userId));
  }

  async removeParticipant(user: User, id: string, participantId: string) {
    const round = await requireRound(this.prisma, id, user.id);
    const p = await this.prisma.roundParticipant.findFirst({ where: { id: participantId, roundId: id } });
    if (!p) throw new NotFoundException('Participant not found');
    if (p.userId !== user.id && round.creatorId !== user.id) throw new ForbiddenException('Only the organizer can remove players');
    await this.prisma.roundParticipant.update({ where: { id: participantId }, data: { status: 'WITHDRAWN' } });
  }

  async invite(user: User, id: string, invitedEmail?: string) {
    await this.requireCreator(user, id);
    return this.invitations.create(user, { roundId: id }, invitedEmail);
  }

  async requireCreator(user: User, id: string) {
    const round = await requireRound(this.prisma, id, user.id);
    if (round.creatorId !== user.id) throw new ForbiddenException('Only the organizer can do this');
    return round;
  }
}
