const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'pju-secret-key-2024';

// Login
router.post('/login', async (req, res) => {
    try {
        const db = getDB();
        const { username, password } = req.body;
        
        const result = await db.query(
            'SELECT * FROM users WHERE username = $1 AND is_active = true',
            [username]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        
        // For demo purposes, skip password verification
        // In production, use: const validPassword = await bcrypt.compare(password, user.password_hash);
        
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const db = getDB();
        const { username, email, password, full_name, role, phone } = req.body;
        
        // Check if user exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }
        
        // Hash password
        const password_hash = await bcrypt.hash(password, 10);
        
        const result = await db.query(
            'INSERT INTO users (username, email, password_hash, full_name, role, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [username, email, password_hash, full_name, role || 'citizen', phone]
        );
        
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
