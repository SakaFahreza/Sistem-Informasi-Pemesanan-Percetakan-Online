# PrintEase - Sistem Informasi dan Pemesanan Percetakan Online

[![PrintEase Unit Tests](https://github.com/SakaFahreza/Sistem-Informasi-Pemesanan-Percetakan-Online/Implementasi-&-Uji-test/printease/actions/workflows/test.yml/badge.svg)](https://github.com/SakaFahreza/Sistem-Informasi-Pemesanan-Percetakan-Online/Implementasi-&-Uji-test/printease/actions/workflows/test.yml)

Sistem informasi dan pemesanan jasa percetakan berbasis web dengan arsitektur **MVC (Node.js + Express + MySQL)**, autentikasi **Bcrypt + JWT**, kontrol akses berbasis peran (**RBAC**), serta *automated unit testing*.

## Struktur Folder
- `config/` : Koneksi database MySQL (`database.js`)
- `controllers/` : Handler request/response (`authController.js`, `orderController.js`)
- `middlewares/` : Autentikasi JWT (`verifyToken.js`) & RBAC (`authMiddleware.js`)
- `public/` : Antarmuka web pelanggan & panel operator/admin (`index.html`)
- `services/` : Logika bisnis & validasi murni (`authService.js`, `orderService.js`)
- `tests/` : Automated unit test (`authService.test.js`, `orderService.test.js`)
- `docs/` : Dokumen rencana & test case pengujian (`RENCANA_PENGUJIAN_PRINTEASE.md`)
- `.github/workflows/` : GitHub Actions CI untuk menjalankan `node --test` otomatis

## Menjalankan di Lokal (VS Code)
1. Import `schema.sql` ke MySQL (XAMPP) dan sesuaikan kredensial di `.env`.
2. Jalankan perintah berikut di terminal:
   ```bash
   npm install
   npm test
   npm start
   ```
3. Buka `http://localhost:3000` di browser.
