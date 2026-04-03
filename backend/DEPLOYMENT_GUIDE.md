# Deployment Guide: Smart Retail POS (Laravel Backend)

Panduan ini akan membantu Anda men-deploy backend Laravel ke layanan gratis seperti **Koyeb** atau **Render**.

## 1. Persiapan Database Online
Laravel membutuhkan database MySQL/PostgreSQL online. Gunakan **Aiven** (aiven.io) atau **TiDB Cloud** untuk database gratis selamanya.
- Buat akun di [Aiven](https://aiven.io/).
- Buat proyek baru dan pilih **MySQL**.
- Simpan informasi: **Host, Port, Database, Username, Password**.

## 2. Persiapan Repositori GitHub
- Pastikan folder `backend` sudah masuk ke repositori GitHub Anda.
- Struktur yang disarankan: Anda bisa membuat repositori terpisah khusus untuk folder `backend`.

## 3. Deploy ke Koyeb (Direkomendasikan)
1. Buat akun di [Koyeb](https://www.koyeb.com/).
2. Hubungkan akun GitHub Anda.
3. Klik **Create App** dan pilih repositori backend Anda.
4. Di bagian **Environment Variables**, tambahkan:
   - `APP_KEY`: (Ambil dari file .env lokal Anda)
   - `APP_ENV`: `production`
   - `APP_DEBUG`: `false`
   - `DB_CONNECTION`: `mysql`
   - `DB_HOST`: (Host dari database online Anda)
   - `DB_PORT`: `3306`
   - `DB_DATABASE`: (Nama database online Anda)
   - `DB_USERNAME`: (Username database online Anda)
   - `DB_PASSWORD`: (Password database online Anda)
5. Klik **Deploy**.

## 4. Konfigurasi Frontend (React)
Setelah backend berhasil di-deploy, Anda akan mendapatkan URL (misal: `https://api-pos-anda.koyeb.app`).
1. Buka file `.env` di folder **frontend** Anda.
2. Ubah `VITE_API_URL` menjadi URL backend baru Anda:
   ```env
   VITE_API_URL=https://api-pos-anda.koyeb.app/api
   ```
3. Deploy frontend Anda ke **Vercel** atau **Netlify**.

## 5. Jalankan Migrasi di Server
Setelah deploy, Anda perlu membuat tabel di database online. Di Koyeb/Render, Anda bisa masuk ke menu **Console** dan jalankan:
```bash
php artisan migrate --force
```

---
**Tips**: Selalu simpan file `.env` Anda dengan aman dan jangan pernah membagikannya ke publik.
