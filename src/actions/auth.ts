'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { createSession, destroySession, safeEqual, safeNext } from '@/lib/auth';
import { getUsers, saveUsers } from '@/lib/data';
import { rateLimit } from '@/lib/db';
import { str } from '@/lib/utils';
import type { FormState, User } from '@/lib/types';

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const username = str(fd, 'username');
  const password = String(fd.get('password') ?? '');
  const next = safeNext(str(fd, 'next'));

  if (!username || !password) return { error: 'Username dan password wajib diisi.' };

  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!(await rateLimit(`login:${ip}`, 10, 300))) {
    return { error: 'Terlalu banyak percobaan login. Coba lagi beberapa menit lagi.' };
  }

  const users = await getUsers();

  // Sama seperti versi PHP: kalau belum ada user sama sekali, buat akun awal.
  if (users.length === 0) {
    users.push({
      id: 1,
      username: 'superadmin',
      name: 'Super Administrator',
      email: 'admin@geotama.local',
      password: await bcrypt.hash('admin123', 10),
      role: 'super_admin',
      verified: true,
      status: 'active',
      created_at: new Date().toISOString(),
    } satisfies User);
    await saveUsers(users);
  }

  const idx = users.findIndex((u) => String(u.username ?? '').trim().toLowerCase() === username.toLowerCase());
  if (idx < 0) return { error: 'Username tidak ditemukan.' };

  const u = users[idx];
  if (String(u.status ?? 'active').toLowerCase() !== 'active') {
    return { error: 'Akun kamu sedang tidak aktif.' };
  }

  const stored = String(u.password ?? '');
  let valid = false;
  if (stored.startsWith('$2')) {
    valid = await bcrypt.compare(password, stored); // kompatibel dengan hash PHP ($2y$)
  } else if (stored) {
    // password plaintext lama -> otomatis di-upgrade ke hash
    valid = safeEqual(stored, password);
    if (valid) {
      users[idx].password = await bcrypt.hash(password, 10);
      await saveUsers(users);
    }
  }
  if (!valid) return { error: 'Password yang kamu masukkan salah.' };

  await createSession(Number(u.id ?? idx + 1));
  redirect(next);
}

export async function logoutAction() {
  await destroySession();
  redirect('/');
}
