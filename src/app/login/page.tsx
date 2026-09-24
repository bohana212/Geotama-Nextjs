import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { getSession, safeNext } from '@/lib/auth';

export const metadata: Metadata = { title: 'Admin Login', robots: { index: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = safeNext(next ?? '');

  if (await getSession()) redirect(target);

  return (
    <div className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-[430px]">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 text-2xl text-slate-900">
            <i className="fa-solid fa-microchip" />
          </span>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-400">
            Masuk ke dashboard Geotama Computer untuk mengelola produk dan toko.
          </p>
        </div>

        <div className="adm-panel !p-6">
          <LoginForm next={target} />
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          <i className="fa-solid fa-circle-check mr-1.5 text-emerald-400" />
          Secure admin authentication
        </p>
      </div>
    </div>
  );
}
