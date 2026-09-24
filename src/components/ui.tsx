import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

export function Field({
  label,
  hint,
  full,
  children,
}: {
  label: string;
  hint?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="adm-label">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{hint}</p>}
    </div>
  );
}

export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className={`adm-input ${p.className ?? ''}`} />
);

export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...p} className={`adm-input min-h-[100px] resize-y ${p.className ?? ''}`} />
);

export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...p} className={`adm-input ${p.className ?? ''}`} />
);

export function PageHead({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">{title}</h1>
        {desc && <p className="mt-1 text-sm text-slate-400">{desc}</p>}
      </div>
      {action}
    </div>
  );
}
