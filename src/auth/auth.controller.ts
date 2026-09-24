import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
} from './auth.types';
import type { AuthenticatedUser } from './auth.types';

const cookieOptions = (maxAgeSeconds: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: maxAgeSeconds * 1000,
  path: '/',
});

@Controller(['api/auth', 'auth'])
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** POST /auth/register */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.register(dto);
    // After registration, log them in immediately
    const { accessToken, refreshToken } = await this.authService.login(dto);
    this.setTokenCookies(res, accessToken, refreshToken);
    return { user };
  }

  /** POST /auth/login */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.login(dto);
    this.setTokenCookies(res, accessToken, refreshToken);
    return { user };
  }

  /** POST /auth/refresh — reads HttpOnly refresh token cookie, rotates it */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const incoming = req.cookies?.[COOKIE_REFRESH_TOKEN] as string | undefined;
    if (!incoming) {
      res.clearCookie(COOKIE_ACCESS_TOKEN).clearCookie(COOKIE_REFRESH_TOKEN);
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'No refresh token' });
    }
    const { accessToken, refreshToken } = await this.authService.refresh(incoming);
    this.setTokenCookies(res, accessToken, refreshToken);
    return { ok: true };
  }

  /** POST /auth/logout */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[COOKIE_REFRESH_TOKEN] as string | undefined;
    if (token) await this.authService.logout(token);
    res
      .clearCookie(COOKIE_ACCESS_TOKEN, { path: '/' })
      .clearCookie(COOKIE_REFRESH_TOKEN, { path: '/' });
  }

  /** GET /auth/me — returns the currently authenticated user (JWT guard) */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    return { user };
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
    res
      .cookie(COOKIE_ACCESS_TOKEN, accessToken, cookieOptions(ACCESS_TOKEN_TTL_SECONDS))
      .cookie(COOKIE_REFRESH_TOKEN, refreshToken, cookieOptions(REFRESH_TOKEN_TTL_SECONDS));
  }
}
