'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/actions/auth';
import { Input } from './ui';

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {state?.error && (
        <div role="alert" className="adm-alert-err !mb-0">
          <i className="fa-solid fa-circle-exclamation mr-2" />
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="username" className="adm-label">Username</label>
        <Input id="username" name="username" autoComplete="username" placeholder="Masukkan username" maxLength={100} required autoFocus />
      </div>

      <div>
        <label htmlFor="password" className="adm-label">Password</label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Masukkan password"
            maxLength={255}
            required
            className="!pr-11"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <i className={`fa-solid ${show ? 'fa-eye-slash' : 'fa-eye'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <Link href="/" className="adm-btn">
          <i className="fa-solid fa-arrow-left" /> Kembali
        </Link>
        <button type="submit" disabled={pending} className="adm-btn adm-btn-primary">
          {pending ? (
            <><i className="fa-solid fa-spinner fa-spin" /> Memproses...</>
          ) : (
            <><i className="fa-solid fa-right-to-bracket" /> Login</>
          )}
        </button>
      </div>
    </form>
  );
}
