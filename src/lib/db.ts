import { Redis } from '@upstash/redis';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import productsSeed from '../../data/products.json';
import usersSeed from '../../data/users.json';
import settingsSeed from '../../data/settings.json';
import type { Product, Settings, User } from './types';

/**
 * Penyimpanan data.
 *
 * - Di Vercel  : Upstash Redis (filesystem Vercel read-only, jadi file JSON
 *                tidak bisa lagi dipakai untuk menulis data).
 * - Lokal      : file di folder .data/ (otomatis, tanpa setup).
 * - Data awal  : diambil dari folder data/*.json selama belum pernah disimpan.
 */
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const seeds = {
  products: productsSeed,
  users: usersSeed,
  settings: settingsSeed,
} as unknown as {
  products: Product[];
  users: User[];
  settings: Partial<Settings>;
};

type Key = keyof typeof seeds;
type Value<K extends Key> = (typeof seeds)[K];

const LOCAL_DIR = path.join(process.cwd(), '.data');

export async function readData<K extends Key>(key: K): Promise<Value<K>> {
  if (redis) {
    const value = await redis.get<Value<K>>(`geotama:${key}`);
    return value ?? structuredClone(seeds[key]);
  }
  try {
    const raw = await fs.readFile(path.join(LOCAL_DIR, `${key}.json`), 'utf8');
    return JSON.parse(raw) as Value<K>;
  } catch {
    return structuredClone(seeds[key]);
  }
}

export async function writeData<K extends Key>(key: K, value: Value<K>): Promise<void> {
  if (redis) {
    await redis.set(`geotama:${key}`, value);
    return;
  }
  if (process.env.VERCEL) {
    throw new Error(
      'Penyimpanan belum dikonfigurasi. Hubungkan Upstash Redis di Vercel (lihat README).',
    );
  }
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_DIR, `${key}.json`), JSON.stringify(value, null, 2));
}

/* ---------- data sementara (OTP, rate limit) ---------- */

const mem = new Map<string, { value: unknown; exp: number }>();

export async function tempSet(key: string, value: unknown, ttlSec: number) {
  if (redis) {
    await redis.set(`geotama:tmp:${key}`, value, { ex: ttlSec });
  } else {
    mem.set(key, { value, exp: Date.now() + ttlSec * 1000 });
  }
}

export async function tempGet<T>(key: string): Promise<T | null> {
  if (redis) return (await redis.get<T>(`geotama:tmp:${key}`)) ?? null;
  const hit = mem.get(key);
  if (!hit || hit.exp < Date.now()) {
    mem.delete(key);
    return null;
  }
  return hit.value as T;
}

export async function tempDel(key: string) {
  if (redis) await redis.del(`geotama:tmp:${key}`);
  else mem.delete(key);
}

/** true = masih boleh, false = kena limit. */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  if (redis) {
    const k = `geotama:rl:${key}`;
    const n = await redis.incr(k);
    if (n === 1) await redis.expire(k, windowSec);
    return n <= limit;
  }
  const hit = mem.get(`rl:${key}`);
  const now = Date.now();
  if (!hit || hit.exp < now) {
    mem.set(`rl:${key}`, { value: 1, exp: now + windowSec * 1000 });
    return true;
  }
  hit.value = (hit.value as number) + 1;
  return (hit.value as number) <= limit;
}
