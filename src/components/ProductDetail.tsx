'use client';

import { useEffect, useState } from 'react';
import { LEGACY_SPECS, getCategorySpecs } from '@/lib/specs';
import { productDescription, rupiah } from '@/lib/utils';
import type { Product } from '@/lib/types';

export default function ProductDetail({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const main = getCategorySpecs(String(product.category));
  const mainKeys = new Set(main.map((s) => s.key));
  const extra = LEGACY_SPECS.filter((s) => !mainKeys.has(s.key) && String(product[s.key] ?? '').trim() !== '');
  const specs = [...main, ...extra];
  const image = String(product.image ?? '');

  return (
    <>
      <button type="button" className="adm-icon-btn" title="Lihat" onClick={() => setOpen(true)}>
        <i className="fa-solid fa-eye" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-2xl border border-white/10 bg-[#0b1220] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Product Specification</h3>
              <button type="button" className="adm-icon-btn" onClick={() => setOpen(false)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={String(product.name)} className="mb-4 max-h-56 w-full rounded-xl object-cover" />
            )}
            <div className="text-[11px] font-bold uppercase text-cyan-300">{String(product.category)}</div>
            <div className="mt-1 text-xl font-bold">{String(product.name)}</div>
            <div className="mt-1 text-lg font-extrabold text-yellow-400">{rupiah(product.price)}</div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300">
              {productDescription(product) || '-'}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-[11px] text-slate-400">Stok</div>
                <div className="text-sm font-bold">{String(product.stock ?? '-')}</div>
              </div>
              {specs.map((s) => (
                <div key={s.key} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[11px] text-slate-400">
                    <i className={`${s.icon} mr-1.5`} />
                    {s.label}
                  </div>
                  <div className="break-words text-sm font-bold">{String(product[s.key] ?? '').trim() || '-'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
