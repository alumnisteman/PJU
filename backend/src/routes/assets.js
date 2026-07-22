const express = require('express');
const router = express.Router();
const { getDB, getRedis } = require('../config/database');
const logger = require('../utils/logger');

// Get all assets
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const { status, zone, limit = 50, offset = 0 } = req.query;
        
        let query = 'SELECT * FROM assets WHERE 1=1';
        const params = [];
        let paramCount = 0;
        
        if (status) {
            paramCount++;
            query += ` AND status = $${paramCount}`;
            params.push(status);
        }
        
        if (zone) {
            paramCount++;
            query += ` AND zone = $${paramCount}`;
            params.push(zone);
        }
        
        query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(parseInt(limit), parseInt(offset));
        
        const result = await db.query(query, params);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        logger.error('Error fetching assets:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get asset by ID
router.get('/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        
        const result = await db.query('SELECT * FROM assets WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Asset not found' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        logger.error('Error fetching asset:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new asset
router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const {
            asset_code, name, location_lat, location_lng, address, zone,
            lamp_type, power_rating, installation_date, status
        } = req.body;
        
        const query = `
            INSERT INTO assets (asset_code, name, location_lat, location_lng, address, zone, lamp_type, power_rating, installation_date, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        
        const result = await db.query(query, [
            asset_code, name, location_lat, location_lng, address, zone,
            lamp_type, power_rating, installation_date, status || 'active'
        ]);
        
        // Clear cache
        const redis = getRedis();
        await redis.del('assets:all');
        
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        logger.error('Error creating asset:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update asset
router.put('/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const {
            name, location_lat, location_lng, address, zone,
            lamp_type, power_rating, status, last_maintenance_date, next_maintenance_date
        } = req.body;
        
        const query = `
            UPDATE assets 
            SET name = $1, location_lat = $2, location_lng = $3, address = $4, zone = $5,
                lamp_type = $6, power_rating = $7, status = $8, last_maintenance_date = $9,
                next_maintenance_date = $10, updated_at = NOW()
            WHERE id = $11
            RETURNING *
        `;
        
        const result = await db.query(query, [
            name, location_lat, location_lng, address, zone, lamp_type, power_rating,
            status, last_maintenance_date, next_maintenance_date, id
        ]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Asset not found' });
        }
        
        // Clear cache
        const redis = getRedis();
        await redis.del('assets:all');
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        logger.error('Error updating asset:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete asset
router.delete('/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        
        const result = await db.query('DELETE FROM assets WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Asset not found' });
        }
        
        // Clear cache
        const redis = getRedis();
        await redis.del('assets:all');
        
        res.json({ success: true, message: 'Asset deleted successfully' });
    } catch (error) {
        logger.error('Error deleting asset:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
