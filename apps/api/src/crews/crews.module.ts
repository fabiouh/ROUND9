import { Body, Controller, Delete, Get, HttpCode, Module, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { CreateInvitationDto, TokenDto } from '../invitations/invitations.dto.js';
import { InvitationsModule } from '../invitations/invitations.module.js';
import { CreateCrewDto, UpdateCrewDto, UpdateMemberDto } from './crews.dto.js';
import { CrewsService } from './crews.service.js';

@ApiTags('crews')
@ApiBearerAuth()
@Controller({ path: 'crews', version: '1' })
class CrewsController {
  constructor(private readonly crews: CrewsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateCrewDto) {
    return this.crews.create(user, dto);
  }

  @Get()
  list(@CurrentUser() user: User) {
    return this.crews.list(user);
  }

  @Get(':id')
  get(@CurrentUser() user: User, @Param('id') id: string) {
    return this.crews.get(user, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateCrewDto) {
    return this.crews.update(user, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.crews.remove(user, id);
  }

  @Post(':id/invitations')
  invite(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: CreateInvitationDto) {
    return this.crews.invite(user, id, dto.invitedEmail);
  }

  @Post(':id/join')
  @HttpCode(200)
  join(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: TokenDto) {
    return this.crews.join(user, id, dto.token);
  }

  @Patch(':id/members/:memberId')
  updateMember(@CurrentUser() user: User, @Param('id') id: string, @Param('memberId') memberId: string, @Body() dto: UpdateMemberDto) {
    return this.crews.updateMember(user, id, memberId, dto.role);
  }

  @Delete(':id/members/:memberId')
  @HttpCode(204)
  removeMember(@CurrentUser() user: User, @Param('id') id: string, @Param('memberId') memberId: string) {
    return this.crews.removeMember(user, id, memberId);
  }
}

@Module({ imports: [InvitationsModule], controllers: [CrewsController], providers: [CrewsService] })
export class CrewsModule {}
