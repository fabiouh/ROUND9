import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsUrl, Length, MaxLength, ValidateIf } from 'class-validator';

const emptyToNull = ({ value }: { value: unknown }) => (value === '' ? null : value);

export class CreateCrewDto {
  @ApiProperty() @IsString() @Length(2, 60) name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) description?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(emptyToNull) @ValidateIf((_, v) => v !== null) @IsUrl({ protocols: ['https'] }) @MaxLength(500) avatarUrl?: string | null;
}

export class UpdateCrewDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(2, 60) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) description?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(emptyToNull) @ValidateIf((_, v) => v !== null) @IsUrl({ protocols: ['https'] }) @MaxLength(500) avatarUrl?: string | null;
}

export class UpdateMemberDto {
  @ApiProperty({ enum: ['ADMIN', 'MEMBER'] }) @IsIn(['ADMIN', 'MEMBER']) role: 'ADMIN' | 'MEMBER';
}
