import { BadRequestException, Body, Controller, Get, Injectable, Module, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCourseDto } from './courses.dto.js';

/** Courses are shared reference data, readable by every signed-in golfer. */
@Injectable()
class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  list(q?: string) {
    return this.prisma.golfCourse.findMany({
      where: q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { city: { contains: q, mode: 'insensitive' } }] } : undefined,
      orderBy: { name: 'asc' },
      take: 25,
      include: { _count: { select: { holes: true } }, tees: { select: { id: true, name: true } } },
    });
  }

  async get(id: string) {
    const course = await this.prisma.golfCourse.findUnique({
      where: { id },
      include: { tees: { orderBy: { courseRating: 'desc' } }, holes: { orderBy: { holeNumber: 'asc' } } },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  create(user: User, dto: CreateCourseDto) {
    const n = dto.holes.length;
    if (n !== 9 && n !== 18) throw new BadRequestException('A course has 9 or 18 holes');
    const indexes = new Set(dto.holes.map((h) => h.strokeIndex));
    if (indexes.size !== n || [...indexes].some((i) => i > n)) throw new BadRequestException(`Stroke indexes must be 1–${n}, each once`);
    return this.prisma.golfCourse.create({
      data: {
        name: dto.name,
        country: dto.country.toUpperCase(),
        city: dto.city,
        location: dto.location,
        createdById: user.id,
        holes: { create: dto.holes.map((h, i) => ({ ...h, holeNumber: i + 1 })) },
        tees: { create: dto.tees },
      },
      include: { tees: true, holes: true },
    });
  }
}

@ApiTags('courses')
@ApiBearerAuth()
@Controller({ path: 'courses', version: '1' })
class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  @ApiQuery({ name: 'q', required: false })
  list(@Query('q') q?: string) {
    return this.courses.list(q?.slice(0, 80));
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.courses.get(id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateCourseDto) {
    return this.courses.create(user, dto);
  }
}

@Module({ controllers: [CoursesController], providers: [CoursesService] })
export class CoursesModule {}
