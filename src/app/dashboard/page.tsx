import type { Metadata } from 'next';
import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import ProductDetail from '@/components/ProductDetail';
import { PageHead } from '@/components/ui';
import { requireLogin } from '@/lib/auth';
import { getProducts, getSettings } from '@/lib/data';
import { ROLE_LABEL, STATUS_META, adminStatus, isFlash, rupiah } from '@/lib/utils';

export const metadata: Metadata = { title: 'Dashboard', robots: { index: false } };
export const dynamic = 'force-dynamic';

const SUMMARY_KEYS = ['brand', 'cpu', 'ram', 'ssd', 'vga', 'display'];

export default async function DashboardPage() {
  const user = await requireLogin('/dashboard');
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  const canManage = user.role === 'verified_admin' || user.role === 'super_admin';

  const statuses = products.map(adminStatus);
  const stats = [
    { label: 'Total Produk', value: products.length, icon: 'fa-boxes-stacked', tone: 'text-yellow-400' },
    { label: 'Ready Stock', value: statuses.filter((s) => s === 'ready').length, icon: 'fa-circle-check', tone: 'text-emerald-400' },
    { label: 'Out of Stock', value: statuses.filter((s) => s === 'out').length, icon: 'fa-box-open', tone: 'text-rose-400' },
    { label: 'Restocking', value: statuses.filter((s) => s === 'restocking').length, icon: 'fa-arrows-rotate', tone: 'text-amber-300' },
    { label: 'Flash Sale', value: products.filter(isFlash).length, icon: 'fa-bolt', tone: 'text-cyan-300' },
  ];

  return (
    <AdminShell user={user} active="/dashboard" storeName={settings.store_name}>
      <PageHead
        title="Dashboard"
        desc={`${user.name} • ${ROLE_LABEL[user.role] ?? user.role}${user.verified ? ' • Verified' : ''}`}
        action={
          canManage && (
            <Link href="/edit?action=add" className="adm-btn adm-btn-primary">
              <i className="fa-solid fa-plus" /> Tambah Produk
            </Link>
          )
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <i className={`fa-solid ${s.icon} text-xl ${s.tone}`} />
            <div className="mt-2 font-display text-3xl font-bold">{s.value}</div>
            <div className="text-xs text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      <section className="adm-panel !p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-display text-lg font-bold">Product Inventory</h2>
          <span className="text-xs text-slate-400">{products.length} produk terdaftar</span>
        </div>

        {products.length === 0 ? (
          <div className="px-5 pb-10 pt-4 text-center text-slate-400">
            <i className="fa-solid fa-box-open mb-3 text-4xl text-slate-600" />
            <p className="font-bold text-slate-200">Belum ada produk</p>
            <p className="mb-4 text-sm">Tambahkan produk pertama melalui menu Produk.</p>
            {canManage && (
              <Link href="/edit?action=add" className="adm-btn adm-btn-primary">Tambah Produk</Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr>
                  {['Produk', 'Spesifikasi', 'Harga', 'Status', 'Aksi'].map((h) => (
                    <th key={h} className="adm-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => {
                  const st = STATUS_META[statuses[i]];
                  const specs = SUMMARY_KEYS.map((k) => String(p[k] ?? '').trim()).filter(Boolean);
                  const image = String(p.image ?? '').trim();
                  return (
                    <tr key={p.id ?? i}>
                      <td className="adm-td">
                        <div className="flex items-center gap-3">
                          <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#07111d] text-slate-600">
                            {image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <i className="fa-solid fa-image" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold">{String(p.name ?? 'Unnamed Product')}</div>
                            <div className="text-[11px] text-slate-400">{String(p.category ?? 'Uncategorized')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="adm-td">
                        {specs.length ? (
                          <div className="flex max-w-[260px] flex-wrap gap-1">
                            {specs.map((s, j) => (
                              <span key={j} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-300">{s}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-600">Tidak ada spesifikasi</span>
                        )}
                      </td>
                      <td className="adm-td whitespace-nowrap font-bold">{rupiah(p.price)}</td>
                      <td className="adm-td">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${st.cls}`}>
                          <i className={`fa-solid ${st.icon}`} /> {st.label}
                        </span>
                        {isFlash(p) && (
                          <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-yellow-400/15 px-2.5 py-1 text-[10px] font-extrabold text-yellow-300">
                            <i className="fa-solid fa-bolt" /> FLASH SALE
                          </span>
                        )}
                      </td>
                      <td className="adm-td">
                        <div className="flex gap-1.5">
                          <ProductDetail product={p} />
                          {canManage && (
                            <Link href={`/edit?action=edit&id=${p.id}`} className="adm-icon-btn" title="Edit">
                              <i className="fa-solid fa-pen" />
                            </Link>
                          )}
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
    </AdminShell>
  );
}
