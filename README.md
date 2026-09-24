# GEOTAMA COMPUTER — Next.js

Konversi dari PHP + JSON ke **Next.js 15 (App Router)** + **Tailwind CSS**, siap deploy ke **Vercel**.

## Struktur

| PHP lama            | Next.js                                   |
| ------------------- | ----------------------------------------- |
| `index.php`         | `src/app/page.tsx` + `CatalogSection.tsx` |
| `login.php`         | `src/app/login` + `actions/auth.ts`       |
| `dashboard.php`     | `src/app/dashboard`                       |
| `edit.php`          | `src/app/edit` + `actions/products.ts`    |
| `setting.php`       | `src/app/setting` + `actions/settings.ts` |
| `notify.php`        | `src/app/api/notify/route.ts`             |
| `common.php`        | `src/lib/*`                               |
| `data/*.json`       | Data awal (seed) di `data/`, disimpan ke Upstash Redis |

## Kenapa Redis?

Filesystem Vercel **read-only**, jadi `products.json` / `users.json` tidak bisa ditulis lagi.
Data sekarang disimpan di **Upstash Redis** (gratis untuk skala toko). Selama belum ada perubahan,
data dibaca dari `data/*.json`; begitu kamu menyimpan sesuatu dari panel admin, data pindah ke Redis.

## Deploy ke Vercel

1. Push project ke GitHub (**gunakan repo private** — `data/users.json` berisi hash password & email).
2. Vercel → *Add New Project* → import repo.
3. Tab **Storage** → *Create / Connect* **Upstash Redis** (Marketplace). Variabel
   `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (atau `KV_REST_API_*`) terisi otomatis.
4. **Settings → Environment Variables** → tambah `SESSION_SECRET`
   (buat dengan `openssl rand -base64 32`).
5. Deploy. Login dengan akun lama (username & password sama seperti di PHP).

## Jalan lokal

```bash
npm install
cp .env.example .env.local   # isi SESSION_SECRET (opsional untuk dev)
npm run dev
```

Tanpa Redis, data lokal disimpan di folder `.data/` (otomatis, sudah di-gitignore).

## Perubahan penting dari versi PHP

- **Login**: session PHP → cookie JWT httpOnly (12 jam). Hash password PHP (`$2y$`) tetap valid.
  Ditambah pembatasan percobaan login (10x / 5 menit / IP).
- **CSRF**: ditangani otomatis oleh Server Actions Next.js (cek Origin).
- **OTP admin baru**: disimpan di Redis dengan TTL 5 menit (bukan `$_SESSION`), maksimal 5 percobaan.
- **Telegram**: error server otomatis dikirim lewat `instrumentation.ts`. Fallback "matikan verifikasi SSL"
  dihapus (tidak diperlukan di Vercel). Teks dinamis di-escape supaya tidak merusak format Markdown.
- **`/api/notify`**: ditambah rate limit (10x / menit / IP) agar tidak bisa dipakai spam ke Telegram kamu.
- **Redirect `next`**: hanya menerima path internal (mencegah open redirect).
- **Form produk**: ditambah checkbox *Flash Sale* (sebelumnya tidak ada cara mengubahnya dari UI).
- Notice "Akun awal: superadmin / admin123" di halaman login **dihapus**.
- Super admin tidak bisa menurunkan/menonaktifkan akunnya sendiri.

## Tailwind

Tailwind dipakai untuk semua halaman admin. Katalog publik tetap memakai CSS aslinya
(`src/app/catalog.css`) supaya tampilannya identik, karena itu `preflight` dan plugin `container`
Tailwind dimatikan (lihat `tailwind.config.ts`). Class komponen admin diawali `adm-` (di `globals.css`).
