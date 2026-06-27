# 📋 Panduan Setup Undangan Digital — Wahyu & Riski

## Yang Dibutuhkan
- Akun GitHub (gratis) → github.com
- Akun Supabase (gratis) → supabase.com
- Aplikasi Git → git-scm.com
- VS Code (opsional) → code.visualstudio.com

---

## LANGKAH 1 — Setup Supabase (Database)

### 1.1 Buat Akun & Project
1. Buka supabase.com → klik **Start your project**
2. Daftar dengan akun Google
3. Klik **New Project**, isi:
   - Name: `undangan-wahyu-riski`
   - Database Password: buat password kuat, **simpan di notepad**
   - Region: **Southeast Asia (Singapore)**
4. Klik **Create new project** → tunggu ±2 menit

### 1.2 Buat Tabel `ucapan`
1. Di sidebar kiri klik **Table Editor** → **New Table**
2. Table name: `ucapan`
3. **Centang** Enable Row Level Security (RLS)
4. Kolom sudah ada otomatis: `id`, `created_at`
5. Tambah kolom berikut satu per satu dengan klik "+ Add column":

   | Nama Kolom  | Type | Nullable |
   |-------------|------|----------|
   | nama        | text | ✅       |
   | ucapan      | text | ✅       |
   | kehadiran   | text | ✅       |

6. Klik **Save**

### 1.3 Atur Izin Akses (RLS Policy)
1. Di sidebar klik **Authentication** → **Policies**
2. Pilih tabel `ucapan`
3. Klik **New Policy** → **For full customization**

   **Policy 1 — Tamu bisa KIRIM ucapan:**
   - Policy name: `Allow public insert`
   - Allowed operation: INSERT
   - WITH CHECK expression: `true`
   - Klik **Save Policy**

   **Policy 2 — Semua orang bisa LIHAT ucapan:**
   - Policy name: `Allow public select`
   - Allowed operation: SELECT
   - USING expression: `true`
   - Klik **Save Policy**

### 1.4 Ambil API Keys
1. Klik ikon **gear (Settings)** di sidebar → **API**
2. Catat dua hal ini:
   - **Project URL** → contoh: `https://abcdefgh.supabase.co`
   - **anon public key** → string panjang dimulai `eyJ...`

---

## LANGKAH 2 — Isi Konfigurasi di script.js

Buka file `script.js`, ganti baris paling atas:

```javascript
const SUPABASE_URL = 'https://XXXXXXXX.supabase.co';  // ← isi URL Anda
const SUPABASE_KEY = 'eyJXXXXXXXXXXXXXXXXXXXXXXXX';  // ← isi anon key Anda
```

---

## LANGKAH 3 — Upload ke GitHub Pages (Hosting Gratis)

### 3.1 Buat Repository
1. Buka github.com → login → klik **+** → **New repository**
2. Repository name: `undangan-wahyu-riski`
3. Pilih **Public**
4. Klik **Create repository**

### 3.2 Upload via Terminal / Git Bash
Buka terminal di folder ini, jalankan satu per satu:

```bash
git init
git add .
git commit -m "Upload undangan pernikahan Wahyu & Riski"
git remote add origin https://github.com/USERNAME/undangan-wahyu-riski.git
git branch -M main
git push -u origin main
```
> Ganti USERNAME dengan username GitHub Anda

### 3.3 Aktifkan GitHub Pages
1. Di GitHub, buka repository Anda
2. Klik tab **Settings** → scroll ke **Pages**
3. Source: branch **main**, folder **/ (root)**
4. Klik **Save**
5. Tunggu 1–2 menit → URL undangan akan muncul:
   `https://USERNAME.github.io/undangan-wahyu-riski/`

---

## LANGKAH 4 — Cara Kirim Undangan ke Tamu

Format link undangan dengan nama tamu:
```
https://USERNAME.github.io/undangan-wahyu-riski/?to=Nama+Tamu
```

Contoh:
```
https://USERNAME.github.io/undangan-wahyu-riski/?to=Budi+Santoso
https://USERNAME.github.io/undangan-wahyu-riski/?to=Keluarga+Ahmad
```

---

## LANGKAH 5 — Pantau RSVP & Ucapan

1. Buka supabase.com → login → masuk ke project Anda
2. Klik **Table Editor** → pilih tabel `ucapan`
3. Semua data tamu tampil lengkap dengan timestamp
4. Bisa difilter, diurutkan, atau diekspor ke CSV

---

## Batas Free Tier (Lebih dari Cukup untuk Undangan)

| Layanan       | Gratis sampai                        |
|---------------|--------------------------------------|
| GitHub Pages  | Unlimited (public repo)              |
| Supabase DB   | 500MB, 50.000 baris                  |
| Supabase API  | 2GB bandwidth/bulan                  |

---

## Hal Lain yang Perlu Diganti di index.html

- [ ] Nama lengkap mempelai & orang tua
- [ ] Link Instagram mempelai
- [ ] Alamat & link Google Maps
- [ ] Link Google Calendar (parameter `dates` dan `location`)
- [ ] Isi Love Story (tahun, judul, deskripsi)
- [ ] Nomor rekening yang benar (hilangkan XXXX)

Di script.js:
- [ ] `SUPABASE_URL` dan `SUPABASE_KEY`
- [ ] Tanggal pernikahan di fungsi `mulaiCountdown()`
