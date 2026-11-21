const path = require("path");
const crypto = require("crypto");

const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".zip", ".rar"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/vnd.rar"
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const VALID_STATUS_FLOW = [
  "Menunggu Pembayaran",
  "Verifikasi Berkas & Pembayaran",
  "Sedang Diproses/Dicetak",
  "Siap Diambil",
  "Selesai"
];

function hitungTotalBiaya(hargaDasar, biayaOpsi, jumlahEksemplar) {
  if (typeof hargaDasar !== "number" || typeof biayaOpsi !== "number" || hargaDasar < 0 || biayaOpsi < 0) {
    throw new Error("Harga dasar dan biaya opsi tidak boleh negatif");
  }
  if (!Number.isInteger(jumlahEksemplar) || jumlahEksemplar < 1) {
    throw new Error("Jumlah eksemplar minimal 1");
  }
  return (hargaDasar + biayaOpsi) * jumlahEksemplar;
}

function validasiBerkas(file) {
  if (!file || !file.originalname) {
    return { valid: false, message: "Berkas desain wajib diunggah" };
  }

  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return { valid: false, message: "Format berkas tidak didukung (hanya PDF, PNG, JPG, ZIP, RAR)" };
  }

  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    return { valid: false, message: "Ukuran berkas melebihi batas maksimum 25 MB" };
  }

  return { valid: true, message: "Valid" };
}

function generateUniqueFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const hash = crypto.randomBytes(16).toString("hex");
  return `${Date.now()}_${hash}${ext}`;
}

function validasiTransisiStatus(statusSaatIni, statusBaru, alasanBatal = "") {
  if (statusBaru === "Dibatalkan") {
    if (!alasanBatal || alasanBatal.trim().length < 5) {
      return { valid: false, message: "Alasan pembatalan wajib diisi minimal 5 karakter" };
    }
    return { valid: true, status: "Dibatalkan", cancelReason: alasanBatal.trim() };
  }

  const idxSekarang = VALID_STATUS_FLOW.indexOf(statusSaatIni);
  const idxTujuan = VALID_STATUS_FLOW.indexOf(statusBaru);

  if (idxSekarang === -1 || idxTujuan !== idxSekarang + 1) {
    return { valid: false, message: `Transisi dari "${statusSaatIni}" ke "${statusBaru}" tidak valid` };
  }

  return { valid: true, status: statusBaru, cancelReason: null };
}

module.exports = {
  hitungTotalBiaya,
  validasiBerkas,
  generateUniqueFilename,
  validasiTransisiStatus,
  MAX_FILE_SIZE
};
