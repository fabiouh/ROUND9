import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, Length } from 'class-validator';
import { AVAILABLE_FORMATS, HOLES_COUNTS, ROUND_STATUSES, type AvailableFormat, type RoundStatus } from '@round9/shared';

export class CreateRoundDto {
  @ApiProperty() @IsString() @Length(2, 80) title: string;
  @ApiProperty() @IsString() courseId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() teeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() crewId?: string;
  @ApiProperty() @IsDateString() scheduledAt: string;
  @ApiProperty({ enum: HOLES_COUNTS }) @IsIn(HOLES_COUNTS) holesCount: 9 | 18;
  @ApiProperty({ enum: AVAILABLE_FORMATS }) @IsIn(AVAILABLE_FORMATS) format: AvailableFormat;
}

export class UpdateRoundDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(2, 80) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() scheduledAt?: string;
  @ApiPropertyOptional({ enum: ROUND_STATUSES }) @IsOptional() @IsIn(ROUND_STATUSES) status?: RoundStatus;
}

export class AddParticipantDto {
  @ApiProperty({ description: 'A user who shares a crew with you' }) @IsString() userId: string;
}
