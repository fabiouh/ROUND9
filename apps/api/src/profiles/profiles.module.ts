import { Body, Controller, Get, Injectable, Module, NotFoundException, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';
import { AVAILABLE_FORMATS, EXPERIENCE_LEVELS, HANDICAP_MAX, HANDICAP_MIN, type AvailableFormat, type ExperienceLevel } from '@round9/shared';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

const emptyToNull = ({ value }: { value: unknown }) => (value === '' ? null : value);

/** Self-reported golf profile. Handicaps are not verified against any federation. */
export class UpdateGolfProfileDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Transform(emptyToNull)
  @ValidateIf((_, v) => v !== null)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(HANDICAP_MIN)
  @Max(HANDICAP_MAX)
  handicapIndex?: number | null;

  @ApiPropertyOptional({ enum: AVAILABLE_FORMATS, nullable: true })
  @IsOptional() @Transform(emptyToNull) @ValidateIf((_, v) => v !== null) @IsIn(AVAILABLE_FORMATS)
  preferredFormat?: AvailableFormat | null;

  @ApiPropertyOptional({ enum: EXPERIENCE_LEVELS, nullable: true })
  @IsOptional() @Transform(emptyToNull) @ValidateIf((_, v) => v !== null) @IsIn(EXPERIENCE_LEVELS)
  experienceLevel?: ExperienceLevel | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional() @Transform(emptyToNull) @ValidateIf((_, v) => v !== null) @IsString()
  homeCourseId?: string | null;
}

@Injectable()
class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  get(user: User) {
    return this.prisma.golfProfile.findUnique({ where: { userId: user.id }, include: { homeCourse: { select: { id: true, name: true } } } });
  }

  async update(user: User, dto: UpdateGolfProfileDto) {
    if (dto.homeCourseId && !(await this.prisma.golfCourse.findUnique({ where: { id: dto.homeCourseId } }))) {
      throw new NotFoundException('Course not found');
    }
    await this.prisma.golfProfile.upsert({ where: { userId: user.id }, create: { userId: user.id, ...dto }, update: dto });
    return this.get(user);
  }
}

@ApiTags('profiles')
@ApiBearerAuth()
@Controller({ path: 'profiles/me/golf', version: '1' })
class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  @Get()
  get(@CurrentUser() user: User) {
    return this.profiles.get(user);
  }

  @Put()
  update(@CurrentUser() user: User, @Body() dto: UpdateGolfProfileDto) {
    return this.profiles.update(user, dto);
  }
}

@Module({ controllers: [ProfilesController], providers: [ProfilesService] })
export class ProfilesModule {}
