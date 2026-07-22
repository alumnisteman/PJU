const express = require('express');
const router = express.Router();
const { getDB, getTimescaleDB } = require('../config/database');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const db = getDB();
        
        // Get asset statistics
        const assetStats = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'active') as active,
                COUNT(*) FILTER (WHERE status = 'maintenance') as maintenance,
                COUNT(*) FILTER (WHERE status = 'failure') as failure
            FROM assets
        `);
        
        // Get maintenance task statistics
        const maintenanceStats = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'pending') as pending,
                COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
                COUNT(*) FILTER (WHERE status = 'completed') as completed
            FROM maintenance_tasks
        `);
        
        // Get citizen report statistics
        const reportStats = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'submitted') as submitted,
                COUNT(*) FILTER (WHERE status = 'resolved') as resolved
            FROM citizen_reports
        `);
        
        // Get fleet statistics
        const fleetStats = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'available') as available,
                COUNT(*) FILTER (WHERE status = 'in_use') as in_use,
                AVG(fuel_level) as avg_fuel_level
            FROM fleet_management
        `);
        
        res.json({
            success: true,
            data: {
                assets: assetStats.rows[0],
                maintenance: maintenanceStats.rows[0],
                reports: reportStats.rows[0],
                fleet: fleetStats.rows[0]
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get recent activities
router.get('/activities', async (req, res) => {
    try {
        const db = getDB();
        const limit = req.query.limit || 10;
        
        // Get recent maintenance tasks
        const maintenanceTasks = await db.query(`
            SELECT mt.task_code, mt.title, mt.status, mt.created_at,
                   a.asset_code, a.name as asset_name
            FROM maintenance_tasks mt
            LEFT JOIN assets a ON mt.asset_id = a.id
            ORDER BY mt.created_at DESC
            LIMIT $1
        `, [limit]);
        
        // Get recent citizen reports
        const citizenReports = await db.query(`
            SELECT cr.report_code, cr.issue_type, cr.status, cr.created_at,
                   cr.reporter_name
            FROM citizen_reports cr
            ORDER BY cr.created_at DESC
            LIMIT $1
        `, [limit]);
        
        res.json({
            success: true,
            data: {
                maintenance_tasks: maintenanceTasks.rows,
                citizen_reports: citizenReports.rows
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
