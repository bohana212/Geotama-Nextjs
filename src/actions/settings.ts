'use server';

import { randomInt } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { requireRole, safeEqual } from '@/lib/auth';
import { getSettings, getUsers, saveSettings, saveUsers } from '@/lib/data';
import { rateLimit, tempDel, tempGet, tempSet } from '@/lib/db';
import { md, telegramConfigured, telegramSend } from '@/lib/telegram';
import { pendingKey, str, wib } from '@/lib/utils';
import type { FormState, PendingAdmin, Role, User } from '@/lib/types';

const digits = (v: string) => v.replace(/\D/g, '');
const ADMIN_ROLES: Role[] = ['admin', 'verified_admin', 'super_admin'];

export async function settingsAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const me = await requireRole(['verified_admin', 'super_admin'], '/setting');
  const isSuper = me.role === 'super_admin';
  const action = str(fd, 'action');
  const done = (ok: string): FormState => {
    revalidatePath('/setting');
    revalidatePath('/');
    return { ok };
  };

  /* ---------- Profile toko ---------- */
  if (action === 'store') {
    const s = await getSettings();
    await saveSettings({
      ...s,
      store_name: str(fd, 'store_name'),
      address: str(fd, 'address'),
      address2: str(fd, 'address2'),
      phone: digits(str(fd, 'phone')),
      email: str(fd, 'email'),
      contact_admin: str(fd, 'contact_admin'),
      bio: str(fd, 'bio'),
      profile_image: str(fd, 'profile_image'),
      instagram: str(fd, 'instagram'),
      facebook: str(fd, 'facebook'),
      tiktok: str(fd, 'tiktok'),
      whatsapp: digits(str(fd, 'whatsapp')),
    });
    return done('Profile toko berhasil diperbarui.');
  }

  /* ---------- Profile saya ---------- */
  if (action === 'profile') {
    const password = String(fd.get('password') ?? '');
    if (password && password.length < 6) return { error: 'Password baru minimal 6 karakter.' };
    const users = await getUsers();
    const u = users.find((x) => Number(x.id) === me.id);
    if (!u) return { error: 'Akun tidak ditemukan.' };
    u.name = str(fd, 'name') || u.name;
    u.email = str(fd, 'email');
    if (password) u.password = await bcrypt.hash(password, 10);
    await saveUsers(users);
    return done('Profile akun diperbarui.');
  }

  /* ---------- Cancel OTP (semua role) ---------- */
  if (action === 'cancel_new_admin') {
    await tempDel(pendingKey(me.id));
    return done('Proses pembuatan akun dibatalkan.');
  }

  /* ---------- Sisanya khusus super_admin ---------- */
  if (!isSuper) return { error: 'Akses ditolak.' };

  if (action === 'admin') {
    const rid = Number(fd.get('id') || 0);
    const users = await getUsers();
    const u = users.find((x) => Number(x.id) === rid);
    if (!u) return { error: 'Admin tidak ditemukan.' };

    const role = ADMIN_ROLES.includes(str(fd, 'role') as Role) ? (str(fd, 'role') as Role) : 'admin';
    const status = str(fd, 'status') === 'active' ? 'active' : 'disabled';
    if (rid === me.id && (role !== 'super_admin' || status !== 'active')) {
      return { error: 'Kamu tidak bisa menurunkan role atau menonaktifkan akunmu sendiri.' };
    }
    const password = String(fd.get('password') ?? '');
    if (password && password.length < 6) return { error: 'Password baru minimal 6 karakter.' };

    u.name = str(fd, 'name') || u.name;
    u.email = str(fd, 'email');
    u.role = role;
    u.status = status;
    u.verified = fd.get('verified') === 'on';
    if (password) u.password = await bcrypt.hash(password, 10);
    await saveUsers(users);
    return done(`Admin "${u.username}" diperbarui.`);
  }

  if (action === 'new_admin') {
    const username = str(fd, 'username');
    const password = String(fd.get('password') ?? '');
    if (!username || password.length < 6) {
      return { error: 'Username wajib dan password minimal 6 karakter.' };
    }
    const users = await getUsers();
    if (users.some((x) => String(x.username).toLowerCase() === username.toLowerCase())) {
      return { error: 'Username sudah dipakai.' };
    }

    let id = Math.floor(Date.now() / 1000);
    while (users.some((x) => Number(x.id) === id)) id++;

    const newUser: User = {
      id,
      username,
      email: str(fd, 'email'),
      name: str(fd, 'name') || username,
      password: await bcrypt.hash(password, 10),
      role: 'admin',
      verified: false,
      status: 'active',
    };

    const s = await getSettings();
    if (!telegramConfigured(s)) {
      users.push(newUser);
      await saveUsers(users);
      return done(
        'Akun admin berhasil dibuat. (Hubungkan Bot Telegram di panel di bawah agar pembuatan akun berikutnya diamankan dengan OTP.)',
      );
    }

    const otp = String(randomInt(100000, 1000000));
    const pending: PendingAdmin = { data: newUser, otp, expires: Date.now() + 300_000 };
    await tempSet(pendingKey(me.id), pending, 300);

    const sent = await telegramSend(
      `🔐 *Kode OTP Pembuatan Akun Admin*\n\n` +
        `Username baru: ${md(username)}\n` +
        `Diminta oleh: ${md(me.username)}\n\n` +
        `Kode OTP: *${otp}*\n` +
        `Berlaku 5 menit. Masukkan kode ini di halaman Setting untuk konfirmasi.`,
    );
    if (!sent.ok) {
      await tempDel(pendingKey(me.id));
      return { error: `OTP gagal dikirim ke Telegram: ${sent.error}` };
    }
    return done('Kode OTP telah dikirim ke Telegram. Masukkan kode untuk mengonfirmasi pembuatan akun.');
  }

  if (action === 'confirm_new_admin') {
    const pending = await tempGet<PendingAdmin>(pendingKey(me.id));
    if (!pending) return { error: 'Tidak ada proses pembuatan akun yang menunggu konfirmasi.' };
    if (Date.now() > pending.expires) {
      await tempDel(pendingKey(me.id));
      return { error: 'Kode OTP sudah kedaluwarsa. Silakan buat ulang akunnya.' };
    }
    if (!(await rateLimit(`otp:${me.id}`, 5, 300))) {
      await tempDel(pendingKey(me.id));
      return { error: 'Terlalu banyak percobaan OTP. Silakan buat ulang akunnya.' };
    }
    if (!safeEqual(pending.otp, str(fd, 'otp'))) {
      return { error: 'Kode OTP salah. Coba periksa kembali pesan Telegram.' };
    }

    const users = await getUsers();
    users.push(pending.data);
    await saveUsers(users);
    await tempDel(pendingKey(me.id));
    await telegramSend(
      `✅ *Akun Admin Baru Dibuat*\n\n` +
        `Username: ${md(pending.data.username)}\n` +
        `Nama: ${md(pending.data.name ?? '-')}\n` +
        `Waktu: ${wib()}`,
    );
    return done('OTP benar. Akun admin baru berhasil dibuat.');
  }

  if (action === 'telegram') {
    const s = await getSettings();
    await saveSettings({
      ...s,
      telegram_bot_token: str(fd, 'telegram_bot_token'),
      telegram_chat_id: str(fd, 'telegram_chat_id'),
    });
    return done('Pengaturan Bot Telegram berhasil disimpan.');
  }

  if (action === 'telegram_test') {
    const s = await getSettings();
    if (!telegramConfigured(s)) return { error: 'Isi Bot Token & Chat ID terlebih dahulu.' };
    const r = await telegramSend(
      `✅ Tes notifikasi berhasil dari panel Setting ${md(s.store_name)}.\nWaktu: ${wib()}`,
    );
    return r.ok
      ? { ok: 'Pesan tes berhasil dikirim ke Telegram. Cek chat bot kamu.' }
      : { error: `Gagal mengirim pesan: ${r.error}` };
  }

  return { error: 'Aksi tidak dikenal.' };
}
