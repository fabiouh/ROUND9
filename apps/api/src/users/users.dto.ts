import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, Length, Matches, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { USERNAME_PATTERN } from '@round9/shared';

const emptyToNull = ({ value }: { value: unknown }) => (value === '' ? null : value);

export class UpdateMeDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 60) displayName?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @Matches(USERNAME_PATTERN)
  username?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(emptyToNull) @ValidateIf((_, v) => v !== null) @IsUrl({ protocols: ['https'] }) @MaxLength(500) avatarUrl?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(2, 2) country?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(10) onboardingStep?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() onboardingCompleted?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() showHandicapToCrews?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() notifyInvitations?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() notifyScores?: boolean;
}
