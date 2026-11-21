const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validasiRegistrasi({ name, email, password }) {
  if (!name || name.trim().length < 2) {
    return { valid: false, message: "Nama lengkap wajib diisi minimal 2 karakter" };
  }
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return { valid: false, message: "Format alamat email tidak valid" };
  }
  if (!password || password.length < 8) {
    return { valid: false, message: "Kata sandi minimal 8 karakter" };
  }
  return { valid: true, message: "Valid" };
}

function validasiLogin({ email, password }) {
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return { valid: false, message: "Format email tidak valid" };
  }
  if (!password) {
    return { valid: false, message: "Kata sandi wajib diisi" };
  }
  return { valid: true, message: "Valid" };
}

module.exports = {
  validasiRegistrasi,
  validasiLogin
};
