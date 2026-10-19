import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthedRequest } from './auth.guard.js';

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<AuthedRequest>().user);
