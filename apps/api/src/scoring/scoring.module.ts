import { BadRequestException, Body, ConflictException, Controller, ForbiddenException, Get, Injectable, Module, NotFoundException, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, IsString, Max, Min, ValidateIf, ValidateNested } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { requireRound } from '../common/access.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { LeaderboardsService } from './leaderboards.service.js';

class HoleScoreDto {
  @ApiProperty() @IsInt() @Min(1) @Max(18) holeNumber: number;
  @ApiProperty({ nullable: true, description: 'null = picked up' })
  @ValidateIf((_, v) => v !== null) @IsInt() @Min(1) @Max(20)
  strokes: number | null;
}

export class PutScoresDto {
  @ApiProperty() @IsString() participantId: string;
  @ApiProperty({ type: [HoleScoreDto] })
  @IsArray() @ArrayMaxSize(18) @ValidateNested({ each: true }) @Type(() => HoleScoreDto)
  scores: HoleScoreDto[];
}

@Injectable()
class ScoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly leaderboards: LeaderboardsService,
  ) {}

  /** Players keep their own card; the round creator can mark for anyone. */
  async put(user: User, roundId: string, dto: PutScoresDto) {
    const round = await requireRound(this.prisma, roundId, user.id);
    if (round.status === 'COMPLETED' || round.status === 'CANCELLED') throw new ConflictException('Round is closed');
    const participant = await this.prisma.roundParticipant.findFirst({ where: { id: dto.participantId, roundId, status: 'JOINED' } });
    if (!participant) throw new NotFoundException('Participant not found');
    if (participant.userId !== user.id && round.creatorId !== user.id) throw new ForbiddenException('You can only score your own card');
    if (dto.scores.some((s) => s.holeNumber > round.holesCount)) throw new BadRequestException('Hole outside this round');

    await this.prisma.$transaction(async (tx) => {
      for (const s of dto.scores) {
        await tx.holeScore.upsert({
          where: { participantId_holeNumber: { participantId: participant.id, holeNumber: s.holeNumber } },
          create: { roundId, participantId: participant.id, holeNumber: s.holeNumber, strokes: s.strokes },
          update: { strokes: s.strokes },
        });
      }
      if (round.status === 'SCHEDULED') {
        await tx.round.update({ where: { id: roundId }, data: { status: 'IN_PROGRESS' } });
        await tx.tournament.updateMany({ where: { roundId, status: 'UPCOMING' }, data: { status: 'LIVE' } });
      }
    });
    return this.leaderboards.forRound(roundId);
  }

  async leaderboard(user: User, roundId: string) {
    await requireRound(this.prisma, roundId, user.id);
    return this.leaderboards.forRound(roundId);
  }
}

@ApiTags('scores')
@ApiBearerAuth()
@Controller({ path: 'rounds/:id', version: '1' })
class ScoresController {
  constructor(private readonly scores: ScoresService) {}

  @Put('scores')
  put(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: PutScoresDto) {
    return this.scores.put(user, id, dto);
  }

  @Get('leaderboard')
  leaderboard(@CurrentUser() user: User, @Param('id') id: string) {
    return this.scores.leaderboard(user, id);
  }
}

@Module({ providers: [LeaderboardsService], exports: [LeaderboardsService] })
export class LeaderboardsModule {}

@Module({ imports: [LeaderboardsModule], controllers: [ScoresController], providers: [ScoresService] })
export class ScoresModule {}
