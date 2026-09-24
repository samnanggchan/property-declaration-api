export interface JwtPayload {
  sub: string;       // user id
  email: string;
  roles: string[];
  permissions: string[];
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export const COOKIE_ACCESS_TOKEN = 'access_token';
export const COOKIE_REFRESH_TOKEN = 'refresh_token';

export const ACCESS_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;   // 7 days
export const REFRESH_TOKEN_TTL_SECONDS = 14 * 24 * 60 * 60; // 14 days
