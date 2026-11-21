const fs = require("fs/promises");
const path = require("path");
const {
  hitungTotalBiaya,
  validasiBerkas,
  generateUniqueFilename,
  validasiTransisiStatus
} = require("../services/orderService");

async function createOrder(req, res, db) {
  const { product_id, extra_option_price = 0, quantity, special_notes = "", payment_method = "transfer" } = req.body;
  const file = req.file;

  const fileCheck = validasiBerkas(file);
  if (!fileCheck.valid) {
    return res.status(400).json({ success: false, message: fileCheck.message });
  }

  const connection = await db.getConnection();
  let savedFilePath = null;

  try {
    await connection.beginTransaction();

    const [products] = await connection.execute(
      "SELECT base_price FROM products WHERE id = ? AND is_active = TRUE",
      [product_id]
    );
    if (products.length === 0) {
      throw new Error("Produk tidak ditemukan atau nonaktif");
    }

    const totalBiaya = hitungTotalBiaya(
      Number(products[0].base_price),
      Number(extra_option_price),
      Number(quantity)
    );

    const uniqueFilename = generateUniqueFilename(file.originalname);
    const uploadDir = path.join(__dirname, "..", "storage", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    savedFilePath = path.join(uploadDir, uniqueFilename);
    await fs.writeFile(savedFilePath, file.buffer);

    const orderCode = `PE-${Date.now()}`;

    await connection.execute(
      `INSERT INTO orders 
       (order_code, user_id, product_id, extra_option_price, quantity, total_price, special_notes, stored_filename, original_filename, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderCode,
        req.user.id,
        product_id,
        Number(extra_option_price),
        Number(quantity),
        totalBiaya,
        special_notes,
        uniqueFilename,
        file.originalname,
        payment_method
      ]
    );

    await connection.commit();
    return res.status(201).json({
      success: true,
      message: "Pesanan berhasil dibuat",
      data: { order_code: orderCode, total_price: totalBiaya }
    });
  } catch (err) {
    await connection.rollback();
    if (savedFilePath) {
      await fs.unlink(savedFilePath).catch(() => {});
    }
    return res.status(400).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
}

async function updateOrderStatus(req, res, db) {
  const { id } = req.params;
  const { status_baru, alasan_batal } = req.body;

  const [rows] = await db.execute("SELECT order_status FROM orders WHERE id = ?", [id]);
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: "Pesanan tidak ditemukan" });
  }

  const check = validasiTransisiStatus(rows[0].order_status, status_baru, alasan_batal);
  if (!check.valid) {
    return res.status(400).json({ success: false, message: check.message });
  }

  await db.execute(
    "UPDATE orders SET order_status = ?, cancel_reason = ? WHERE id = ?",
    [check.status, check.cancelReason, id]
  );

  return res.json({
    success: true,
    message: `Status pesanan diperbarui menjadi ${check.status}`
  });
}

module.exports = { createOrder, updateOrderStatus };
