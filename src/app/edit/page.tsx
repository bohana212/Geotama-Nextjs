import type { Metadata } from 'next';
import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import DeleteButton from '@/components/DeleteButton';
import ProductForm from '@/components/ProductForm';
import { PageHead } from '@/components/ui';
import { requireRole } from '@/lib/auth';
import { getProducts, getSettings } from '@/lib/data';
import { CATEGORIES, getCategorySpecs } from '@/lib/specs';
import { rupiah } from '@/lib/utils';

export const metadata: Metadata = { title: 'Kelola Produk', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function EditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; id?: string; saved?: string; deleted?: string }>;
}) {
  const sp = await searchParams;
  const user = await requireRole(['verified_admin', 'super_admin'], '/edit');
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);

  const id = Number(sp.id || 0);
  const found = id ? products.find((p) => Number(p.id) === id) : undefined;
  const showForm = sp.action === 'add' || (Boolean(id) && sp.action !== 'list');
  const notFound = showForm && sp.action !== 'add' && !found;

  return (
    <AdminShell user={user} active="/edit" storeName={settings.store_name}>
      {showForm && !notFound ? (
        <>
          <PageHead
            title={found ? 'Edit Produk' : 'Tambah Produk'}
            desc="Kelola informasi produk dan spesifikasi berdasarkan kategori."
            action={
              <Link href="/edit" className="adm-btn">
                <i className="fa-solid fa-arrow-left" /> Kembali
              </Link>
            }
          />
          <ProductForm key={found?.id ?? 'new'} product={found} categories={CATEGORIES} />
        </>
      ) : (
        <>
          <PageHead
            title="Kelola Produk"
            desc="Tambah, edit, dan hapus produk Geotama Computer."
            action={
              <Link href="/edit?action=add" className="adm-btn adm-btn-primary">
                <i className="fa-solid fa-plus" /> Tambah Barang
              </Link>
            }
          />

          {sp.saved && <div className="adm-alert-ok">Produk berhasil disimpan.</div>}
          {sp.deleted && <div className="adm-alert-ok">Produk berhasil dihapus.</div>}
          {notFound && <div className="adm-alert-err">Produk tidak ditemukan.</div>}

          <section className="adm-panel !p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="font-display text-lg font-bold">Daftar Produk</h2>
              <span className="text-xs text-slate-400">{products.length} produk</span>
            </div>

            {products.length === 0 ? (
              <div className="px-5 pb-10 pt-2 text-center text-slate-400">
                Belum ada produk.{' '}
                <Link href="/edit?action=add" className="text-sky-400 underline">Tambahkan produk pertama</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse">
                  <thead>
                    <tr>
                      {['Produk', 'Kategori', 'Harga', 'Stok', 'Spesifikasi', 'Aksi'].map((h) => (
                        <th key={h} className="adm-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => {
                      const specs = getCategorySpecs(String(p.category));
                      const filled = specs.filter((s) => String(p[s.key] ?? '').trim() !== '').length;
                      const stock = Number(p.stock) || 0;
                      const image = String(p.image ?? '').trim();
                      return (
                        <tr key={p.id ?? i}>
                          <td className="adm-td">
                            <div className="flex items-center gap-3">
                              <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#07111d] text-slate-600">
                                {image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={image} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <i className="fa-solid fa-image" />
                                )}
                              </div>
                              <div>
                                <div className="font-bold">{String(p.name)}</div>
                                <div className="text-[11px] text-slate-500">ID #{p.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="adm-td text-slate-300">{String(p.category)}</td>
                          <td className="adm-td whitespace-nowrap font-bold">{rupiah(p.price)}</td>
                          <td className="adm-td">
                            {stock > 0 ? stock : <span className="text-rose-300">Habis</span>}
                          </td>
                          <td className="adm-td text-[11px] text-slate-400">
                            {filled}/{specs.length} field terisi
                          </td>
                          <td className="adm-td">
                            <div className="flex gap-1.5">
                              <Link href={`/edit?action=edit&id=${p.id}`} className="adm-icon-btn" title="Edit">
                                <i className="fa-solid fa-pen" />
                              </Link>
                              <Link href="/" target="_blank" className="adm-icon-btn" title="Lihat Toko">
                                <i className="fa-solid fa-arrow-up-right-from-square" />
                              </Link>
                              <DeleteButton id={Number(p.id)} name={String(p.name)} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </AdminShell>
  );
}
