const pool = require('../config/database');
const jwt = require('jsonwebtoken');

const studentLogin = async (req, res) => {
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
};

// Fungsi-fungsi lain yang sudah ada (login merchant, dll.) dapat diletakkan di sini
const login = async (req, res) => {
    // ... logic login merchant/lainnya jika ada
};

const merchantLogin = async (req, res) => {
    // ... logic merchant login jika ada
};

const parseNIM = async (req, res) => {
    // ... logic parse jika ada
};

module.exports = {
    studentLogin,
    login,
    merchantLogin,
    parseNIM 
};