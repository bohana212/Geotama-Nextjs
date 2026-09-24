import Link from 'next/link';
import { logoutAction } from '@/actions/auth';
import type { SessionUser } from '@/lib/types';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: 'fa-gauge' },
  { href: '/edit', label: 'Produk', icon: 'fa-box' },
  { href: '/setting', label: 'Setting', icon: 'fa-gear', needsRole: true },
];

export default function AdminShell({
  user,
  active,
  storeName,
  children,
}: {
  user: SessionUser;
  active: '/dashboard' | '/edit' | '/setting';
  storeName: string;
  children: React.ReactNode;
}) {
  const canManage = user.role === 'verified_admin' || user.role === 'super_admin';
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050812]/85 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[68px] w-[min(1180px,94%)] flex-wrap items-center justify-between gap-3 py-2">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900">
              <i className="fa-solid fa-microchip" />
            </span>
            <span>
              <span className="block font-display text-base font-bold leading-tight">{storeName}</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Admin Panel
              </span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-1.5">
            {NAV.filter((n) => !n.needsRole || canManage).map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-lg px-3 py-2 text-[13px] font-bold transition ${
                  active === n.href
                    ? 'bg-white text-slate-900'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <i className={`fa-solid ${n.icon} mr-1.5`} />
                {n.label}
              </Link>
            ))}
            <Link
              href="/"
              target="_blank"
              className="rounded-lg px-3 py-2 text-[13px] font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <i className="fa-solid fa-store mr-1.5" />
              Lihat Toko
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="adm-btn !px-3 !py-2 !text-[13px]">
                <i className="fa-solid fa-right-from-bracket" />
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-[min(1180px,94%)] py-8">{children}</main>
    </>
  );
}
