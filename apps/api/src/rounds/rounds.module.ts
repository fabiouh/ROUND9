import { Body, Controller, Delete, Get, HttpCode, Module, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { CreateInvitationDto } from '../invitations/invitations.dto.js';
import { InvitationsModule } from '../invitations/invitations.module.js';
import { LeaderboardsModule } from '../scoring/scoring.module.js';
import { AddParticipantDto, CreateRoundDto, UpdateRoundDto } from './rounds.dto.js';
import { RoundsService } from './rounds.service.js';

@ApiTags('rounds')
@ApiBearerAuth()
@Controller({ path: 'rounds', version: '1' })
class RoundsController {
  constructor(private readonly rounds: RoundsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateRoundDto) {
    return this.rounds.create(user, dto);
  }

  @Get()
  @ApiQuery({ name: 'scope', enum: ['upcoming', 'completed'], required: false })
  list(@CurrentUser() user: User, @Query('scope') scope?: string) {
    return this.rounds.list(user, scope === 'completed' ? 'completed' : 'upcoming');
  }

  @Get(':id')
  get(@CurrentUser() user: User, @Param('id') id: string) {
    return this.rounds.get(user, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateRoundDto) {
    return this.rounds.update(user, id, dto);
  }

  @Post(':id/participants')
  addParticipant(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: AddParticipantDto) {
    return this.rounds.addParticipant(user, id, dto.userId);
  }

  @Delete(':id/participants/:participantId')
  @HttpCode(204)
  removeParticipant(@CurrentUser() user: User, @Param('id') id: string, @Param('participantId') participantId: string) {
    return this.rounds.removeParticipant(user, id, participantId);
  }

  @Post(':id/invitations')
  invite(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: CreateInvitationDto) {
    return this.rounds.invite(user, id, dto.invitedEmail);
  }
}

@Module({ imports: [InvitationsModule, LeaderboardsModule], controllers: [RoundsController], providers: [RoundsService], exports: [RoundsService] })
export class RoundsModule {}
