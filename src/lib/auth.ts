import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import { timingSafeEqual } from 'node:crypto';
import { getUsers } from './data';
import type { Role, SessionUser } from './types';

const COOKIE = 'geotama_session';

function secret() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return new TextEncoder().encode(s);
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET belum diset (minimal 16 karakter, disarankan 32+).');
  }
  return new TextEncoder().encode('dev-only-secret-jangan-dipakai-di-production');
}

export async function createSession(userId: number) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(secret());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** Sesi selalu dicocokkan ulang ke data user, jadi akun yang dinonaktifkan langsung kehilangan akses. */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const users = await getUsers();
    const u = users.find((x) => Number(x.id) === Number(payload.uid));
    if (!u || String(u.status ?? 'active').toLowerCase() !== 'active') return null;
    return {
      id: Number(u.id),
      username: u.username,
      name: u.name || u.username,
      email: u.email ?? '',
      role: u.role ?? 'admin',
      verified: Boolean(u.verified),
    };
  } catch {
    return null;
  }
});

export async function requireLogin(path = '/dashboard'): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect(`/login?next=${encodeURIComponent(path)}`);
  return user;
}

export async function requireRole(roles: Role[], path = '/dashboard'): Promise<SessionUser> {
  const user = await requireLogin(path);
  if (!roles.includes(user.role)) redirect('/dashboard');
  return user;
}

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Cegah open redirect: hanya path internal. */
export function safeNext(next: string, fallback = '/dashboard'): string {
  return next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : fallback;
}
