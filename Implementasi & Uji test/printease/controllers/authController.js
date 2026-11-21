const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validasiRegistrasi, validasiLogin } = require("../services/authService");

const SALT_ROUNDS = 10;

async function register(req, res, db) {
  const { name, email, password, role } = req.body;

  const check = validasiRegistrasi({ name, email, password });
  if (!check.valid) {
    return res.status(400).json({ success: false, message: check.message });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const assignedRole = role === "admin" ? "admin" : "customer";

  try {
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Alamat email sudah terdaftar"
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await db.execute(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name.trim(), normalizedEmail, passwordHash, assignedRole]
    );

    return res.status(201).json({
      success: true,
      message: `Registrasi akun (${assignedRole}) berhasil`,
      data: {
        id: result.insertId,
        name: name.trim(),
        email: normalizedEmail,
        role: assignedRole
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
}

async function login(req, res, db) {
  const { email, password } = req.body;

  const check = validasiLogin({ email, password });
  if (!check.valid) {
    return res.status(400).json({ success: false, message: check.message });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const [users] = await db.execute(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: "Email atau kata sandi salah" });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Email atau kata sandi salah" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET || "dev_secret_key",
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      message: "Login berhasil",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
  }
}

module.exports = {
  register,
  login
};
