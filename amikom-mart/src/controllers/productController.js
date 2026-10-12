const pool = require('../config/database');

// 1. Get Products - Mengambil produk sesuai akses hierarki akademik Mahasiswa (Prodi, Fakultas, & Universitas)
const getProducts = async (req, res) => {
    try {
        const studentId = req.user.student_id;

        const [rows] = await pool.query(
            `
            SELECT DISTINCT
                p.id,
                p.sku,
                p.name,
                p.price,
                p.image_url,
                p.status,
                r.access_scope,
                f.name AS target_faculty,
                sp.name AS target_study_program
            FROM students s
            JOIN study_programs student_sp
                ON s.study_program_id = student_sp.id
            JOIN faculties student_f
                ON student_sp.faculty_id = student_f.id

            JOIN product_access_rules r
                ON (
                    r.access_scope = 'ALL_STUDENT'
                    OR (
                        r.access_scope = 'FACULTY'
                        AND r.faculty_id = student_f.id
                    )
                    OR (
                        r.access_scope = 'STUDY_PROGRAM'
                        AND r.study_program_id = student_sp.id
                    )
                )

            JOIN products p
                ON p.id = r.product_id

            LEFT JOIN faculties f
                ON r.faculty_id = f.id

            LEFT JOIN study_programs sp
                ON r.study_program_id = sp.id

            WHERE s.id = ?
              AND p.status = 'PUBLISHED'

            ORDER BY p.id ASC
            `,
            [studentId]
        );

        // Standardisasi URL gambar produk agar dapat dibaca frontend
        const formattedProducts = rows.map(p => ({
            ...p,
            image_url: p.image_url 
                ? (p.image_url.startsWith('http') ? p.image_url : `http://localhost:3000${p.image_url.startsWith('/') ? '' : '/'}${p.image_url}`)
                : null
        }));

        res.json({
            success: true,
            total: formattedProducts.length,
            products: formattedProducts
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil produk',
            error: error.message
        });
    }
};

// 2. Create Product - Otomatis mencocokkan scope & relasi berdasarkan tipe merchant (Prodi / Fakultas / Universitas)
const createProduct = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let { 
            merchant_id, 
            sku, 
            name, 
            price, 
            access_scope, 
            status,
            faculty_id,
            study_program_id 
        } = req.body;

        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // Ambil tipe merchant dari DB
        const [merchantRows] = await connection.query(
            `SELECT * FROM merchants WHERE id = ?`, 
            [merchant_id]
        );

        let targetFacultyId = faculty_id || null;
        let targetStudyProgramId = study_program_id || null;

        if (merchantRows.length > 0) {
            const merchant = merchantRows[0];
            
            if (merchant.merchant_type === 'UNIVERSITY') {
                access_scope = 'ALL_STUDENT';
                targetFacultyId = null;
                targetStudyProgramId = null;
            } else if (merchant.merchant_type === 'FACULTY') {
                access_scope = access_scope || 'FACULTY';
                targetFacultyId = merchant.faculty_id || targetFacultyId;
                targetStudyProgramId = null;
            } else if (merchant.merchant_type === 'STUDY_PROGRAM') {
                access_scope = access_scope || 'STUDY_PROGRAM';
                targetStudyProgramId = merchant.study_program_id || targetStudyProgramId;
                targetFacultyId = merchant.faculty_id || targetFacultyId;
            }
        }

        // Sanitasi scope
        if (access_scope === 'ALL_STUDENT') {
            targetFacultyId = null;
            targetStudyProgramId = null;
        } else if (access_scope === 'FACULTY') {
            targetStudyProgramId = null;
        }

        // Simpan ke tabel products
        const [productResult] = await connection.query(
            `INSERT INTO products (merchant_id, sku, name, price, image_url, status) VALUES (?, ?, ?, ?, ?, ?)`,
            [merchant_id, sku, name, price, imageUrl, status || 'PUBLISHED']
        );

        const productId = productResult.insertId;

        // Simpan aturan akses ke tabel product_access_rules
        await connection.query(
            `INSERT INTO product_access_rules (product_id, access_scope, faculty_id, study_program_id) VALUES (?, ?, ?, ?)`,
            [
                productId, 
                access_scope || 'ALL_STUDENT', 
                targetFacultyId, 
                targetStudyProgramId
            ]
        );

        await connection.commit();
        connection.release();

        res.status(201).json({
            success: true,
            message: 'Produk berhasil ditambahkan!',
            productId
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan produk: ' + error.message,
            error: error.message
        });
    }
};

// 3. Delete Product
const deleteProduct = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const productId = req.params.id;

        await connection.query(`DELETE FROM cart_items WHERE product_id = ?`, [productId]);
        await connection.query(`DELETE FROM product_access_rules WHERE product_id = ?`, [productId]);
        await connection.query(`DELETE FROM products WHERE id = ?`, [productId]);

        await connection.commit();
        connection.release();

        res.json({ success: true, message: 'Produk berhasil dihapus' });
    } catch (error) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ success: false, message: 'Gagal menghapus produk: ' + error.message });
    }
};

module.exports = {
    getProducts,
    createProduct,
    deleteProduct
};