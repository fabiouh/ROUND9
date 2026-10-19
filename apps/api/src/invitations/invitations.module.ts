import { Body, Controller, HttpCode, Module, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { TokenDto } from './invitations.dto.js';
import { InvitationsService } from './invitations.service.js';

@ApiTags('invitations')
@ApiBearerAuth()
@Controller({ path: 'invitations', version: '1' })
class InvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  // Tokens travel in the body so they stay out of access logs.
  @Post('preview')
  @HttpCode(200)
  preview(@Body() dto: TokenDto) {
    return this.invitations.preview(dto.token);
  }

  @Post('accept')
  @HttpCode(200)
  accept(@CurrentUser() user: User, @Body() dto: TokenDto) {
    return this.invitations.accept(user, dto.token);
  }
}

@Module({ controllers: [InvitationsController], providers: [InvitationsService], exports: [InvitationsService] })
export class InvitationsModule {}
