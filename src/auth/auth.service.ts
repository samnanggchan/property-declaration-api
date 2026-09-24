import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes, createHash, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  JwtPayload,
  AuthenticatedUser,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
} from './auth.types';
import { RegisterDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  // ─── Registration ────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<AuthenticatedUser> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Ensure default VIEWER role exists
    const role = await this.prisma.role.upsert({
      where: { name: 'VIEWER' },
      update: {},
      create: { name: 'VIEWER' },
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        userRoles: { create: { roleId: role.id } },
      },
    });

    return this.buildAuthenticatedUser(user.id);
  }

  // ─── Login ───────────────────────────────────────────────────────────────────

  async login(dto: LoginDto): Promise<{ user: AuthenticatedUser; accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const authUser = await this.buildAuthenticatedUser(user.id);
    const familyId = randomUUID();

    const { accessToken, refreshToken } = await this.issueTokenPair(authUser, familyId);
    return { user: authUser, accessToken, refreshToken };
  }

  // ─── Refresh Token Rotation ──────────────────────────────────────────────────

  async refresh(incomingRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = this.hashToken(incomingRefreshToken);

    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash },
    });

    // Token not found at all
    if (!stored) throw new UnauthorizedException('Invalid refresh token');

    // ── Replay attack detection ──────────────────────────────────────────────
    // Token exists but was already revoked → someone reused an old token.
    // Immediately invalidate the ENTIRE token family to protect the account.
    if (stored.isRevoked) {
      await this.prisma.refreshToken.updateMany({
        where: { familyId: stored.familyId },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException('Refresh token reuse detected — all sessions revoked');
    }

    // Token is expired
    if (stored.expiresAt < new Date()) {
      await this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    // ── Rotate: revoke old, issue new ────────────────────────────────────────
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    });

    const authUser = await this.buildAuthenticatedUser(stored.userId);
    const { accessToken, refreshToken } = await this.issueTokenPair(authUser, stored.familyId);
    return { accessToken, refreshToken };
  }

  // ─── Logout ──────────────────────────────────────────────────────────────────

  async logout(incomingRefreshToken: string): Promise<void> {
    if (!incomingRefreshToken) return;
    const tokenHash = this.hashToken(incomingRefreshToken);
    const stored = await this.prisma.refreshToken.findFirst({ where: { tokenHash } });
    if (!stored) return;

    // Revoke entire family on logout
    await this.prisma.refreshToken.updateMany({
      where: { familyId: stored.familyId },
      data: { isRevoked: true },
    });
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private async buildAuthenticatedUser(userId: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: { rolePermissions: { include: { permission: true } } },
            },
          },
        },
      },
    });

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = [
      ...new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.name),
        ),
      ),
    ];

    return { id: user.id, email: user.email, roles, permissions };
  }

  private async issueTokenPair(
    user: AuthenticatedUser,
    familyId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
    };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });

    // Raw refresh token — stored only as a SHA-256 hash in the DB
    const rawRefreshToken = randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        familyId,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      },
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
