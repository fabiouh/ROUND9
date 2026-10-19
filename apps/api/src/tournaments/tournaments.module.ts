import { Body, Controller, ForbiddenException, Get, Injectable, Module, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { RoundStatus, User } from '@prisma/client';
import type { TournamentStatus } from '@round9/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { roundVisibleTo } from '../common/access.js';
import { joinRound } from '../common/round-membership.js';
import { CreateInvitationDto } from '../invitations/invitations.dto.js';
import { InvitationsModule } from '../invitations/invitations.module.js';
import { InvitationsService } from '../invitations/invitations.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AddParticipantDto } from '../rounds/rounds.dto.js';
import { RoundsModule } from '../rounds/rounds.module.js';
import { roundSummaryInclude, RoundsService } from '../rounds/rounds.service.js';
import { LeaderboardsModule } from '../scoring/scoring.module.js';
import { LeaderboardsService } from '../scoring/leaderboards.service.js';
import { CreateTournamentDto, UpdateTournamentDto } from './tournaments.dto.js';

const ROUND_STATUS: Record<TournamentStatus, RoundStatus> = {
  UPCOMING: 'SCHEDULED',
  LIVE: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

/** A tournament is visible exactly when its round is. */
@Injectable()
class TournamentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rounds: RoundsService,
    private readonly invitations: InvitationsService,
    private readonly leaderboards: LeaderboardsService,
  ) {}

  async create(user: User, dto: CreateTournamentDto) {
    const { name, description, maxParticipants, ...setup } = dto;
    await this.rounds.validateSetup(user, setup);
    return this.prisma.$transaction(async (tx) => {
      const round = await tx.round.create({ data: { ...setup, title: name, scheduledAt: new Date(setup.scheduledAt), creatorId: user.id } });
      const t = await tx.tournament.create({
        data: { name, description, maxParticipants, organizerId: user.id, crewId: setup.crewId, roundId: round.id },
      });
      await joinRound(tx, round, user.id);
      return t;
    });
  }

  list(user: User) {
    return this.prisma.tournament.findMany({
      where: { round: roundVisibleTo(user.id) },
      orderBy: { round: { scheduledAt: 'desc' } },
      take: 50,
      include: { round: { include: roundSummaryInclude } },
    });
  }

  async get(user: User, id: string) {
    const t = await this.find(user, id);
    const round = await this.rounds.get(user, t.roundId);
    return { ...t, round, canManage: t.organizerId === user.id };
  }

  async update(user: User, id: string, dto: UpdateTournamentDto) {
    const t = await this.requireOrganizer(user, id);
    return this.prisma.$transaction(async (tx) => {
      if (dto.status) await tx.round.update({ where: { id: t.roundId }, data: { status: ROUND_STATUS[dto.status] } });
      return tx.tournament.update({ where: { id }, data: { ...dto, round: dto.name ? { update: { title: dto.name } } : undefined } });
    });
  }

  async leaderboard(user: User, id: string) {
    const t = await this.find(user, id);
    return this.leaderboards.forRound(t.roundId);
  }

  async addParticipant(user: User, id: string, userId: string) {
    const t = await this.requireOrganizer(user, id);
    return this.rounds.addParticipant(user, t.roundId, userId);
  }

  async invite(user: User, id: string, invitedEmail?: string) {
    await this.requireOrganizer(user, id);
    return this.invitations.create(user, { tournamentId: id }, invitedEmail);
  }

  private async find(user: User, id: string) {
    const t = await this.prisma.tournament.findFirst({ where: { id, round: roundVisibleTo(user.id) } });
    if (!t) throw new NotFoundException('Tournament not found');
    return t;
  }

  private async requireOrganizer(user: User, id: string) {
    const t = await this.find(user, id);
    if (t.organizerId !== user.id) throw new ForbiddenException('Only the organizer can do this');
    return t;
  }
}

@ApiTags('tournaments')
@ApiBearerAuth()
@Controller({ path: 'tournaments', version: '1' })
class TournamentsController {
  constructor(private readonly tournaments: TournamentsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateTournamentDto) {
    return this.tournaments.create(user, dto);
  }

  @Get()
  list(@CurrentUser() user: User) {
    return this.tournaments.list(user);
  }

  @Get(':id')
  get(@CurrentUser() user: User, @Param('id') id: string) {
    return this.tournaments.get(user, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateTournamentDto) {
    return this.tournaments.update(user, id, dto);
  }

  @Get(':id/leaderboard')
  leaderboard(@CurrentUser() user: User, @Param('id') id: string) {
    return this.tournaments.leaderboard(user, id);
  }

  @Post(':id/participants')
  addParticipant(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: AddParticipantDto) {
    return this.tournaments.addParticipant(user, id, dto.userId);
  }

  @Post(':id/invitations')
  invite(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: CreateInvitationDto) {
    return this.tournaments.invite(user, id, dto.invitedEmail);
  }
}

@Module({
  imports: [RoundsModule, InvitationsModule, LeaderboardsModule],
  controllers: [TournamentsController],
  providers: [TournamentsService],
})
export class TournamentsModule {}
