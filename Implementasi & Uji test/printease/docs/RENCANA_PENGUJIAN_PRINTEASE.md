# Rencana & Test Case Pengujian Sistem PrintEase

## 1. Black-Box Testing per Modul
- **Autentikasi (`FR-AUTH-01` s.d. `FR-AUTH-03`):** Validasi email unik, hashing password, pembatasan akses rute `/api/admin/*` untuk peran `customer`.
- **Katalog & Kalkulasi (`FR-ORD-01` s.d. `FR-ORD-03`):** Tampilan katalog, rumus `(Harga Dasar + Biaya Opsi) x Jumlah Eksemplar`, catatan khusus, dan penolakan jumlah eksemplar `< 1`.
- **Unggah & Validasi Berkas (`FR-UPL-01` s.d. `FR-UPL-03`, `NFR-SEC-01`):** Ekstensi `.pdf`, `.png`, `.jpg`, `.jpeg`, `.zip`, `.rar`; batas ukuran `25 MB`; pengecekan MIME type; penyimpanan nama file unik.
- **Pelacakan Status (`FR-TRK-01` s.d. `FR-TRK-03`):** Siklus status pesanan berurutan dan kewajiban alasan pembatalan saat status `Dibatalkan`.
- **Panel Admin (`FR-ADM-01` s.d. `FR-ADM-04`):** Filter antrean berdasarkan status dan tanggal, unduh berkas desain, verifikasi pembayaran, dan pembaruan status produksi.

## 2. White-Box Testing
- Pengujian cabang logika pada `services/authService.js`, `services/orderService.js`, dan `middlewares/authMiddleware.js` menggunakan `npm test`.
