const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 1. Endpoint untuk mengambil semua Fakultas
router.get('/faculties', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, code, name FROM faculties ORDER BY name ASC');
        res.json({ success: true, faculties: rows });
    } catch (error) {
        console.error('Get faculties error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Endpoint untuk mengambil semua Program Studi
router.get('/study-programs', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT sp.id, sp.faculty_id, sp.code, sp.name, f.name AS faculty_name 
            FROM study_programs sp
            LEFT JOIN faculties f ON sp.faculty_id = f.id
            ORDER BY sp.name ASC
        `);
        res.json({ success: true, study_programs: rows });
    } catch (error) {
        console.error('Get study programs error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;