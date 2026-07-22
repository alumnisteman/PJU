const { Pool } = require('pg');
const Redis = require('redis');
const logger = require('../utils/logger');

// PostgreSQL connection
const pool = new Pool({
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'pju_smart',
    user: process.env.DB_USER || 'pju_admin',
    password: process.env.DB_PASSWORD || 'pju_secure_2024',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// TimescaleDB connection
const timescalePool = new Pool({
    host: process.env.TIMESCALE_HOST || 'timescaledb',
    port: process.env.TIMESCALE_PORT || 5432,
    database: process.env.TIMESCALE_NAME || 'pju_timeseries',
    user: process.env.DB_USER || 'pju_admin',
    password: process.env.DB_PASSWORD || 'pju_secure_2024',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Redis client
let redisClient;

async function connectDB() {
    try {
        await pool.connect();
        logger.info('PostgreSQL connected successfully');
        return pool;
    } catch (error) {
        logger.error('PostgreSQL connection error:', error);
        throw error;
    }
}

async function connectTimescaleDB() {
    try {
        await timescalePool.connect();
        logger.info('TimescaleDB connected successfully');
        return timescalePool;
    } catch (error) {
        logger.error('TimescaleDB connection error:', error);
        throw error;
    }
}

async function connectRedis() {
    try {
        const redisConfig = {
            socket: {
                host: process.env.REDIS_HOST || 'redis',
                port: process.env.REDIS_PORT || 6379,
            }
        };
        
        // Only add password if it's set and not empty
        if (process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.trim() !== '') {
            redisConfig.password = process.env.REDIS_PASSWORD;
        }
        
        console.log('Redis config:', { host: redisConfig.socket.host, port: redisConfig.socket.port, hasPassword: !!redisConfig.password });
        
        redisClient = Redis.createClient(redisConfig);

        redisClient.on('error', (err) => {
            logger.error('Redis Client Error:', err);
        });

        await redisClient.connect();
        logger.info('Redis connected successfully');
        return redisClient;
    } catch (error) {
        logger.error('Redis connection error:', error);
        throw error;
    }
}

function getDB() {
    return pool;
}

function getTimescaleDB() {
    return timescalePool;
}

function getRedis() {
    return redisClient;
}

module.exports = {
    connectDB,
    connectTimescaleDB,
    connectRedis,
    getDB,
    getTimescaleDB,
    getRedis
};
