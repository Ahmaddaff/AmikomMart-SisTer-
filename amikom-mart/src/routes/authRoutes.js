const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

// ==========================================
// 1. RUTE LOGIN MAHASISWA
// ==========================================
router.post('/student/login', async (req, res) => {
    try {
        const { nim } = req.body;

        if (!nim) {
            return res.status(400).json({
                success: false,
                message: 'NIM wajib diisi'
            });
        }

        const [rows] = await pool.query(
            `
            SELECT 
                s.id AS student_id,
                s.nim,
                s.name,
                s.email,
                s.study_program_id,
                sp.name AS study_program_name,
                sp.faculty_id,
                f.name AS faculty_name
            FROM students s
            JOIN study_programs sp ON s.study_program_id = sp.id
            JOIN faculties f ON sp.faculty_id = f.id
            WHERE s.nim = ?
            `,
            [nim]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mahasiswa dengan NIM tersebut tidak ditemukan'
            });
        }

        const student = rows[0];

        const token = jwt.sign(
            { student_id: student.student_id, nim: student.nim },
            process.env.JWT_SECRET || 'amikom_secret_key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login berhasil',
            token,
            student
        });

    } catch (error) {
        console.error('Student login error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
});

// ==========================================
// 2. RUTE LOGIN MERCHANT / PENJUAL
// ==========================================
router.post('/merchant/login', async (req, res) => {
    try {
        const { storeName, password } = req.body;

        if (!storeName || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nama toko dan password wajib diisi'
            });
        }

        // Mencari data merchant berdasarkan nama toko yang dipilih dari dropdown
        const [rows] = await pool.query(
            `SELECT * FROM merchants WHERE name = ?`,
            [storeName]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Toko / Merchant tidak ditemukan di database'
            });
        }

        const merchant = rows[0];

        // Pemetaan password valid khusus untuk pengujian/demo final project
        const validPasswords = {
            'Universitas Amikom Purwokerto': 'UAP123',
            'Fakultas Ilmu Komputer': 'FIK123',
            'Fakultas Bisnis dan Ilmu Sosial': 'FBIS123',
            'Prodi Teknologi Informasi': 'PTI123',
            'Prodi Informatika': 'PIF123',
            'Prodi Sistem Informasi': 'PSI123',
            'Prodi Ilmu Komunikasi': 'PIK123',
            'Prodi Bisnis Digital': 'PBD123',
            'Prodi Manajemen': 'PMJ123',
            'Prodi Hukum': 'PHK123'
        };

        const expectedPassword = validPasswords[merchant.name] || 'AMIKOM2026';

        if (password !== expectedPassword) {
            return res.status(401).json({
                success: false,
                message: 'Password atau sandi salah!'
            });
        }

        const token = jwt.sign(
            { merchant_id: merchant.id, store_name: merchant.name },
            process.env.JWT_SECRET || 'amikom_secret_key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login merchant berhasil',
            token,
            merchant: {
                id: merchant.id,
                name: merchant.name,
                merchant_type: merchant.merchant_type,
                faculty_id: merchant.faculty_id || null,
                study_program_id: merchant.study_program_id || null
            }
        });

    } catch (error) {
        console.error('Merchant login error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
});

module.exports = router;