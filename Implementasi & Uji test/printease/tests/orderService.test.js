const test = require("node:test");
const assert = require("node:assert/strict");
const {
  hitungTotalBiaya,
  validasiBerkas,
  validasiTransisiStatus,
  MAX_FILE_SIZE
} = require("../services/orderService");

test("White-Box hitungTotalBiaya() - semua cabang", () => {
  assert.equal(hitungTotalBiaya(15000, 3000, 2), 36000);
  assert.throws(() => hitungTotalBiaya(15000, 3000, 0), /minimal 1/);
  assert.throws(() => hitungTotalBiaya(-1000, 0, 1), /tidak boleh negatif/);
});

test("White-Box validasiBerkas() - ekstensi, MIME, dan batas 25 MB", () => {
  const validPdf = { originalname: "brosur.pdf", mimetype: "application/pdf", size: MAX_FILE_SIZE };
  assert.equal(validasiBerkas(validPdf).valid, true);

  const overSize = { originalname: "brosur.pdf", mimetype: "application/pdf", size: MAX_FILE_SIZE + 1 };
  assert.equal(validasiBerkas(overSize).valid, false);

  const spoofed = { originalname: "virus.png", mimetype: "application/x-msdownload", size: 1024 };
  assert.equal(validasiBerkas(spoofed).valid, false);
});

test("White-Box validasiTransisiStatus() - alur tracking & alasan batal", () => {
  assert.equal(
    validasiTransisiStatus("Menunggu Pembayaran", "Verifikasi Berkas & Pembayaran").valid,
    true
  );
  assert.equal(
    validasiTransisiStatus("Menunggu Pembayaran", "Selesai").valid,
    false
  );
  assert.equal(
    validasiTransisiStatus("Verifikasi Berkas & Pembayaran", "Dibatalkan", "").valid,
    false
  );
  const batalValid = validasiTransisiStatus(
    "Verifikasi Berkas & Pembayaran",
    "Dibatalkan",
    "Resolusi file tidak memenuhi standar cetak"
  );
  assert.equal(batalValid.valid, true);
});
