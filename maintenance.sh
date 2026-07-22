#!/bin/bash

# Smart PJU System - Maintenance Script
# Version: 1.0.0
# Author: PJU Development Team

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
INSTALL_DIR="/var/www/pju-smart"
BACKUP_DIR="/var/backups/pju-smart"
DATE=$(date +%Y%m%d_%H%M%S)

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        print_error "Please run as root (use sudo)"
        exit 1
    fi
}

# Change to project directory
cd_project() {
    if [ -d "$INSTALL_DIR" ]; then
        cd "$INSTALL_DIR"
        print_success "Changed to project directory: $INSTALL_DIR"
    else
        print_error "Project directory not found: $INSTALL_DIR"
        exit 1
    fi
}

# Create backup directory
create_backup_dir() {
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$BACKUP_DIR/database"
    mkdir -p "$BACKUP_DIR/volumes"
    mkdir -p "$BACKUP_DIR/logs"
    print_success "Backup directory created: $BACKUP_DIR"
}

# Health Check
health_check() {
    print_header "System Health Check"
    
    print_info "Checking Docker services..."
    docker-compose ps
    
    print_info "Checking container health..."
    HEALTHY=$(docker-compose ps | grep -c "healthy" || true)
    TOTAL=$(docker-compose ps | wc -l)
    print_info "Healthy containers: $HEALTHY/$TOTAL"
    
    print_info "Testing web server..."
    if curl -s http://localhost:8080/health > /dev/null; then
        print_success "Web server is healthy"
    else
        print_error "Web server health check failed"
    fi
    
    print_info "Testing API endpoint..."
    if curl -s http://localhost:8080/api/v1/dashboard/stats > /dev/null; then
        print_success "API endpoint is healthy"
    else
        print_error "API endpoint health check failed"
    fi
    
    print_info "Checking disk space..."
    df -h | grep -E "Filesystem|/$"
    
    print_info "Checking memory usage..."
    free -h
    
    print_info "Checking Docker resource usage..."
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

# Database Backup
backup_database() {
    print_header "Database Backup"
    
    create_backup_dir
    
    print_info "Backing up PostgreSQL..."
    docker-compose exec -T postgres pg_dump -U pju_admin pju_smart > "$BACKUP_DIR/database/postgres_$DATE.sql"
    print_success "PostgreSQL backup completed"
    
    print_info "Backing up TimescaleDB..."
    docker-compose exec -T timescaledb pg_dump -U pju_admin pju_smart > "$BACKUP_DIR/database/timescale_$DATE.sql"
    print_success "TimescaleDB backup completed"
    
    print_info "Backing up Redis..."
    docker-compose exec redis redis-cli BGSAVE
    sleep 2
    docker cp pju-redis:/data/dump.rdb "$BACKUP_DIR/database/redis_$DATE.rdb"
    print_success "Redis backup completed"
    
    print_info "Compressing backups..."
    tar -czf "$BACKUP_DIR/database/database_backup_$DATE.tar.gz" "$BACKUP_DIR/database"/*.sql "$BACKUP_DIR/database"/*.rdb
    rm "$BACKUP_DIR/database"/*.sql "$BACKUP_DIR/database"/*.rdb
    print_success "Backups compressed"
    
    print_info "Cleaning old backups (keeping last 7 days)..."
    find "$BACKUP_DIR/database" -name "database_backup_*.tar.gz" -mtime +7 -delete
    print_success "Old backups cleaned"
}

# Volume Backup
backup_volumes() {
    print_header "Docker Volumes Backup"
    
    create_backup_dir
    
    print_info "Backing up PostgreSQL volume..."
    docker run --rm -v pju_postgres_data:/data -v "$BACKUP_DIR/volumes":/backup alpine tar czf "/backup/postgres_volume_$DATE.tar.gz" /data
    print_success "PostgreSQL volume backup completed"
    
    print_info "Backing up TimescaleDB volume..."
    docker run --rm -v pju_timescaledb_data:/data -v "$BACKUP_DIR/volumes":/backup alpine tar czf "/backup/timescale_volume_$DATE.tar.gz" /data
    print_success "TimescaleDB volume backup completed"
    
    print_info "Backing up Redis volume..."
    docker run --rm -v pju_redis_data:/data -v "$BACKUP_DIR/volumes":/backup alpine tar czf "/backup/redis_volume_$DATE.tar.gz" /data
    print_success "Redis volume backup completed"
    
    print_info "Cleaning old volume backups (keeping last 7 days)..."
    find "$BACKUP_DIR/volumes" -name "*_volume_*.tar.gz" -mtime +7 -delete
    print_success "Old volume backups cleaned"
}

# Log Rotation
rotate_logs() {
    print_header "Log Rotation"
    
    print_info "Rotating Docker logs..."
    docker system prune -f
    
    print_info "Rotating application logs..."
    docker-compose exec -T backend-api sh -c "truncate -s 0 logs/*.log" 2>/dev/null || print_warning "Backend logs not found"
    
    print_info "Rotating Nginx logs..."
    docker-compose exec -T pju-web sh -c "truncate -s 0 /var/log/nginx/*.log" 2>/dev/null || print_warning "Nginx logs not found"
    
    print_success "Log rotation completed"
}

# System Update
system_update() {
    print_header "System Update"
    
    print_info "Updating Docker images..."
    docker-compose pull
    
    print_info "Rebuilding and restarting services..."
    docker-compose up -d --build
    
    print_info "Waiting for services to be healthy..."
    sleep 15
    
    print_success "System update completed"
}

# Security Check
security_check() {
    print_header "Security Check"
    
    print_info "Scanning Docker images for vulnerabilities..."
    docker scan pju-smart-backend-api || print_warning "Docker scan not available"
    docker scan pju-smart-pju-web || print_warning "Docker scan not available"
    
    print_info "Checking for exposed ports..."
    netstat -tulpn | grep LISTEN
    
    print_info "Checking failed login attempts..."
    grep "Failed password" /var/log/auth.log | tail -10 || print_warning "Auth log not accessible"
    
    print_success "Security check completed"
}

# Performance Check
performance_check() {
    print_header "Performance Check"
    
    print_info "Checking database query performance..."
    docker-compose exec -T postgres psql -U pju_admin -d pju_smart -c "SELECT pg_stat_statements_reset();" 2>/dev/null || print_warning "pg_stat_statements not available"
    
    print_info "Checking database sizes..."
    docker-compose exec -T postgres psql -U pju_admin -d pju_smart -c "SELECT pg_size_pretty(pg_database_size('pju_smart'));"
    
    print_info "Checking table sizes..."
    docker-compose exec -T postgres psql -U pju_admin -d pju_smart -c "SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
    
    print_success "Performance check completed"
}

# Restore Database
restore_database() {
    print_header "Database Restore"
    
    if [ -z "$1" ]; then
        print_error "Please specify backup file to restore"
        print_info "Usage: $0 restore <backup_file>"
        exit 1
    fi
    
    BACKUP_FILE="$1"
    
    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
    
    print_warning "This will restore the database from backup. Current data will be lost!"
    read -p "Are you sure? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Restore cancelled"
        exit 0
    fi
    
    print_info "Stopping services..."
    docker-compose stop backend-api pju-web
    
    print_info "Restoring PostgreSQL..."
    docker-compose exec -T postgres psql -U pju_admin -d pju_smart < "$BACKUP_FILE"
    
    print_info "Starting services..."
    docker-compose start backend-api pju-web
    
    print_success "Database restore completed"
}

# Full System Backup
full_backup() {
    print_header "Full System Backup"
    
    create_backup_dir
    
    print_info "Creating full system backup..."
    tar -czf "$BACKUP_DIR/pju_smart_full_$DATE.tar.gz" -C /var/www pju-smart
    
    print_info "Backup size:"
    du -h "$BACKUP_DIR/pju_smart_full_$DATE.tar.gz"
    
    print_info "Cleaning old full backups (keeping last 3)..."
    find "$BACKUP_DIR" -name "pju_smart_full_*.tar.gz" -mtime +3 -delete
    
    print_success "Full system backup completed"
}

# Cleanup
cleanup() {
    print_header "System Cleanup"
    
    print_info "Removing unused Docker images..."
    docker image prune -a -f
    
    print_info "Removing unused Docker volumes..."
    docker volume prune -f
    
    print_info "Removing unused Docker networks..."
    docker network prune -f
    
    print_info "Removing unused Docker build cache..."
    docker builder prune -f
    
    print_success "Cleanup completed"
}

# Restart Services
restart_services() {
    print_header "Restarting Services"
    
    print_info "Stopping all services..."
    docker-compose down
    
    print_info "Starting all services..."
    docker-compose up -d
    
    print_info "Waiting for services to be healthy..."
    sleep 15
    
    print_success "Services restarted successfully"
}

# Show Logs
show_logs() {
    print_header "Service Logs"
    
    if [ -z "$1" ]; then
        print_info "Showing all logs (press Ctrl+C to exit)..."
        docker-compose logs -f
    else
        print_info "Showing logs for: $1"
        docker-compose logs -f "$1"
    fi
}

# Show Help
show_help() {
    print_header "Smart PJU Maintenance Script"
    
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  health           - Perform system health check"
    echo "  backup           - Backup all databases"
    echo "  backup-volumes   - Backup Docker volumes"
    echo "  backup-full      - Full system backup"
    echo "  restore <file>  - Restore database from backup"
    echo "  logs             - Show all service logs"
    echo "  logs <service>  - Show logs for specific service"
    echo "  rotate-logs      - Rotate and clean logs"
    echo "  update           - Update system and services"
    echo "  security         - Perform security check"
    echo "  performance      - Check system performance"
    echo "  cleanup          - Clean up unused Docker resources"
    echo "  restart          - Restart all services"
    echo "  help             - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 health"
    echo "  $0 backup"
    echo "  $0 restore /var/backups/pju-smart/database/postgres_20260722.sql"
    echo "  $0 logs backend-api"
}

# Main Function
main() {
    check_root
    cd_project
    
    case "${1:-help}" in
        health)
            health_check
            ;;
        backup)
            backup_database
            ;;
        backup-volumes)
            backup_volumes
            ;;
        backup-full)
            full_backup
            ;;
        restore)
            restore_database "$2"
            ;;
        logs)
            show_logs "$2"
            ;;
        rotate-logs)
            rotate_logs
            ;;
        update)
            system_update
            ;;
        security)
            security_check
            ;;
        performance)
            performance_check
            ;;
        cleanup)
            cleanup
            ;;
        restart)
            restart_services
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
