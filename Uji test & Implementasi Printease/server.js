const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const db = require("./config/database");
const { register, login } = require("./controllers/authController");
const { createOrder, updateOrderStatus } = require("./controllers/orderController");
const { verifyToken } = require("./middlewares/verifyToken");
const { authorizeRole } = require("./middlewares/authMiddleware");
const { MAX_FILE_SIZE } = require("./services/orderService");

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/auth/register", (req, res) => register(req, res, db));
app.post("/api/auth/login", (req, res) => login(req, res, db));

app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, name, material, size_options, base_price FROM products WHERE is_active = TRUE"
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil katalog produk" });
  }
});

app.post(
  "/api/orders",
  verifyToken,
  authorizeRole("customer", "admin"),
  upload.single("design_file"),
  (req, res) => createOrder(req, res, db)
);

app.get("/api/orders/my", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT order_code, quantity, total_price, order_status, payment_status, cancel_reason, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal memuat riwayat pesanan" });
  }
});

app.get(
  "/api/admin/orders",
  verifyToken,
  authorizeRole("admin"),
  async (req, res) => {
    const { status, date } = req.query;
    let sql = `SELECT o.id, o.order_code, u.name AS customer_name, p.name AS product_name,
                      o.quantity, o.total_price, o.special_notes,
                      o.original_filename, o.stored_filename, o.payment_status,
                      o.order_status, o.cancel_reason, o.created_at
               FROM orders o
               JOIN users u ON o.user_id = u.id
               JOIN products p ON o.product_id = p.id
               WHERE 1=1`;
    const params = [];

    if (status) {
      sql += " AND o.order_status = ?";
      params.push(status);
    }
    if (date) {
      sql += " AND DATE(o.created_at) = ?";
      params.push(date);
    }
    sql += " ORDER BY o.created_at DESC";

    try {
      const [rows] = await db.execute(sql, params);
      return res.json({ success: true, data: rows });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Gagal memuat antrean pesanan" });
    }
  }
);

app.patch(
  "/api/admin/orders/:id/status",
  verifyToken,
  authorizeRole("admin"),
  (req, res) => updateOrderStatus(req, res, db)
);

app.patch(
  "/api/admin/orders/:id/payment",
  verifyToken,
  authorizeRole("admin"),
  async (req, res) => {
    const { id } = req.params;
    const { payment_status } = req.body;
    if (!["Terverifikasi", "Ditolak"].includes(payment_status)) {
      return res.status(400).json({ success: false, message: "Status pembayaran tidak valid" });
    }
    try {
      await db.execute("UPDATE orders SET payment_status = ? WHERE id = ?", [payment_status, id]);
      return res.json({ success: true, message: `Status pembayaran diubah menjadi ${payment_status}` });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Gagal memperbarui pembayaran" });
    }
  }
);

app.get(
  "/api/admin/orders/:id/download",
  verifyToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const [rows] = await db.execute(
        "SELECT stored_filename, original_filename FROM orders WHERE id = ?",
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "Berkas tidak ditemukan" });
      }
      const filePath = path.join(__dirname, "storage", "uploads", rows[0].stored_filename);
      return res.download(filePath, rows[0].original_filename);
    } catch (err) {
      return res.status(500).json({ success: false, message: "Gagal mengunduh berkas" });
    }
  }
);

app.use((err, req, res, next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Ukuran berkas melebihi batas maksimum 25 MB"
    });
  }
  next(err);
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server PrintEase berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
