import { getSettings } from './data';
import { wib } from './utils';
import type { Settings } from './types';

export const telegramConfigured = (s: Settings) =>
  s.telegram_bot_token.trim() !== '' && s.telegram_chat_id.trim() !== '';

/** Escape karakter khusus Markdown Telegram pada teks dinamis. */
export const md = (v: string) => v.replace(/([_*`\[])/g, '\\$1');

export async function telegramSend(text: string): Promise<{ ok: boolean; error?: string }> {
  const s = await getSettings();
  const token = s.telegram_bot_token.trim();
  const chatId = s.telegram_chat_id.trim();
  if (!token || !chatId) return { ok: false, error: 'Bot Token / Chat ID belum diisi.' };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
    if (res.ok && data?.ok) return { ok: true };

    let reason = data?.description ?? `HTTP ${res.status}`;
    if (res.status === 401) {
      reason = 'Bot Token salah / tidak valid (Unauthorized). Cek ulang token dari @BotFather.';
    } else if (/chat not found/i.test(reason)) {
      reason =
        'Chat ID salah, ATAU kamu belum pernah kirim pesan / klik Start ke bot ini. Buka Telegram, cari bot-nya, tekan Start dulu.';
    } else if (/bot can't initiate|bot was blocked/i.test(reason)) {
      reason = 'Bot diblokir, atau kamu belum pernah chat/klik Start ke bot ini terlebih dahulu.';
    }
    return { ok: false, error: reason };
  } catch (e) {
    return { ok: false, error: `Gagal konek ke server Telegram: ${(e as Error).message}` };
  }
}

export async function notifyServerError(err: unknown, path: string) {
  try {
    const s = await getSettings();
    if (!telegramConfigured(s)) return;
    const e = err instanceof Error ? err : new Error(String(err));
    await telegramSend(
      `🚨 *SERVER ERROR - ${md(s.store_name)}*\n\n` +
        `Jenis: ${md(e.name)}\n` +
        `Pesan: ${md(e.message.slice(0, 300))}\n` +
        `Halaman: ${md(path)}\n` +
        `Waktu: ${wib()}`,
    );
  } catch {
    /* jangan sampai notifikasi error membuat error baru */
  }
}
