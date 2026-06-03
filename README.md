# Manajemen Dokumen Banpang

Aplikasi web untuk pengelolaan dokumen Banpang yang dilengkapi dengan autentikasi pengguna, manajemen data, dan fitur tanda tangan digital.

---

## Tech Stack

* **Next.js 15** — Framework full-stack React
* **Prisma ORM + Neon** — Database PostgreSQL serverless
* **NextAuth.js v5** — Sistem autentikasi
* **TanStack Query & Table** — Data fetching dan tabel interaktif
* **Tailwind CSS** — Styling
* **react-signature-canvas** — Fitur tanda tangan digital

---

## Panduan Instalasi

### 1. Clone Repository

```bash
git clone <url-repository>
cd manajemen-dokumen-banpang
```

---

### 2. Install Dependencies

Pastikan **Node.js versi 18 atau lebih baru** sudah terpasang.

```bash
npm install
```

---

### 3. Buat File Environment

Buat file `.env` di root project:

```bash
touch .env
```

Isi file `.env` dengan konfigurasi berikut:

```env
# Neon - Connection Pooling
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15"

# Neon - Direct Connection (untuk migrasi Prisma)
DIRECT_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&connect_timeout=15"

# NextAuth Secret
AUTH_SECRET="isi-dengan-random-string"
```

---

### 4. Setup Database Neon

1. Buka https://console.neon.tech
2. Buat akun atau login ke Neon.
3. Klik **New Project** dan buat project baru.
4. Setelah project berhasil dibuat, buka menu **Connection Details** atau **Connection String**.
5. Salin connection string yang menggunakan **Connection Pooling** dan masukkan ke variabel `DATABASE_URL` pada file .env.
6. Nonaktifkan opsi **Connection Pooling**, lalu salin connection string yang baru dan masukkan ke variabel `DIRECT_URL` pada file .env.

Contoh format connection string:

```txt
postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

### Generate AUTH_SECRET

Gunakan salah satu perintah berikut:

#### Linux / macOS

```bash
openssl rand -base64 32
```

#### Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Salin hasilnya ke variabel `AUTH_SECRET` pada file .env.

---

### 5. Sinkronkan Schema Database

Jalankan perintah berikut untuk membuat tabel sesuai schema Prisma:

```bash
npm run db:push
```

---

### 6. Seed Akun Superadmin

```bash
npm run db:seed
```

Akun superadmin default yang akan dibuat:

| Field    | Value                  |
| -------- | ---------------------- |
| Email    | `superadmin@admin.com` |
| Password | `superadmin123`        |

> ⚠️ Demi keamanan, segera ubah password superadmin setelah login pertama.

---

### 7. Menjalankan Aplikasi

```bash
npm run dev
```

Aplikasi dapat diakses melalui:

```txt
http://localhost:3000
```

---

## Deploy ke Vercel

1. Push project ke GitHub.
2. Login ke Vercel.
3. Klik **Add New Project** → **Import Repository**.
4. Tambahkan Environment Variables berikut:

```env
DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
```

5. Klik **Deploy**.

---

## Perintah yang Tersedia

```bash
# Development
npm run dev

# Production Build
npm run build

# Menjalankan hasil build
npm run start

# Sinkronisasi schema Prisma
npm run db:push

# Seed data awal
npm run db:seed

# Prisma Studio
npm run db:studio
```

---

## Catatan

* Jangan commit file `.env` ke repository.
* Pastikan variabel `DATABASE_URL`, `DIRECT_URL`, dan `AUTH_SECRET` telah terisi sebelum menjalankan aplikasi.
* Untuk deployment di Vercel, gunakan nilai environment yang sama dengan environment lokal.
