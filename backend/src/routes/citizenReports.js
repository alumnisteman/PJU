const express = require('express');
const router = express.Router();
const { getDB } = require('../config/database');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const { status, limit = 50 } = req.query;
        
        let query = `
            SELECT cr.*, a.asset_code, a.name as asset_name
            FROM citizen_reports cr
            LEFT JOIN assets a ON cr.asset_id = a.id
        `;
        const params = [];
        
        if (status) {
            query += ' WHERE cr.status = $1';
            params.push(status);
        }
        
        query += ' ORDER BY cr.created_at DESC LIMIT $' + (params.length + 1);
        params.push(parseInt(limit));
        
        const result = await db.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const {
            report_code, asset_id, reporter_name, reporter_phone, reporter_email,
            issue_type, description, image_url, location_lat, location_lng, address
        } = req.body;
        
        const result = await db.query(
            `INSERT INTO citizen_reports (report_code, asset_id, reporter_name, reporter_phone, reporter_email, issue_type, description, image_url, location_lat, location_lng, address, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'submitted')
             RETURNING *`,
            [report_code, asset_id, reporter_name, reporter_phone, reporter_email, issue_type, description, image_url, location_lat, location_lng, address]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
