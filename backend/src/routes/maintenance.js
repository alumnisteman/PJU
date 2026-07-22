const express = require('express');
const router = express.Router();
const { getDB } = require('../config/database');
const logger = require('../utils/logger');

// Get all maintenance tasks
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const { status, assigned_technician_id, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT mt.*, a.asset_code, a.name as asset_name, a.location_lat, a.location_lng,
                   u.username as technician_name, u.full_name as technician_full_name
            FROM maintenance_tasks mt
            LEFT JOIN assets a ON mt.asset_id = a.id
            LEFT JOIN users u ON mt.assigned_technician_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 0;
        
        if (status) {
            paramCount++;
            query += ` AND mt.status = $${paramCount}`;
            params.push(status);
        }
        
        if (assigned_technician_id) {
            paramCount++;
            query += ` AND mt.assigned_technician_id = $${paramCount}`;
            params.push(assigned_technician_id);
        }
        
        query += ` ORDER BY mt.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(parseInt(limit), parseInt(offset));
        
        const result = await db.query(query, params);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        logger.error('Error fetching maintenance tasks:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get maintenance task by ID
router.get('/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        
        const query = `
            SELECT mt.*, a.asset_code, a.name as asset_name, a.location_lat, a.location_lng,
                   u.username as technician_name, u.full_name as technician_full_name
            FROM maintenance_tasks mt
            LEFT JOIN assets a ON mt.asset_id = a.id
            LEFT JOIN users u ON mt.assigned_technician_id = u.id
            WHERE mt.id = $1
        `;
        
        const result = await db.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Maintenance task not found' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        logger.error('Error fetching maintenance task:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new maintenance task
router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const {
            task_code, asset_id, assigned_technician_id, title, description,
            priority, status, scheduled_date, created_by
        } = req.body;
        
        const query = `
            INSERT INTO maintenance_tasks (task_code, asset_id, assigned_technician_id, title, description, priority, status, scheduled_date, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        
        const result = await db.query(query, [
            task_code, asset_id, assigned_technician_id, title, description,
            priority || 'medium', status || 'pending', scheduled_date, created_by
        ]);
        
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        logger.error('Error creating maintenance task:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update maintenance task
router.put('/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const {
            assigned_technician_id, title, description, priority, status,
            scheduled_date, started_at, completed_at
        } = req.body;
        
        const query = `
            UPDATE maintenance_tasks 
            SET assigned_technician_id = $1, title = $2, description = $3, priority = $4,
                status = $5, scheduled_date = $6, started_at = $7, completed_at = $8, updated_at = NOW()
            WHERE id = $9
            RETURNING *
        `;
        
        const result = await db.query(query, [
            assigned_technician_id, title, description, priority, status,
            scheduled_date, started_at, completed_at, id
        ]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Maintenance task not found' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        logger.error('Error updating maintenance task:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Complete maintenance task
router.post('/:id/complete', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const { notes, inventory_used } = req.body;
        
        const query = `
            UPDATE maintenance_tasks 
            SET status = 'completed', completed_at = NOW(), updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `;
        
        const result = await db.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Maintenance task not found' });
        }
        
        // Update asset last maintenance date
        if (result.rows[0].asset_id) {
            await db.query(
                'UPDATE assets SET last_maintenance_date = NOW(), updated_at = NOW() WHERE id = $1',
                [result.rows[0].asset_id]
            );
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        logger.error('Error completing maintenance task:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
