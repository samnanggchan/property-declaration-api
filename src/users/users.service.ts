import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto, PaginatedResponse } from '../common/pagination.dto';
import { CreateUserDto, UpdateUserDto, UserSummaryDto } from './users.dto';

export type { UserSummaryDto };

const userIncludeConfig = {
  userRoles: {
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  },
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** List users with pagination, sorting, and search filtering */
  async findAll(
    query?: PaginationQueryDto,
  ): Promise<PaginatedResponse<UserSummaryDto>> {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.max(1, Number(query?.limit) || 20);
    const search = (query?.search ?? '').trim();
    const order = query?.order === 'asc' ? 'asc' : 'desc';

    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'email',
      'username',
      'firstName',
      'lastName',
    ];
    const sortBy = allowedSortFields.includes(query?.sortBy ?? '')
      ? (query?.sortBy as string)
      : 'createdAt';

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { username: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
          ],
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
        include: userIncludeConfig,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const data: UserSummaryDto[] = rows.map((u) => this.mapToSummary(u));

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

  /** Find single user by ID */
  async findOne(id: string): Promise<UserSummaryDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: userIncludeConfig,
    });

    if (!user) {
      throw new NotFoundException(`User "${id}" not found`);
    }

    return this.mapToSummary(user);
  }

  /** Create a new user with multiple roles, permissions, and active status */
  async create(dto: CreateUserDto): Promise<UserSummaryDto> {
    const email = dto.email.toLowerCase().trim();
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    if (dto.username?.trim()) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: dto.username.trim() },
      });
      if (existingUsername) {
        throw new ConflictException('Username already taken');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Multi-role resolution (defaults to VIEWER if not provided)
    const roleNames =
      dto.roles && dto.roles.length > 0 ? dto.roles : ['VIEWER'];

    const roleEntities = await Promise.all(
      roleNames.map((name) =>
        this.prisma.role.upsert({
          where: { name: name.toUpperCase() },
          update: {},
          create: { name: name.toUpperCase() },
        }),
      ),
    );

    const user = await this.prisma.user.create({
      data: {
        email,
        username: dto.username?.trim() || null,
        firstName: dto.firstName?.trim() || null,
        lastName: dto.lastName?.trim() || null,
        passwordHash,
        avatar: dto.avatar ?? null,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        userRoles: {
          create: roleEntities.map((role) => ({
            roleId: role.id,
          })),
        },
      },
      include: userIncludeConfig,
    });

    return this.mapToSummary(user);
  }

  /** Partial update of user details, multiple roles, avatar, isActive */
  async update(id: string, dto: UpdateUserDto): Promise<UserSummaryDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: userIncludeConfig,
    });
    if (!user) {
      throw new NotFoundException(`User "${id}" not found`);
    }

    if (dto.email && dto.email.toLowerCase().trim() !== user.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase().trim() },
      });
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }

    if (
      dto.username &&
      dto.username.trim() !== (user.username ?? '')
    ) {
      const usernameExists = await this.prisma.user.findUnique({
        where: { username: dto.username.trim() },
      });
      if (usernameExists) {
        throw new ConflictException('Username already taken');
      }
    }

    const dataToUpdate: {
      email?: string;
      username?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      passwordHash?: string;
      avatar?: string | null;
      isActive?: boolean;
    } = {};

    if (dto.email) {
      dataToUpdate.email = dto.email.toLowerCase().trim();
    }
    if (dto.username !== undefined) {
      dataToUpdate.username = dto.username?.trim() || null;
    }
    if (dto.firstName !== undefined) {
      dataToUpdate.firstName = dto.firstName?.trim() || null;
    }
    if (dto.lastName !== undefined) {
      dataToUpdate.lastName = dto.lastName?.trim() || null;
    }
    if (dto.password) {
      dataToUpdate.passwordHash = await bcrypt.hash(dto.password, 12);
    }
    if (dto.avatar !== undefined) {
      dataToUpdate.avatar = dto.avatar;
    }
    if (dto.isActive !== undefined) {
      dataToUpdate.isActive = dto.isActive;
    }

    // If multi-roles provided, sync userRoles junction table
    if (dto.roles && dto.roles.length > 0) {
      const roleEntities = await Promise.all(
        dto.roles.map((name) =>
          this.prisma.role.upsert({
            where: { name: name.toUpperCase() },
            update: {},
            create: { name: name.toUpperCase() },
          }),
        ),
      );

      await this.prisma.userRole.deleteMany({
        where: { userId: id },
      });

      await this.prisma.userRole.createMany({
        data: roleEntities.map((r) => ({
          userId: id,
          roleId: r.id,
        })),
      });
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      include: userIncludeConfig,
    });

    return this.mapToSummary(updatedUser);
  }

  /** Delete user by ID */
  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User "${id}" not found`);
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  private mapToSummary(user: {
    id: string;
    email: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    userRoles: Array<{
      role: {
        name: string;
        rolePermissions: Array<{ permission: { name: string } }>;
      };
    }>;
  }): UserSummaryDto {
    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = [
      ...new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.name),
        ),
      ),
    ];

    return {
      id: user.id,
      email: user.email,
      username: user.username ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      avatar: user.avatar ?? null,
      isActive: user.isActive,
      roles,
      permissions,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
