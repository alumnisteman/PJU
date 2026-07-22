-- Schema Database Smart PJU System
-- PostgreSQL Initialization Script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'technician', 'supervisor', 'citizen')),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Assets Table (Tiang PJU)
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lng DECIMAL(11, 8) NOT NULL,
    address TEXT,
    zone VARCHAR(50),
    lamp_type VARCHAR(50) NOT NULL,
    power_rating INTEGER NOT NULL,
    installation_date DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'maintenance', 'failure')),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Tasks Table
CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_code VARCHAR(50) UNIQUE NOT NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    assigned_technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    warehouse_stock INTEGER DEFAULT 0,
    vehicle_stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    unit_price DECIMAL(15, 2),
    supplier VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Transactions
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('in', 'out', 'transfer')),
    quantity INTEGER NOT NULL,
    reference_id UUID,
    reference_type VARCHAR(50),
    notes TEXT,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Citizen Reports Table
CREATE TABLE IF NOT EXISTS citizen_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_code VARCHAR(50) UNIQUE NOT NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    reporter_name VARCHAR(100),
    reporter_phone VARCHAR(20),
    reporter_email VARCHAR(100),
    issue_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    address TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('submitted', 'verified', 'assigned', 'in_progress', 'resolved', 'rejected')),
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_task_id UUID REFERENCES maintenance_tasks(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fleet Management Table
CREATE TABLE IF NOT EXISTS fleet_management (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_code VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    driver_id UUID REFERENCES users(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'in_use', 'maintenance', 'out_of_service')),
    current_location_lat DECIMAL(10, 8),
    current_location_lng DECIMAL(11, 8),
    fuel_level INTEGER CHECK (fuel_level >= 0 AND fuel_level <= 100),
    last_fuel_date DATE,
    last_maintenance_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fuel Logs Table
CREATE TABLE IF NOT EXISTS fuel_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES fleet_management(id) ON DELETE CASCADE,
    fuel_amount DECIMAL(10, 2) NOT NULL,
    fuel_cost DECIMAL(15, 2) NOT NULL,
    fuel_station VARCHAR(100),
    odometer_reading INTEGER,
    performed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle Inspection Table
CREATE TABLE IF NOT EXISTS vehicle_inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES fleet_management(id) ON DELETE CASCADE,
    inspector_id UUID REFERENCES users(id),
    inspection_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('passed', 'failed', 'needs_repair')),
    findings TEXT,
    action_required TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Technician Attendance Table
CREATE TABLE IF NOT EXISTS technician_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    technician_id UUID REFERENCES users(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'half_day')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transaction History Table
CREATE TABLE IF NOT EXISTS transaction_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_code VARCHAR(50) UNIQUE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type VARCHAR(50),
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Security Logs Table
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) CHECK (status IN ('success', 'failure')),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- API Integration Logs Table
CREATE TABLE IF NOT EXISTS api_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint VARCHAR(200) NOT NULL,
    method VARCHAR(10) NOT NULL,
    request_body JSONB,
    response_status INTEGER,
    response_time_ms INTEGER,
    ip_address VARCHAR(45),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_assets_location ON assets(location_lat, location_lng);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_maintenance_tasks_asset ON maintenance_tasks(asset_id);
CREATE INDEX idx_maintenance_tasks_technician ON maintenance_tasks(assigned_technician_id);
CREATE INDEX idx_maintenance_tasks_status ON maintenance_tasks(status);
CREATE INDEX idx_maintenance_tasks_scheduled ON maintenance_tasks(scheduled_date);
CREATE INDEX idx_citizen_reports_asset ON citizen_reports(asset_id);
CREATE INDEX idx_citizen_reports_status ON citizen_reports(status);
CREATE INDEX idx_citizen_reports_date ON citizen_reports(created_at);
CREATE INDEX idx_fleet_management_status ON fleet_management(status);
CREATE INDEX idx_technician_attendance_date ON technician_attendance(attendance_date);
CREATE INDEX idx_technician_attendance_technician ON technician_attendance(technician_id);
CREATE INDEX idx_security_logs_user ON security_logs(user_id);
CREATE INDEX idx_security_logs_created ON security_logs(created_at);
CREATE INDEX idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX idx_api_logs_created ON api_logs(created_at);

-- Insert default admin user
INSERT INTO users (username, email, password_hash, full_name, role, phone) 
VALUES (
    'admin', 
    'admin@pju-ternate.go.id', 
    '$2b$10$YourHashedPasswordHere', 
    'System Administrator', 
    'admin', 
    '+6281234567890'
) ON CONFLICT (username) DO NOTHING;

-- Insert sample assets
INSERT INTO assets (asset_code, name, location_lat, location_lng, address, zone, lamp_type, power_rating, installation_date, status) 
VALUES 
    ('PJU-001', 'Tiang PJU Jalan Soekarno Hatta', 0.8333, 127.3167, 'Jalan Soekarno Hatta No. 1', 'Zone A', 'LED 150W', 150, '2023-01-15', 'active'),
    ('PJU-002', 'Tiang PJU Jalan Ahmad Yani', 0.8345, 127.3178, 'Jalan Ahmad Yani No. 25', 'Zone A', 'LED 100W', 100, '2023-02-20', 'active'),
    ('PJU-003', 'Tiang PJU Jalan Diponegoro', 0.8356, 127.3189, 'Jalan Diponegoro No. 50', 'Zone B', 'LED 200W', 200, '2023-03-10', 'maintenance')
ON CONFLICT (asset_code) DO NOTHING;

-- Insert sample inventory
INSERT INTO inventory (item_code, name, category, unit, warehouse_stock, vehicle_stock, minimum_stock, unit_price, supplier) 
VALUES 
    ('LAMP-LED-150', 'Lampu LED 150W', 'Lampu', 'unit', 50, 10, 20, 2500000, 'PT Cahaya Terang'),
    ('LAMP-LED-100', 'Lampu LED 100W', 'Lampu', 'unit', 80, 15, 30, 1800000, 'PT Cahaya Terang'),
    ('FUSE-10A', 'Fuse 10A', 'Komponen', 'unit', 200, 50, 100, 15000, 'PT Elektronik Jaya'),
    ('CABLE-50M', 'Kabel 50 Meter', 'Kabel', 'roll', 30, 5, 10, 500000, 'PT Kabel Nusantara')
ON CONFLICT (item_code) DO NOTHING;

-- Insert sample fleet
INSERT INTO fleet_management (vehicle_code, vehicle_type, license_plate, status, fuel_level) 
VALUES 
    ('VH-001', 'Truck Maintenance', 'PL 1234 AB', 'available', 85),
    ('VH-002', 'Van Utility', 'PL 5678 CD', 'in_use', 60),
    ('VH-003', 'Motorcycle', 'PL 9012 EF', 'available', 95)
ON CONFLICT (vehicle_code) DO NOTHING;
