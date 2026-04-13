import { Controller, Get, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { CurrentUser, type RequestUser } from '../../common/current-user.decorator.js';

@Controller('me')
export class UsersController {
  @Get()
  async me(@CurrentUser() user: RequestUser) {
    const u = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true },
    });
    if (!u) throw new NotFoundException('user not found');
    return u;
  }
}
