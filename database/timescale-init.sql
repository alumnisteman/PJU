-- TimescaleDB Initialization for Time-series Sensor Data
-- Smart PJU System Sensor Data Schema

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Sensor Readings Table (Hypertable for time-series data)
CREATE TABLE IF NOT EXISTS sensor_readings (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    asset_id VARCHAR(50) NOT NULL,
    sensor_type VARCHAR(50) NOT NULL,
    value DECIMAL(15, 4) NOT NULL,
    unit VARCHAR(20),
    status VARCHAR(20) CHECK (status IN ('normal', 'warning', 'critical', 'offline')),
    metadata JSONB
);

-- Convert to hypertable
SELECT create_hypertable('sensor_readings', 'time', if_not_exists => TRUE);

-- Create indexes
CREATE INDEX idx_sensor_readings_asset_time ON sensor_readings(asset_id, time DESC);
CREATE INDEX idx_sensor_readings_sensor_type ON sensor_readings(sensor_type, time DESC);

-- Energy Consumption Table
CREATE TABLE IF NOT EXISTS energy_consumption (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    asset_id VARCHAR(50) NOT NULL,
    voltage DECIMAL(10, 2),
    current DECIMAL(10, 2),
    power_kw DECIMAL(10, 4),
    energy_kwh DECIMAL(15, 6),
    power_factor DECIMAL(5, 4),
    metadata JSONB
);

SELECT create_hypertable('energy_consumption', 'time', if_not_exists => TRUE);

CREATE INDEX idx_energy_consumption_asset_time ON energy_consumption(asset_id, time DESC);

-- Create continuous aggregates for hourly averages
CREATE MATERIALIZED VIEW IF NOT EXISTS energy_hourly
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 hour', time) AS bucket,
    asset_id,
    AVG(voltage) AS avg_voltage,
    AVG(current) AS avg_current,
    AVG(power_kw) AS avg_power_kw,
    SUM(energy_kwh) AS total_energy_kwh
FROM energy_consumption
GROUP BY bucket, asset_id;

-- Create continuous aggregates for daily summaries
CREATE MATERIALIZED VIEW IF NOT EXISTS energy_daily
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 day', time) AS bucket,
    asset_id,
    AVG(voltage) AS avg_voltage,
    AVG(current) AS avg_current,
    AVG(power_kw) AS avg_power_kw,
    SUM(energy_kwh) AS total_energy_kwh,
    MIN(voltage) AS min_voltage,
    MAX(voltage) AS max_voltage
FROM energy_consumption
GROUP BY bucket, asset_id;

-- Set retention policy (90 days)
SELECT add_retention_policy('sensor_readings', INTERVAL '90 days');
SELECT add_retention_policy('energy_consumption', INTERVAL '90 days');
