'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { saveProductAction } from '@/actions/products';
import { getCategorySpecs } from '@/lib/specs';
import { productDescription } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { Field, Input, Select, Textarea } from './ui';

export default function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: string[];
}) {
  const [state, action, pending] = useActionState(saveProductAction, undefined);
  const [category, setCategory] = useState(String(product?.category ?? ''));
  const specs = category ? getCategorySpecs(category) : [];
  const options = category && !categories.includes(category) ? [...categories, category] : categories;
  const editing = Boolean(product);

  return (
    <form action={action} className="adm-panel">
      <input type="hidden" name="id" value={product?.id ?? ''} />
      {state?.error && <div className="adm-alert-err">{state.error}</div>}

      <h2 className="mb-4 font-display text-lg font-bold">Informasi Produk</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama Produk *" full>
          <Input name="name" required defaultValue={String(product?.name ?? '')} placeholder="Contoh: Epson L3210" />
        </Field>

        <Field label="Kategori *" hint="Pilih kategori untuk menampilkan spesifikasi yang sesuai.">
          <Select name="category" required value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">— Pilih Kategori —</option>
            {options.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>

        <Field label="Harga Jual">
          <Input name="price" type="number" min={0} step={1} defaultValue={product?.price ?? ''} placeholder="Contoh: 3500000" />
        </Field>

        <Field label="Stok">
          <Input name="stock" type="number" min={0} step={1} defaultValue={product?.stock ?? ''} placeholder="0" />
        </Field>

        <Field label="URL Gambar" hint="Gunakan URL gambar langsung (https://...).">
          <Input name="image" defaultValue={String(product?.image ?? '')} placeholder="https://.../gambar.jpg" />
        </Field>

        <Field label="Deskripsi Produk" full>
          <Textarea name="description" defaultValue={product ? productDescription(product) : ''} placeholder="Tulis deskripsi singkat produk..." />
        </Field>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-bold sm:col-span-2">
          <input
            type="checkbox"
            name="flash_sale"
            defaultChecked={product ? [true, 1, '1', 'true'].includes(product.flash_sale as never) : false}
            className="h-4 w-4 accent-yellow-400"
          />
          <i className="fa-solid fa-bolt text-yellow-400" /> Tandai sebagai Flash Sale
        </label>
      </div>

      {specs.length > 0 && (
        <div className="mt-6 border-t border-white/10 pt-5">
          <h2 className="font-display text-lg font-bold">Spesifikasi Produk</h2>
          <p className="mb-4 text-xs text-slate-400">Field spesifikasi otomatis berubah mengikuti kategori produk.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {specs.map((s) => (
              <Field key={`${category}-${s.key}`} label={s.label}>
                <Input name={`spec_${s.key}`} defaultValue={String(product?.[s.key] ?? '')} placeholder={s.label} />
              </Field>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <Link href="/edit" className="adm-btn">Batal</Link>
        <button type="submit" disabled={pending} className="adm-btn adm-btn-primary">
          {pending ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Produk'}
        </button>
      </div>
    </form>
  );
}
