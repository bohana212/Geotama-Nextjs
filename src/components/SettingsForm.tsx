'use client';

import { useActionState } from 'react';
import { settingsAction } from '@/actions/settings';

/** Satu komponen untuk semua form Setting; jenis aksi ditentukan lewat hidden field "action". */
export default function SettingsForm({
  action,
  submitLabel,
  submitClass = 'adm-btn adm-btn-primary',
  className = '',
  fieldsClass = '',
  children,
}: {
  action: string;
  submitLabel: string;
  submitClass?: string;
  className?: string;
  fieldsClass?: string;
  children?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(settingsAction, undefined);

  return (
    <form action={formAction} className={className}>
      <input type="hidden" name="action" value={action} />
      {state?.error && <div className="adm-alert-err">{state.error}</div>}
      {state?.ok && <div className="adm-alert-ok">{state.ok}</div>}
      {children && <div className={`mb-4 ${fieldsClass}`}>{children}</div>}
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? 'Memproses...' : submitLabel}
      </button>
    </form>
  );
}
