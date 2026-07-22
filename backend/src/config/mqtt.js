const mqtt = require('mqtt');
const logger = require('../utils/logger');
const { getDB } = require('./database');

let mqttClient;

async function connectMQTT() {
    try {
        const mqttUrl = `mqtt://${process.env.MQTT_HOST || 'mosquitto'}:${process.env.MQTT_PORT || 1883}`;
        
        mqttClient = mqtt.connect(mqttUrl, {
            clientId: 'pju-backend-' + Math.random().toString(16).substr(2, 8),
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 1000,
        });

        mqttClient.on('connect', () => {
            logger.info('MQTT Broker connected successfully');
            
            // Subscribe to sensor topics
            mqttClient.subscribe('pju/sensors/+/data', (err) => {
                if (!err) {
                    logger.info('Subscribed to sensor data topics');
                }
            });

            // Subscribe to device status
            mqttClient.subscribe('pju/devices/+/status', (err) => {
                if (!err) {
                    logger.info('Subscribed to device status topics');
                }
            });
        });

        mqttClient.on('message', async (topic, message) => {
            try {
                const data = JSON.parse(message.toString());
                logger.info(`MQTT Message received on ${topic}`, data);
                
                // Process sensor data
                if (topic.includes('/sensors/')) {
                    await processSensorData(topic, data);
                }
                
                // Process device status
                if (topic.includes('/status')) {
                    await processDeviceStatus(topic, data);
                }
            } catch (error) {
                logger.error('Error processing MQTT message:', error);
            }
        });

        mqttClient.on('error', (err) => {
            logger.error('MQTT connection error:', err);
        });

        mqttClient.on('reconnect', () => {
            logger.info('MQTT reconnecting...');
        });

    } catch (error) {
        logger.error('Failed to connect to MQTT broker:', error);
        throw error;
    }
}

async function processSensorData(topic, data) {
    try {
        const db = getDB();
        const assetId = topic.split('/')[2];
        
        // Insert sensor reading into database
        const query = `
            INSERT INTO sensor_readings (time, asset_id, sensor_type, value, unit, status, metadata)
            VALUES (NOW(), $1, $2, $3, $4, $5, $6)
        `;
        
        await db.query(query, [
            assetId,
            data.sensor_type,
            data.value,
            data.unit,
            data.status || 'normal',
            JSON.stringify(data.metadata || {})
        ]);
        
        logger.info(`Sensor data saved for asset ${assetId}`);
    } catch (error) {
        logger.error('Error processing sensor data:', error);
    }
}

async function processDeviceStatus(topic, data) {
    try {
        const db = getDB();
        const assetId = topic.split('/')[2];
        
        // Update asset status based on device status
        const query = `
            UPDATE assets 
            SET status = $1, updated_at = NOW()
            WHERE asset_code = $2
        `;
        
        await db.query(query, [data.status, assetId]);
        
        logger.info(`Device status updated for asset ${assetId}: ${data.status}`);
        
        // If status is failure, create maintenance task automatically
        if (data.status === 'failure') {
            await createMaintenanceTask(assetId, data);
        }
    } catch (error) {
        logger.error('Error processing device status:', error);
    }
}

async function createMaintenanceTask(assetId, deviceData) {
    try {
        const db = getDB();
        
        const taskCode = `MT-${Date.now()}`;
        const query = `
            INSERT INTO maintenance_tasks (task_code, asset_id, title, description, priority, status, scheduled_date)
            VALUES ($1, 
                (SELECT id FROM assets WHERE asset_code = $2),
                $3, $4, $5, $6, NOW() + INTERVAL '1 hour')
        `;
        
        await db.query(query, [
            taskCode,
            assetId,
            `Automatic Maintenance Task - Device Failure`,
            `Device reported failure: ${JSON.stringify(deviceData)}`,
            'high',
            'pending'
        ]);
        
        logger.info(`Automatic maintenance task created for asset ${assetId}`);
    } catch (error) {
        logger.error('Error creating maintenance task:', error);
    }
}

function publishCommand(topic, message) {
    if (mqttClient && mqttClient.connected) {
        mqttClient.publish(topic, JSON.stringify(message));
        logger.info(`Command published to ${topic}`);
    } else {
        logger.warn('MQTT client not connected');
    }
}

function getMQTTClient() {
    return mqttClient;
}

module.exports = {
    connectMQTT,
    publishCommand,
    getMQTTClient
};
