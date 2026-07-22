const express = require('express');
const router = express.Router();
const { getDB } = require('../config/database');

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const { status } = req.query;
        
        let query = `
            SELECT fm.*, u.username as driver_name, u.full_name as driver_full_name
            FROM fleet_management fm
            LEFT JOIN users u ON fm.driver_id = u.id
        `;
        const params = [];
        
        if (status) {
            query += ' WHERE fm.status = $1';
            params.push(status);
        }
        
        query += ' ORDER BY fm.created_at DESC';
        
        const result = await db.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const { vehicle_code, vehicle_type, license_plate, driver_id, status, fuel_level } = req.body;
        const result = await db.query(
            'INSERT INTO fleet_management (vehicle_code, vehicle_type, license_plate, driver_id, status, fuel_level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [vehicle_code, vehicle_type, license_plate, driver_id, status || 'available', fuel_level || 100]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/:id/fuel', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const { fuel_amount, fuel_cost, fuel_station, odometer_reading, performed_by } = req.body;
        
        const result = await db.query(
            'INSERT INTO fuel_logs (vehicle_id, fuel_amount, fuel_cost, fuel_station, odometer_reading, performed_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, fuel_amount, fuel_cost, fuel_station, odometer_reading, performed_by]
        );
        
        // Update vehicle fuel level
        await db.query(
            'UPDATE fleet_management SET fuel_level = $1, last_fuel_date = NOW() WHERE id = $2',
            [req.body.fuel_level || 100, id]
        );
        
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
