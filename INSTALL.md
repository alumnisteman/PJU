# Smart PJU System - Panduan Instalasi & Maintenance

## 📋 Daftar Isi

1. [Persyaratan Sistem](#persyaratan-sistem)
2. [Instalasi Otomatis](#instalasi-otomatis)
3. [Instalasi Manual](#instalasi-manual)
4. [Konfigurasi Environment](#konfigurasi-environment)
5. [Deployment Production](#deployment-production)
6. [Maintenance Rutin](#maintenance-rutin)
7. [Troubleshooting](#troubleshooting)
8. [Backup & Restore](#backup--restore)

---

## 🔧 Persyaratan Sistem

### Hardware Minimum
- **CPU**: 2 cores (4 cores recommended)
- **RAM**: 4GB (8GB recommended)
- **Storage**: 20GB (50GB recommended)
- **Network**: 1 Gbps

### Software Requirements
- **Operating System**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 2.20+
- **OpenSSH Client** (untuk remote deployment)

### Port yang Dibutuhkan
- **8080**: Web Server (Frontend)
- **3000**: Backend API
- **5432**: PostgreSQL
- **5433**: TimescaleDB
- **6379**: Redis
- **1883**: MQTT Broker
- **9001**: MQTT WebSockets

---

## 🚀 Instalasi Otomatis

### Script Instalasi (Linux)

Gunakan script instalasi otomatis untuk setup cepat:

```bash
# Clone repository
git clone https://github.com/alumnisteman/PJU.git
cd PJU

# Jalankan script instalasi
chmod +x install.sh
sudo ./install.sh
```

Script ini akan:
- ✅ Install Docker & Docker Compose
- ✅ Setup environment variables
- ✅ Initialize database
- ✅ Start semua services
- ✅ Configure firewall rules
- ✅ Setup health monitoring

---

## 📦 Instalasi Manual

### Step 1: Clone Repository

```bash
git clone https://github.com/alumnisteman/PJU.git
cd PJU
```

### Step 2: Install Docker & Docker Compose

**Ubuntu/Debian:**
```bash
# Update package index
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

**CentOS/RHEL:**
```bash
# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables sesuai kebutuhan
nano .env
```

**Environment Variables:**
```env
# Database Configuration
POSTGRES_USER=pju_admin
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=pju_smart

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
# REDIS_PASSWORD= (kosongkan jika tidak menggunakan password)

# MQTT Configuration
MQTT_HOST=mosquitto
MQTT_PORT=1883
MQTT_USERNAME=
MQTT_PASSWORD=

# Backend API Configuration
NODE_ENV=production
PORT=3000
API_KEY=your_api_key_here

# Web Server Configuration
WEB_PORT=8080
WEB_SSL_PORT=8443
```

### Step 4: Initialize Database

```bash
# Start database services
docker-compose up -d postgres timescaledb redis mosquitto

# Wait for databases to be ready
sleep 15

# Run database initialization
docker-compose exec postgres psql -U pju_admin -d pju_smart -f /docker-entrypoint-initdb.d/init.sql
docker-compose exec timescaledb psql -U pju_admin -d pju_smart -f /docker-entrypoint-initdb.d/timescale-init.sql
```

### Step 5: Build & Start Services

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# Check service status
docker-compose ps
docker-compose logs -f
```

### Step 6: Verify Installation

```bash
# Check health status
curl http://localhost:8080/health

# Check API endpoint
curl http://localhost:8080/api/v1/dashboard/stats

# Check database connection
docker-compose exec postgres psql -U pju_admin -d pju_smart -c "SELECT version();"
```

---

## 🌐 Deployment Production

### Remote Deployment (SSH)

Untuk deployment ke remote server (contoh: 192.168.1.14):

```bash
# Copy files ke remote server
pscp -pw password * root@192.168.1.14:/var/www/pju-smart/

# SSH ke remote server
plink -ssh root@192.168.1.14 -pw password

# Di remote server:
cd /var/www/pju-smart
docker-compose up -d --build
```

### Production Configuration

**1. SSL/TLS Setup:**
```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx.key \
  -out /etc/nginx/ssl/nginx.crt

# Atau gunakan Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

**2. Firewall Configuration:**
```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 3000/tcp
sudo ufw enable

# firewalld (CentOS)
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

**3. Performance Tuning:**
```bash
# Increase file descriptor limit
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Optimize Docker daemon
sudo nano /etc/docker/daemon.json
```
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
```

**4. Auto-restart Configuration:**
```bash
# Setup systemd auto-restart
sudo nano /etc/systemd/system/pju-smart.service
```
```ini
[Unit]
Description=Smart PJU System
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/var/www/pju-smart
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable pju-smart.service
sudo systemctl start pju-smart.service
```

---

## 🔧 Maintenance Rutin

### Daily Tasks

**1. Check Service Health:**
```bash
# Check all containers
docker-compose ps

# Check logs
docker-compose logs --tail=100

# Check health endpoints
curl http://localhost:8080/health
curl http://localhost:3000/health
```

**2. Monitor Resources:**
```bash
# Check container resource usage
docker stats

# Check disk space
df -h

# Check memory usage
free -h
```

### Weekly Tasks

**1. Database Backup:**
```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U pju_admin pju_smart > backup_$(date +%Y%m%d).sql

# Backup TimescaleDB
docker-compose exec timescaledb pg_dump -U pju_admin pju_smart > timescale_backup_$(date +%Y%m%d).sql

# Backup Redis
docker-compose exec redis redis-cli BGSAVE
docker cp pju-redis:/data/dump.rdb redis_backup_$(date +%Y%m%d).rdb
```

**2. Log Rotation:**
```bash
# Rotate Docker logs
docker system prune -a

# Rotate application logs
docker-compose exec backend-api sh -c "truncate -s 0 logs/*.log"
```

**3. Security Updates:**
```bash
# Update Docker images
docker-compose pull
docker-compose up -d

# Update system packages
sudo apt-get update && sudo apt-get upgrade -y
```

### Monthly Tasks

**1. Full System Backup:**
```bash
# Backup entire project directory
tar -czf pju_smart_backup_$(date +%Y%m%d).tar.gz /var/www/pju-smart/

# Backup Docker volumes
docker run --rm -v pju_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_volume_$(date +%Y%m%d).tar.gz /data
```

**2. Performance Review:**
```bash
# Analyze slow queries
docker-compose exec postgres psql -U pju_admin -d pju_smart -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# Check database size
docker-compose exec postgres psql -U pju_admin -d pju_smart -c "SELECT pg_size_pretty(pg_database_size('pju_smart'));"
```

**3. Security Audit:**
```bash
# Scan for vulnerabilities
docker scan pju-smart-backend-api
docker scan pju-smart-pju-web

# Check for exposed ports
nmap -sV localhost
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Container tidak mau start:**
```bash
# Check logs
docker-compose logs backend-api
docker-compose logs pju-web

# Check port conflicts
sudo netstat -tulpn | grep :8080
sudo netstat -tulpn | grep :3000

# Restart specific service
docker-compose restart backend-api
docker-compose restart pju-web
```

**2. Database connection error:**
```bash
# Check if database is running
docker-compose ps postgres timescaledb

# Test connection
docker-compose exec postgres psql -U pju_admin -d pju_smart -c "SELECT 1;"

# Check database logs
docker-compose logs postgres
docker-compose logs timescaledb
```

**3. Redis connection error:**
```bash
# Check Redis status
docker-compose exec redis redis-cli ping

# Check Redis logs
docker-compose logs redis

# Reset Redis if needed
docker-compose exec redis redis-cli FLUSHALL
```

**4. MQTT broker not working:**
```bash
# Check Mosquitto status
docker-compose ps mosquitto

# Test MQTT connection
docker-compose exec mosquitto mosquitto_sub -h localhost -t test -v

# Check Mosquitto logs
docker-compose logs mosquitto
```

**5. Nginx proxy error:**
```bash
# Check Nginx configuration
docker-compose exec pju-web nginx -t

# Reload Nginx
docker-compose exec pju-web nginx -s reload

# Check Nginx logs
docker-compose exec pju-web cat /var/log/nginx/error.log
```

### Emergency Procedures

**1. System Recovery:**
```bash
# Stop all services
docker-compose down

# Restore from backup
docker-compose up -d postgres timescaledb
docker-compose exec -T postgres psql -U pju_admin pju_smart < backup_latest.sql

# Start all services
docker-compose up -d
```

**2. Full Reset:**
```bash
# Stop and remove all containers
docker-compose down -v

# Remove all images
docker rmi $(docker images -q pju-smart-*)

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

---

## 💾 Backup & Restore

### Automated Backup Script

Gunakan script maintenance untuk backup otomatis:

```bash
chmod +x maintenance.sh
sudo ./maintenance.sh backup
```

### Manual Backup

**Database Backup:**
```bash
# PostgreSQL
docker-compose exec postgres pg_dump -U pju_admin pju_smart > backup.sql

# Restore
docker-compose exec -T postgres psql -U pju_admin pju_smart < backup.sql
```

**Volume Backup:**
```bash
# Backup volume
docker run --rm -v pju_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_data.tar.gz /data

# Restore volume
docker run --rm -v pju_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_data.tar.gz -C /
```

### Offsite Backup

```bash
# Upload to remote server
scp backup.sql user@remote-server:/backups/

# Upload to cloud storage (AWS S3)
aws s3 cp backup.sql s3://your-bucket/backups/
```

---

## 📞 Support & Contact

Untuk bantuan tambahan:
- **GitHub Issues**: https://github.com/alumnisteman/PJU/issues
- **Documentation**: https://github.com/alumnisteman/PJU/wiki
- **Email**: support@pju-smart.com

---

## 📝 Changelog

### Version 1.0.0 (2026-07-22)
- Initial release
- Frontend-backend integration
- Docker Compose deployment
- Automated installation scripts
- Production-ready configuration

---

**Last Updated**: 22 Juli 2026  
**Version**: 1.0.0  
**Status**: Production Ready
