import { Body, Controller, Delete, Get, HttpCode, Module, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { UpdateMeDto } from './users.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@ApiBearerAuth()
@Controller({ path: 'users/me', version: '1' })
class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  me(@CurrentUser() user: User) {
    return this.users.me(user);
  }

  @Patch()
  update(@CurrentUser() user: User, @Body() dto: UpdateMeDto) {
    return this.users.update(user, dto);
  }

  @Delete()
  @HttpCode(204)
  remove(@CurrentUser() user: User) {
    return this.users.remove(user);
  }

  @Get('stats')
  stats(@CurrentUser() user: User) {
    return this.users.stats(user);
  }
}

@Module({ controllers: [UsersController], providers: [UsersService] })
export class UsersModule {}
