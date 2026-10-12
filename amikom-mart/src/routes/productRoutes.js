const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getProducts, createProduct, deleteProduct } = require('../controllers/productController');
const authenticateToken = require('../middleware/authMiddleware');
const pool = require('../config/database');

const router = express.Router();

// Tentukan direktori penyimpanan absolut
const uploadDir = 'D:/Amikom Mart (SISTER)/Hasil Upload Produk';

// Pastikan folder otomatis dibuat jika belum ada
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi penyimpanan Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// ==========================================
// RUTE PRODUK
// ==========================================

// Route untuk Mahasiswa (Katalog Terfilter berdasarkan Hak Akses)
router.get('/', authenticateToken, getProducts);

// Route untuk Merchant (Tambah produk & Upload Foto)
router.post('/', authenticateToken, upload.single('image'), createProduct);

// Route untuk Merchant (Hapus produk)
router.delete('/:id', authenticateToken, deleteProduct);

// Route untuk Mengambil Produk Milik Merchant Tertentu
router.get('/merchant/:merchant_id', async (req, res) => {
    try {
        const { merchant_id } = req.params;
        const [products] = await pool.query(
            `SELECT * FROM products WHERE merchant_id = ? ORDER BY id DESC`,
            [merchant_id]
        );
        res.json({
            success: true,
            total: products.length,
            products
        });
    } catch (error) {
        console.error('Get merchant products error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil katalog produk: ' + error.message
        });
    }
});

module.exports = router;