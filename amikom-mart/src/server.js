const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./config/database');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

// ========================================
// Middleware
// ========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// Static Folder untuk Hasil Upload Produk & Logo Kampus
// ========================================
app.use('/uploads', express.static('D:/Amikom Mart (SISTER)/Hasil Upload Produk'));
app.use('/logo', express.static('D:/Amikom Mart (SISTER)/Logo Amikom'));

// ========================================
// API Routes
// ========================================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// ========================================
// Route Utama & Health Check
// ========================================
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'AMIKOM MART API Berjalan Lancar'
    });
});

app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 AS database_status');
        res.json({
            success: true,
            message: 'API dan MySQL terhubung',
            database: rows[0]
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            message: 'Database tidak terhubung',
            error: error.message
        });
    }
});

// ========================================
// 404 Handler
// ========================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan'
    });
});

// ========================================
// Port Server & Listener
// ========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('====================================');
    console.log('      AMIKOM MART API SERVER        ');
    console.log('====================================');
    console.log(`Server berjalan di : http://localhost:${PORT}`);
    console.log(`Health check       : http://localhost:${PORT}/api/health`);
    console.log(`Auth API           : http://localhost:${PORT}/api/auth`);
    console.log(`Product API        : http://localhost:${PORT}/api/products`);
    console.log(`Cart API           : http://localhost:${PORT}/api/cart`);
    console.log('====================================');
});