import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Length, Max, MaxLength, Min } from 'class-validator';
import { FREE_PLAN, TOURNAMENT_STATUSES, type TournamentStatus } from '@round9/shared';
import { CreateRoundDto } from '../rounds/rounds.dto.js';

export class CreateTournamentDto extends OmitType(CreateRoundDto, ['title'] as const) {
  @ApiProperty() @IsString() @Length(2, 80) name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @ApiProperty({ maximum: FREE_PLAN.limits.maxTournamentPlayers })
  @IsInt() @Min(2) @Max(FREE_PLAN.limits.maxTournamentPlayers)
  maxParticipants: number;
}

export class UpdateTournamentDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(2, 80) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @ApiPropertyOptional({ enum: TOURNAMENT_STATUSES }) @IsOptional() @IsIn(TOURNAMENT_STATUSES) status?: TournamentStatus;
}
