'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { getProducts, saveProducts } from '@/lib/data';
import { getCategorySpecs } from '@/lib/specs';
import { str } from '@/lib/utils';
import type { FormState, Product } from '@/lib/types';

const ROLES = ['verified_admin', 'super_admin'] as const;

function refresh() {
  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath('/edit');
}

export async function saveProductAction(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireRole([...ROLES], '/edit');

  const id = Number(fd.get('id') || 0);
  const name = str(fd, 'name');
  const category = str(fd, 'category');
  if (!name || !category) return { error: 'Nama produk dan kategori wajib diisi.' };

  const data: Record<string, unknown> = {
    name,
    category,
    price: Math.max(0, Number(fd.get('price') || 0)),
    stock: Math.max(0, Math.trunc(Number(fd.get('stock') || 0))),
    description: str(fd, 'description'),
    image: str(fd, 'image'),
    flash_sale: fd.get('flash_sale') === 'on',
  };
  for (const spec of getCategorySpecs(category)) {
    data[spec.key] = str(fd, `spec_${spec.key}`);
  }

  const products = await getProducts();
  if (id > 0) {
    const i = products.findIndex((p) => Number(p.id) === id);
    if (i < 0) return { error: 'Produk tidak ditemukan.' };
    products[i] = { ...products[i], ...data, id } as Product;
  } else {
    const maxId = products.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0);
    products.push({ ...data, id: maxId + 1 } as Product);
  }

  await saveProducts(products);
  refresh();
  redirect('/edit?saved=1');
}

export async function deleteProductAction(fd: FormData) {
  await requireRole([...ROLES], '/edit');
  const id = Number(fd.get('id') || 0);
  const products = await getProducts();
  await saveProducts(products.filter((p) => Number(p.id) !== id));
  refresh();
  redirect('/edit?deleted=1');
}
