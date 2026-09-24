import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/db';
import { md, telegramSend } from '@/lib/telegram';
import { wib } from '@/lib/utils';

export const runtime = 'nodejs';

/** Dipanggil dari katalog (sendBeacon) setiap ada klik "Tanya / Pesan". */
export async function POST(req: Request) {
  const fd = await req.formData().catch(() => null);
  if (!fd) return NextResponse.json({ ok: false, message: 'Bad request' }, { status: 400 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!(await rateLimit(`notify:${ip}`, 10, 60))) {
    return NextResponse.json({ ok: false, message: 'Too many requests' }, { status: 429 });
  }

  const field = (k: string, max: number, fallback = '') =>
    String(fd.get(k) ?? fallback).trim().slice(0, max);

  const type = field('type', 30, 'produk');
  const name = field('name', 150, 'Produk');
  const price = field('price', 50);
  const sku = field('sku', 50);

  const text =
    `🛒 *Ada aktivitas pembelian!*\n\n` +
    `Produk: ${md(name)}\n` +
    (price ? `Harga: ${md(price)}\n` : '') +
    (sku ? `SKU: ${md(sku)}\n` : '') +
    `Aksi: ${type === 'wa' ? 'Klik tombol Tanya/Pesan WhatsApp' : md(type)}\n` +
    `Waktu: ${wib()}`;

  const r = await telegramSend(text);
  return NextResponse.json({ ok: r.ok });
}
