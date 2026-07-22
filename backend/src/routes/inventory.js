const express = require('express');
const router = express.Router();
const { getDB } = require('../config/database');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const result = await db.query('SELECT * FROM inventory ORDER BY name');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const { item_code, name, category, unit, warehouse_stock, minimum_stock, unit_price } = req.body;
        const result = await db.query(
            'INSERT INTO inventory (item_code, name, category, unit, warehouse_stock, minimum_stock, unit_price) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [item_code, name, category, unit, warehouse_stock, minimum_stock, unit_price]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
