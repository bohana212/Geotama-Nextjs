import type { Metadata } from 'next';
import AdminShell from '@/components/AdminShell';
import SettingsForm from '@/components/SettingsForm';
import { Field, Input, PageHead, Select, Textarea } from '@/components/ui';
import { requireRole } from '@/lib/auth';
import { getSettings, getUsers } from '@/lib/data';
import { tempGet } from '@/lib/db';
import type { PendingAdmin } from '@/lib/types';
import { ROLE_LABEL, pendingKey } from '@/lib/utils';

export const metadata: Metadata = { title: 'Setting', robots: { index: false } };
export const dynamic = 'force-dynamic';

const Section = ({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) => (
  <section className="adm-panel mb-5">
    <h2 className="font-display text-lg font-bold">{title}</h2>
    {desc && <p className="mb-4 mt-1 text-xs text-slate-400">{desc}</p>}
    {children}
  </section>
);

const GRID = 'grid gap-4 sm:grid-cols-2';

export default async function SettingPage() {
  const user = await requireRole(['verified_admin', 'super_admin'], '/setting');
  const isSuper = user.role === 'super_admin';
  const [S, users] = await Promise.all([getSettings(), getUsers()]);

  const pending = isSuper ? await tempGet<PendingAdmin>(pendingKey(user.id)) : null;
  const pendingActive = pending && pending.expires > Date.now() ? pending : null;

  return (
    <AdminShell user={user} active="/setting" storeName={S.store_name}>
      <PageHead
        title="Setting Profile"
        desc="Kelola identitas toko, kontak, sosial media, dan akun administrator."
      />

      {/* ---------- Profile toko ---------- */}
      <Section title="Profile Toko" desc="Informasi ini tampil pada halaman katalog publik.">
        <SettingsForm action="store" submitLabel="Simpan Profile Toko" fieldsClass={GRID}>
          <Field label="Nama Toko"><Input name="store_name" required defaultValue={S.store_name} placeholder="Geotama Computer" /></Field>
          <Field label="Email"><Input name="email" type="email" defaultValue={S.email} placeholder="email@toko.com" /></Field>
          <Field label="Bio / Deskripsi Toko" full>
            <Textarea name="bio" defaultValue={S.bio} placeholder="Contoh: Geotama Computer menyediakan laptop, PC rakitan, printer, networking, CCTV dan sparepart komputer." />
          </Field>
          <Field label="URL Foto Profile / Logo" full hint="Gunakan URL gambar langsung.">
            <Input name="profile_image" type="url" defaultValue={S.profile_image} placeholder="https://domain.com/logo.png" />
          </Field>
          <Field label="Alamat Toko (Lokasi 1)"><Input name="address" defaultValue={S.address} placeholder="Alamat lengkap toko" /></Field>
          <Field label="Alamat Toko (Lokasi 2) — opsional" hint="Kalau diisi, tampil sebagai lokasi kedua di halaman Tentang dan bisa diklik ke Google Maps.">
            <Input name="address2" defaultValue={S.address2} placeholder="Cabang kedua (kosongkan jika tidak ada)" />
          </Field>
          <Field label="No. Telepon"><Input name="phone" defaultValue={S.phone} placeholder="08xxxxxxxxxx" /></Field>
          <Field label="Contact Admin"><Input name="contact_admin" defaultValue={S.contact_admin} placeholder="Nama admin" /></Field>
          <Field label="WhatsApp" hint="Dipakai untuk tombol Tanya/Pesan di katalog."><Input name="whatsapp" defaultValue={S.whatsapp} placeholder="628xxxxxxxxxx" /></Field>
          <Field label="Instagram"><Input name="instagram" defaultValue={S.instagram} placeholder="https://instagram.com/..." /></Field>
          <Field label="Facebook"><Input name="facebook" defaultValue={S.facebook} placeholder="https://facebook.com/..." /></Field>
          <Field label="TikTok"><Input name="tiktok" defaultValue={S.tiktok} placeholder="https://tiktok.com/@..." /></Field>
        </SettingsForm>
      </Section>

      {/* ---------- Profile saya ---------- */}
      <Section title="Profile Saya" desc="Kelola informasi akun administrator yang sedang login.">
        <SettingsForm action="profile" submitLabel="Update Profile" fieldsClass={GRID}>
          <Field label="Nama"><Input name="name" required defaultValue={user.name} /></Field>
          <Field label="Email"><Input name="email" type="email" defaultValue={user.email} /></Field>
          <Field label="Password Baru" full>
            <Input name="password" type="password" minLength={6} autoComplete="new-password" placeholder="Kosongkan jika tidak ingin mengubah password" />
          </Field>
        </SettingsForm>
      </Section>

      {isSuper && (
        <>
          {/* ---------- Kelola admin ---------- */}
          <Section title="Kelola Admin" desc="Atur role, status, dan password akun administrator.">
            <div className="space-y-2.5">
              {users.map((u) => (
                <details key={u.id} className="group rounded-xl border border-white/10 bg-white/[0.03]">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <span>
                      <span className="font-bold">{u.name || u.username}</span>
                      <span className="ml-2 text-xs text-slate-400">@{u.username}</span>
                    </span>
                    <span className="flex items-center gap-2 text-[11px] font-bold">
                      <span className="rounded-full bg-white/10 px-2.5 py-1">{ROLE_LABEL[u.role] ?? u.role}</span>
                      <span className={`rounded-full px-2.5 py-1 ${u.status === 'active' || !u.status ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                        {u.status ?? 'active'}
                      </span>
                    </span>
                  </summary>
                  <div className="border-t border-white/10 p-4">
                    <SettingsForm action="admin" submitLabel="Simpan Admin" fieldsClass={GRID}>
                      <input type="hidden" name="id" value={u.id} />
                      <Field label="Nama"><Input name="name" defaultValue={u.name ?? ''} /></Field>
                      <Field label="Email"><Input name="email" type="email" defaultValue={u.email ?? ''} /></Field>
                      <Field label="Role">
                        <Select name="role" defaultValue={u.role}>
                          <option value="admin">Admin</option>
                          <option value="verified_admin">Verified Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </Select>
                      </Field>
                      <Field label="Status">
                        <Select name="status" defaultValue={u.status === 'active' || !u.status ? 'active' : 'disabled'}>
                          <option value="active">Active</option>
                          <option value="disabled">Disabled</option>
                        </Select>
                      </Field>
                      <Field label="Password Baru" hint="Kosongkan jika tidak diubah.">
                        <Input name="password" type="password" minLength={6} autoComplete="new-password" />
                      </Field>
                      <label className="flex items-center gap-2.5 self-center text-sm font-bold">
                        <input type="checkbox" name="verified" defaultChecked={Boolean(u.verified)} className="h-4 w-4 accent-cyan-400" />
                        Verified
                      </label>
                    </SettingsForm>
                  </div>
                </details>
              ))}
            </div>
          </Section>

          {/* ---------- Buat admin ---------- */}
          <Section
            title="Buat Akun Admin"
            desc="Jika Bot Telegram aktif, pembuatan akun harus dikonfirmasi dengan kode OTP yang dikirim ke Telegram."
          >
            {pendingActive ? (
              <div>
                <div className="adm-alert-ok">
                  Menunggu konfirmasi OTP untuk akun <b>{pendingActive.data.username}</b>. Kode berlaku 5 menit.
                </div>
                <SettingsForm action="confirm_new_admin" submitLabel="Konfirmasi OTP">
                  <div className="w-full max-w-xs">
                    <Field label="Kode OTP">
                      <Input name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required placeholder="6 digit" />
                    </Field>
                  </div>
                </SettingsForm>
                <SettingsForm action="cancel_new_admin" submitLabel="Batalkan" submitClass="adm-btn mt-3" />
              </div>
            ) : (
              <SettingsForm action="new_admin" submitLabel="Buat Akun" fieldsClass={GRID}>
                <Field label="Username"><Input name="username" required autoComplete="off" /></Field>
                <Field label="Nama"><Input name="name" /></Field>
                <Field label="Email"><Input name="email" type="email" /></Field>
                <Field label="Password (min. 6 karakter)"><Input name="password" type="password" minLength={6} required autoComplete="new-password" /></Field>
              </SettingsForm>
            )}
          </Section>

          {/* ---------- Telegram ---------- */}
          <Section
            title="Integrasi Bot Telegram"
            desc="Bot Token dari @BotFather dan Chat ID dari @userinfobot. Dipakai untuk notifikasi pesanan, error server, dan OTP."
          >
            <SettingsForm action="telegram" submitLabel="Simpan Pengaturan" fieldsClass={GRID}>
              <Field label="Bot Token">
                <Input name="telegram_bot_token" type="password" autoComplete="off" defaultValue={S.telegram_bot_token} placeholder="123456:ABC-DEF..." />
              </Field>
              <Field label="Chat ID">
                <Input name="telegram_chat_id" autoComplete="off" defaultValue={S.telegram_chat_id} placeholder="123456789" />
              </Field>
            </SettingsForm>
            <div className="mt-3">
              <SettingsForm action="telegram_test" submitLabel="Kirim Pesan Tes" submitClass="adm-btn" />
            </div>
          </Section>
        </>
      )}
    </AdminShell>
  );
}
