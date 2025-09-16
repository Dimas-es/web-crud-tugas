# Blog CRUD Sederhana (Express + SQLite)

Aplikasi web sederhana untuk CRUD blog (judul dan deskripsi) menggunakan HTML, CSS, JavaScript (vanilla), Express, dan SQLite (better-sqlite3).

## Fitur
- Buat, baca, ubah, hapus post
- UI sederhana tanpa framework
- Database ringan: SQLite (file `blog.db`)

## Prasyarat
- Node.js 18+ terpasang

## Cara Menjalankan
```bash
# Masuk ke folder proyek
cd "/home/dimas/Documents/tugas/tugas awan"

# Install dependensi
npm install

# Jalankan server (development dengan nodemon)
npm run dev
# atau jalankan tanpa nodemon
npm start
```

Akses aplikasi di `http://localhost:3000`.

## Struktur Proyek
```
.
├─ public/
│  ├─ index.html
│  ├─ styles.css
│  └─ app.js
├─ server.js
├─ package.json
└─ blog.db (akan dibuat otomatis saat server berjalan)
```

## Endpoint API
- GET `/api/posts`
- GET `/api/posts/:id`
- POST `/api/posts` (body JSON: `{ "title": string, "description": string }`)
- PUT `/api/posts/:id` (body JSON: `{ "title"?: string, "description"?: string }`)
- DELETE `/api/posts/:id`

## Catatan
- Database SQLite disimpan di file `blog.db` di root proyek.
- Mode WAL diaktifkan untuk stabilitas saat tulis/baca bersamaan.

## Lisensi
MIT
