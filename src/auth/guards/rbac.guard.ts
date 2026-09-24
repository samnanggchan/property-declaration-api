import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from '../auth.types';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { ROLES_KEY } from '../decorators/require-roles.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    const requiredPerms = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    // No restrictions declared — allow through
    if (!requiredRoles?.length && !requiredPerms?.length) return true;

    const user: AuthenticatedUser = ctx.switchToHttp().getRequest().user;
    if (!user) throw new ForbiddenException('Not authenticated');

    if (requiredRoles?.length) {
      const hasRole = requiredRoles.some((r) => user.roles.includes(r));
      if (!hasRole) throw new ForbiddenException(`Required role: ${requiredRoles.join(' | ')}`);
    }

    if (requiredPerms?.length) {
      const hasPerm = requiredPerms.every((p) => user.permissions.includes(p));
      if (!hasPerm) throw new ForbiddenException(`Required permissions: ${requiredPerms.join(', ')}`);
    }

    return true;
  }
}
