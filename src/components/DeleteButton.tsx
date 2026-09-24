'use client';

import { deleteProductAction } from '@/actions/products';

export default function DeleteButton({ id, name }: { id: number; name: string }) {
  return (
    <form
      action={deleteProductAction}
      onSubmit={(e) => {
        if (!confirm(`Hapus produk "${name}"?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="adm-icon-btn !text-rose-300 hover:!bg-rose-500/20" title="Hapus">
        <i className="fa-solid fa-trash" />
      </button>
    </form>
  );
}
