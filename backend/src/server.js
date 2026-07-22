const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const logger = require('./utils/logger');
const { connectDB, connectTimescaleDB, connectRedis } = require('./config/database');
const { connectMQTT } = require('./config/mqtt');

// Import routes
const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const maintenanceRoutes = require('./routes/maintenance');
const inventoryRoutes = require('./routes/inventory');
const citizenReportRoutes = require('./routes/citizenReports');
const fleetRoutes = require('./routes/fleet');
const dashboardRoutes = require('./routes/dashboard');
const sensorRoutes = require('./routes/sensors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        services: {
            database: 'connected',
            redis: 'connected',
            mqtt: 'connected'
        }
    });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/reports', citizenReportRoutes);
app.use('/api/v1/fleet', fleetRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/sensors', sensorRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Smart PJU Backend API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            api: '/api/v1'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Error:', err);
    res.status(err.status || 500).json({
        error: {
            message: err.message,
            status: err.status || 500
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: 'Endpoint not found',
            status: 404
        }
    });
});

// Initialize connections and start server
async function startServer() {
    try {
        console.log('Starting Smart PJU Backend API...');
        console.log('PORT:', PORT);
        console.log('NODE_ENV:', process.env.NODE_ENV);
        
        // Connect to databases
        console.log('Connecting to databases...');
        await connectDB();
        console.log('PostgreSQL connected');
        
        await connectTimescaleDB();
        console.log('TimescaleDB connected');
        
        await connectRedis();
        console.log('Redis connected');
        
        // Connect to MQTT broker
        console.log('Connecting to MQTT broker...');
        await connectMQTT();
        console.log('MQTT connected');
        
        // Start server
        app.listen(PORT, () => {
            console.log(`Server berjalan pada port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
            logger.info(`Server berjalan pada port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('Gagal start server:', error);
        logger.error('Gagal start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully...');
    process.exit(0);
});

startServer();
