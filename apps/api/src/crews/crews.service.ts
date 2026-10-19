import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { publicUserSelect, requireCrewMember } from '../common/access.js';
import { InvitationsService } from '../invitations/invitations.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateCrewDto, UpdateCrewDto } from './crews.dto.js';

const slugify = (s: string) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

@Injectable()
export class CrewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invitations: InvitationsService,
  ) {}

  create(user: User, dto: CreateCrewDto) {
    return this.prisma.crew.create({
      data: {
        ...dto,
        slug: `${slugify(dto.name) || 'crew'}-${randomBytes(3).toString('hex')}`,
        ownerId: user.id,
        members: { create: { userId: user.id, role: 'OWNER' } },
      },
    });
  }

  async list(user: User) {
    const memberships = await this.prisma.crewMember.findMany({
      where: { userId: user.id },
      orderBy: { joinedAt: 'desc' },
      include: { crew: { include: { _count: { select: { members: true, rounds: true, tournaments: true } } } } },
    });
    return memberships.map(({ crew, role }) => ({ ...crew, myRole: role }));
  }

  async get(user: User, id: string) {
    const me = await requireCrewMember(this.prisma, id, user.id);
    const crew = await this.prisma.crew.findUniqueOrThrow({
      where: { id },
      include: {
        members: {
          orderBy: { joinedAt: 'asc' },
          include: { user: { select: { ...publicUserSelect, showHandicapToCrews: true, golfProfile: { select: { handicapIndex: true } } } } },
        },
        rounds: {
          where: { tournament: null },
          orderBy: { scheduledAt: 'desc' },
          take: 20,
          include: { course: { select: { id: true, name: true, city: true } }, _count: { select: { participants: { where: { status: 'JOINED' } } } } },
        },
        tournaments: { orderBy: { createdAt: 'desc' }, take: 20, include: { round: { select: { scheduledAt: true } } } },
      },
    });
    // Handicaps are shared with crew mates only when the member allows it.
    const members = crew.members.map(({ user: { showHandicapToCrews, golfProfile, ...user }, ...m }) => ({
      ...m,
      user,
      handicapIndex: showHandicapToCrews ? (golfProfile?.handicapIndex ?? null) : null,
    }));
    return { ...crew, members, myRole: me.role };
  }

  async update(user: User, id: string, dto: UpdateCrewDto) {
    await requireCrewMember(this.prisma, id, user.id, ['OWNER', 'ADMIN']);
    return this.prisma.crew.update({ where: { id }, data: dto });
  }

  async remove(user: User, id: string) {
    await requireCrewMember(this.prisma, id, user.id, ['OWNER']);
    await this.prisma.crew.delete({ where: { id } });
  }

  async invite(user: User, id: string, invitedEmail?: string) {
    await requireCrewMember(this.prisma, id, user.id, ['OWNER', 'ADMIN']);
    return this.invitations.create(user, { crewId: id }, invitedEmail);
  }

  join(user: User, id: string, token: string) {
    return this.invitations.accept(user, token, { crewId: id });
  }

  async updateMember(user: User, crewId: string, memberId: string, role: 'ADMIN' | 'MEMBER') {
    await requireCrewMember(this.prisma, crewId, user.id, ['OWNER']);
    const target = await this.findMember(crewId, memberId);
    if (target.role === 'OWNER') throw new BadRequestException('Owner role cannot change');
    return this.prisma.crewMember.update({ where: { id: memberId }, data: { role } });
  }

  /** Admins remove members, owners remove anyone but themselves, everyone may leave. */
  async removeMember(user: User, crewId: string, memberId: string) {
    const me = await requireCrewMember(this.prisma, crewId, user.id);
    const target = await this.findMember(crewId, memberId);
    if (target.role === 'OWNER') throw new BadRequestException('The owner cannot leave; delete the crew instead');
    const self = target.userId === user.id;
    const allowed = self || me.role === 'OWNER' || (me.role === 'ADMIN' && target.role === 'MEMBER');
    if (!allowed) throw new ForbiddenException('Insufficient crew role');
    await this.prisma.crewMember.delete({ where: { id: memberId } });
  }

  private async findMember(crewId: string, memberId: string) {
    const m = await this.prisma.crewMember.findFirst({ where: { id: memberId, crewId } });
    if (!m) throw new NotFoundException('Member not found');
    return m;
  }
}
