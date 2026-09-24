import { readData, writeData } from './db';
import type { Product, Settings, User } from './types';

export const DEFAULT_SETTINGS: Settings = {
  store_name: 'GEOTAMA COMPUTER',
  address: 'Ruko Elang Kav-A No.5, Jl. Elang Raya Cirebon',
  address2: '',
  phone: '628563293445',
  email: 'admin@geotama.local',
  contact_admin: '',
  bio: '',
  profile_image: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  whatsapp: '',
  telegram_bot_token: '',
  telegram_chat_id: '',
};

function unwrap<T>(v: unknown, key: string): T[] {
  if (Array.isArray(v)) return v as T[];
  const inner = (v as Record<string, unknown> | null)?.[key];
  return Array.isArray(inner) ? (inner as T[]) : [];
}

export async function getProducts(): Promise<Product[]> {
  return unwrap<Product>(await readData('products'), 'products').filter(
    (p) => p && typeof p === 'object',
  );
}
export const saveProducts = (v: Product[]) => writeData('products', v);

export async function getUsers(): Promise<User[]> {
  return unwrap<User>(await readData('users'), 'users').filter((u) => u && typeof u === 'object');
}
export const saveUsers = (v: User[]) => writeData('users', v);

export async function getSettings(): Promise<Settings> {
  return { ...DEFAULT_SETTINGS, ...(await readData('settings')) } as Settings;
}
export const saveSettings = (v: Settings) => writeData('settings', v);
