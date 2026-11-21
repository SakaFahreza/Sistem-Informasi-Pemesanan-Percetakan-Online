CREATE DATABASE IF NOT EXISTS printease_db;
USE printease_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  material VARCHAR(100) NOT NULL,
  size_options JSON NOT NULL,
  base_price DECIMAL(12, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(30) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  extra_option_price DECIMAL(12, 2) DEFAULT 0,
  quantity INT NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  special_notes TEXT,
  stored_filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  payment_method ENUM('transfer', 'cash_on_pickup') NOT NULL,
  payment_proof_filename VARCHAR(255) NULL,
  payment_status ENUM('Menunggu', 'Terverifikasi', 'Ditolak') DEFAULT 'Menunggu',
  order_status ENUM(
    'Menunggu Pembayaran',
    'Verifikasi Berkas & Pembayaran',
    'Sedang Diproses/Dicetak',
    'Siap Diambil',
    'Selesai',
    'Dibatalkan'
  ) DEFAULT 'Menunggu Pembayaran',
  cancel_reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO products (name, material, size_options, base_price, is_active)
SELECT 'Cetak Dokumen HVS', 'HVS 80gsm', JSON_ARRAY('A4', 'F4', 'A5'), 1500.00, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Cetak Dokumen HVS');

INSERT INTO products (name, material, size_options, base_price, is_active)
SELECT 'Cetak Stiker Vinyl', 'Vinyl Glossy', JSON_ARRAY('A3+', 'Custom'), 15000.00, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Cetak Stiker Vinyl');

INSERT INTO products (name, material, size_options, base_price, is_active)
SELECT 'Cetak Poster', 'Art Paper 260gsm', JSON_ARRAY('A3', 'A2', 'A1'), 12000.00, TRUE
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Cetak Poster');
