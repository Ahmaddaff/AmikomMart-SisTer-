const pool = require('../config/database');

// ========================================
// 1. GET CART (Mengambil Keranjang Aktif)
// ========================================
const getCart = async (req, res) => {
    try {
        const studentId = req.user.student_id;

        const [rows] = await pool.query(
            `
            SELECT
                c.id AS cart_id,
                c.status AS cart_status,
                ci.id AS cart_item_id,
                ci.product_id,
                ci.quantity,
                p.sku,
                p.name,
                p.price,
                p.image_url,
                (p.price * ci.quantity) AS subtotal
            FROM carts c
            JOIN cart_items ci ON c.id = ci.cart_id
            JOIN products p ON ci.product_id = p.id
            WHERE c.student_id = ? AND c.status = 'ACTIVE'
            ORDER BY ci.id ASC
            `,
            [studentId]
        );

        let total = 0;
        rows.forEach(item => {
            total += Number(item.subtotal);
        });

        res.json({
            success: true,
            cart: {
                id: rows.length > 0 ? rows[0].cart_id : null,
                status: rows.length > 0 ? rows[0].cart_status : 'ACTIVE',
                items: rows,
                total
            }
        });

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Gagal mengambil keranjang', 
            error: error.message 
        });
    }
};

// ========================================
// 2. ADD TO CART (Menambah Produk ke Keranjang)
// ========================================
const addToCart = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const studentId = req.user.student_id;
        const { product_id, quantity } = req.body;

        if (!product_id || !quantity) {
            return res.status(400).json({ success: false, message: 'product_id dan quantity wajib diisi' });
        }

        await connection.beginTransaction();

        const [cartRows] = await connection.query(
            `SELECT id FROM carts WHERE student_id = ? AND status = 'ACTIVE' LIMIT 1`,
            [studentId]
        );

        let cartId;
        if (cartRows.length === 0) {
            const [cartResult] = await connection.query(
                `INSERT INTO carts (student_id, status) VALUES (?, 'ACTIVE')`,
                [studentId]
            );
            cartId = cartResult.insertId;
        } else {
            cartId = cartRows[0].id;
        }

        const [itemRows] = await connection.query(
            `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1`,
            [cartId, product_id]
        );

        if (itemRows.length > 0) {
            const newQuantity = itemRows[0].quantity + Number(quantity);
            await connection.query(`UPDATE cart_items SET quantity = ? WHERE id = ?`, [newQuantity, itemRows[0].id]);
        } else {
            await connection.query(
                `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`,
                [cartId, product_id, quantity]
            );
        }

        await connection.commit();
        res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan ke keranjang' });

    } catch (error) {
        await connection.rollback();
        console.error('Add cart error:', error);
        res.status(500).json({ success: false, message: 'Gagal menambah ke keranjang', error: error.message });
    } finally {
        connection.release();
    }
};

// ========================================
// 3. REMOVE FROM CART (Hapus Item dari Keranjang)
// ========================================
const removeFromCart = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const studentId = req.user.student_id;
        const productId = req.params.productId;

        await connection.beginTransaction();

        const [result] = await connection.query(
            `
            DELETE ci
            FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.id
            WHERE c.student_id = ? AND c.status = 'ACTIVE' AND ci.product_id = ?
            `,
            [studentId, productId]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan di keranjang' });
        }

        await connection.commit();
        res.json({ success: true, message: 'Produk berhasil dihapus dari keranjang' });

    } catch (error) {
        await connection.rollback();
        console.error('Remove cart error:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus produk dari keranjang', error: error.message });
    } finally {
        connection.release();
    }
};

// ========================================
// 4. CHECKOUT CART (Telah Disesuaikan dengan ENUM 'CHECKED_OUT')
// ========================================
const checkoutCart = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const studentId = req.user.student_id;

        await connection.beginTransaction();

        const [cartRows] = await connection.query(
            `SELECT id FROM carts WHERE student_id = ? AND status = 'ACTIVE' LIMIT 1`,
            [studentId]
        );

        if (cartRows.length === 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Keranjang belanja Anda kosong' });
        }

        const cartId = cartRows[0].id;

        // Ambil data dari tabel products yang bersesuaian dengan kolom di order_items
        const [cartItems] = await connection.query(
            `
            SELECT ci.product_id, ci.quantity, p.name AS product_name, p.sku, p.price AS unit_price
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
            `,
            [cartId]
        );

        if (cartItems.length === 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Keranjang belanja Anda tidak memiliki produk' });
        }

        // Hitung subtotal tiap item dan total bayar keseluruhan
        let totalAmount = 0;
        const itemsToInsert = cartItems.map(item => {
            const subtotal = Number(item.unit_price) * item.quantity;
            totalAmount += subtotal;
            return { ...item, subtotal };
        });

        // Buat Nomor Pesanan Unik
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `INV-${dateStr}-${randomNum}`;

        // Masukkan transaksi ke tabel orders
        const [orderResult] = await connection.query(
            `INSERT INTO orders (student_id, order_number, total_amount, status, payment_status, fulfillment_type) VALUES (?, ?, ?, 'PENDING', 'UNPAID', 'PICKUP')`,
            [studentId, orderNumber, totalAmount]
        );
        const orderId = orderResult.insertId;

        // Masukkan tiap item ke tabel order_items
        for (const item of itemsToInsert) {
            await connection.query(
                `INSERT INTO order_items (order_id, product_id, product_name, sku, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [orderId, item.product_id, item.product_name, item.sku, item.quantity, item.unit_price, item.subtotal]
            );
        }

        // Ubah status keranjang menjadi CHECKED_OUT (Sesuai ENUM Database)
        await connection.query(`UPDATE carts SET status = 'CHECKED_OUT' WHERE id = ?`, [cartId]);

        await connection.commit();
        res.json({ 
            success: true, 
            message: 'Checkout berhasil!', 
            orderId,
            orderNumber,
            totalAmount 
        });

    } catch (error) {
        await connection.rollback();
        console.error('Checkout error:', error);
        res.status(500).json({ success: false, message: 'Gagal memproses checkout: ' + error.message });
    } finally {
        connection.release();
    }
};

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    checkoutCart
};