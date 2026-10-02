import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto, PaginatedResponse } from '../common/pagination.dto';

export interface UserSummaryDto {
  id: string;
  email: string;
  avatar?: string | null;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query?: PaginationQueryDto,
  ): Promise<PaginatedResponse<UserSummaryDto>> {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.max(1, Number(query?.limit) || 20);
    const search = (query?.search ?? '').trim();
    const order = query?.order === 'asc' ? 'asc' : 'desc';

    const allowedSortFields = ['createdAt', 'updatedAt', 'email'];
    const sortBy = allowedSortFields.includes(query?.sortBy ?? '')
      ? (query?.sortBy as string)
      : 'createdAt';

    const where = search
      ? {
          email: { contains: search, mode: 'insensitive' as const },
        }
      : {};

    const skip = (page - 1) * limit;

    const [total, rows] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const data: UserSummaryDto[] = rows.map((u) => ({
      id: u.id,
      email: u.email,
      avatar: u.avatar,
      roles: u.userRoles.map((ur) => ur.role.name),
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<UserSummaryDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User "${id}" not found`);
    }

    return {
      id: user.id,
      email: user.email,
      avatar: user.avatar,
      roles: user.userRoles.map((ur) => ur.role.name),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
