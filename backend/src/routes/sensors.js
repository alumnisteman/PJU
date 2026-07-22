const express = require('express');
const router = express.Router();
const { getTimescaleDB } = require('../config/database');

// Get sensor readings for an asset
router.get('/:assetId', async (req, res) => {
    try {
        const db = getTimescaleDB();
        const { assetId } = req.params;
        const { sensor_type, limit = 100, hours = 24 } = req.query;
        
        let query = `
            SELECT * FROM sensor_readings 
            WHERE asset_id = $1 AND time > NOW() - INTERVAL '${hours} hours'
        `;
        const params = [assetId];
        
        if (sensor_type) {
            query += ' AND sensor_type = $2';
            params.push(sensor_type);
        }
        
        query += ' ORDER BY time DESC LIMIT $' + (params.length + 1);
        params.push(parseInt(limit));
        
        const result = await db.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get energy consumption data
router.get('/:assetId/energy', async (req, res) => {
    try {
        const db = getTimescaleDB();
        const { assetId } = req.params;
        const { hours = 24 } = req.query;
        
        const query = `
            SELECT * FROM energy_consumption 
            WHERE asset_id = $1 AND time > NOW() - INTERVAL '${hours} hours'
            ORDER BY time DESC
        `;
        
        const result = await db.query(query, [assetId]);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get hourly energy summary
router.get('/:assetId/energy/hourly', async (req, res) => {
    try {
        const db = getTimescaleDB();
        const { assetId } = req.params;
        const { days = 7 } = req.query;
        
        const query = `
            SELECT * FROM energy_hourly 
            WHERE asset_id = $1 AND bucket > NOW() - INTERVAL '${days} days'
            ORDER BY bucket DESC
        `;
        
        const result = await db.query(query, [assetId]);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
