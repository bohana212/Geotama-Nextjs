import type { Product } from './types';

export const str = (fd: FormData, key: string) => String(fd.get(key) ?? '').trim();

export const rupiah = (n: unknown) =>
  'Rp ' + new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Number(n) || 0);

export function waNumber(input: string): string {
  let n = input.replace(/\D+/g, '');
  if (!n) return '';
  if (n.startsWith('0')) n = '62' + n.slice(1);
  return n;
}

export function isFlash(p: Product): boolean {
  return [p.flash_sale, p.flash, p.is_flash_sale].some((v) => {
    if (v === true || v === 1) return true;
    const s = String(v ?? '').trim().toLowerCase();
    return s === '1' || s === 'true';
  });
}

export const productDescription = (p: Product) =>
  String(p.description ?? p.desc ?? '').trim();

/** Status untuk katalog publik. */
export function catalogStatus(stock: number) {
  if (stock <= 0) return { label: 'Stok Habis', cls: 'out', icon: 'fa-circle-xmark' };
  if (stock <= 3) return { label: 'Stok Terbatas', cls: 'low', icon: 'fa-triangle-exclamation' };
  return { label: 'Ready Stock', cls: 'ready', icon: 'fa-circle-check' };
}

/** Status untuk dashboard admin. */
export function adminStatus(p: Product): 'restocking' | 'out' | 'ready' {
  if (String(p.status ?? '').trim().toUpperCase() === 'RESTOCKING') return 'restocking';
  const stock = p.stock as unknown;
  if (typeof stock === 'number' || (typeof stock === 'string' && stock.trim() !== '' && !isNaN(Number(stock)))) {
    return Number(stock) <= 0 ? 'out' : 'ready';
  }
  const t = String(stock ?? '').trim().toUpperCase();
  return ['', 'OUT OF STOCK', 'HABIS', 'KOSONG'].includes(t) ? 'out' : 'ready';
}

export const STATUS_META = {
  ready: { label: 'READY STOCK', icon: 'fa-circle-check', cls: 'bg-emerald-500/15 text-emerald-300' },
  out: { label: 'OUT OF STOCK', icon: 'fa-box-open', cls: 'bg-rose-500/15 text-rose-300' },
  restocking: { label: 'RESTOCKING', icon: 'fa-arrows-rotate', cls: 'bg-amber-400/15 text-amber-300' },
} as const;

export const ROLE_LABEL: Record<string, string> = {
  guest: 'Guest/Pembeli',
  admin: 'Admin',
  verified_admin: 'Verified Admin',
  super_admin: 'Super Admin',
};

export const wib = (d = new Date()) =>
  d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false }).replace(',', '');

export const pendingKey = (uid: number) => `pending_admin:${uid}`;
