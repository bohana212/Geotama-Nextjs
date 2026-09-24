export type Role = 'admin' | 'verified_admin' | 'super_admin';

export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  desc?: string;
  image?: string;
  status?: string;
  flash_sale?: boolean | number | string;
  [key: string]: unknown;
};

export type User = {
  id: number;
  username: string;
  email?: string;
  name?: string;
  password: string;
  role: Role;
  verified?: boolean;
  status?: 'active' | 'disabled' | string;
  created_at?: string;
};

export type SessionUser = {
  id: number;
  username: string;
  name: string;
  email: string;
  role: Role;
  verified: boolean;
};

export type Settings = {
  store_name: string;
  address: string;
  address2: string;
  phone: string;
  email: string;
  contact_admin: string;
  bio: string;
  profile_image: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  whatsapp: string;
  telegram_bot_token: string;
  telegram_chat_id: string;
  [key: string]: unknown;
};

export type FormState = { error?: string; ok?: string } | undefined;

export type PendingAdmin = { data: User; otp: string; expires: number };
