#!/bin/bash

# Smart PJU System - Automated Installation Script
# Version: 1.0.0
# Author: PJU Development Team

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Detect OS
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
    else
        print_error "Cannot detect OS"
        exit 1
    fi
    print_success "Detected OS: $OS $VERSION"
}

# Install Docker
install_docker() {
    print_header "Installing Docker"
    
    if command -v docker &> /dev/null; then
        print_success "Docker already installed"
        docker --version
    else
        print_info "Installing Docker..."
        
        if [ "$OS" == "ubuntu" ] || [ "$OS" == "debian" ]; then
            apt-get update
            apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
            curl -fsSL https://download.docker.com/linux/$OS/gpg | apt-key add -
            add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/$OS $(lsb_release -cs) stable"
            apt-get update
            apt-get install -y docker-ce docker-ce-cli containerd.io
        elif [ "$OS" == "centos" ] || [ "$OS" == "rhel" ]; then
            yum install -y yum-utils
            yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            yum install -y docker-ce docker-ce-cli containerd.io
        else
            print_error "Unsupported OS for Docker installation"
            exit 1
        fi
        
        systemctl start docker
        systemctl enable docker
        print_success "Docker installed successfully"
    fi
}

# Install Docker Compose
install_docker_compose() {
    print_header "Installing Docker Compose"
    
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose already installed"
        docker-compose --version
    else
        print_info "Installing Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        print_success "Docker Compose installed successfully"
    fi
}

# Install Git
install_git() {
    print_header "Installing Git"
    
    if command -v git &> /dev/null; then
        print_success "Git already installed"
        git --version
    else
        print_info "Installing Git..."
        
        if [ "$OS" == "ubuntu" ] || [ "$OS" == "debian" ]; then
            apt-get install -y git
        elif [ "$OS" == "centos" ] || [ "$OS" == "rhel" ]; then
            yum install -y git
        fi
        
        print_success "Git installed successfully"
    fi
}

# Setup Project Directory
setup_project() {
    print_header "Setting Up Project Directory"
    
    INSTALL_DIR="/var/www/pju-smart"
    
    if [ -d "$INSTALL_DIR" ]; then
        print_warning "Directory already exists: $INSTALL_DIR"
        read -p "Do you want to remove and reinstall? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$INSTALL_DIR"
            print_info "Directory removed"
        else
            print_info "Using existing directory"
            cd "$INSTALL_DIR"
            return
        fi
    fi
    
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    print_success "Project directory created: $INSTALL_DIR"
}

# Clone or Copy Files
setup_files() {
    print_header "Setting Up Project Files"
    
    # Check if we're running from the cloned directory
    if [ -f "docker-compose.yml" ]; then
        print_info "Files already in place"
    else
        print_info "Please copy project files to $INSTALL_DIR or run this script from the project directory"
        print_info "You can clone the repository using:"
        print_info "git clone https://github.com/alumnisteman/PJU.git $INSTALL_DIR"
        exit 1
    fi
}

# Configure Environment
setup_environment() {
    print_header "Configuring Environment"
    
    if [ -f ".env" ]; then
        print_warning ".env file already exists"
        read -p "Do you want to reconfigure? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Using existing .env file"
            return
        fi
    fi
    
    # Generate random passwords
    POSTGRES_PASSWORD=$(openssl rand -base64 16)
    REDIS_PASSWORD=$(openssl rand -base64 16)
    API_KEY=$(openssl rand -hex 16)
    
    cat > .env << EOF
# Database Configuration
POSTGRES_USER=pju_admin
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=pju_smart

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# MQTT Configuration
MQTT_HOST=mosquitto
MQTT_PORT=1883
MQTT_USERNAME=
MQTT_PASSWORD=

# Backend API Configuration
NODE_ENV=production
PORT=3000
API_KEY=$API_KEY

# Web Server Configuration
WEB_PORT=8080
WEB_SSL_PORT=8443
EOF
    
    print_success "Environment file created"
    print_warning "IMPORTANT: Save these credentials securely!"
    print_info "PostgreSQL Password: $POSTGRES_PASSWORD"
    print_info "API Key: $API_KEY"
}

# Configure Firewall
setup_firewall() {
    print_header "Configuring Firewall"
    
    if command -v ufw &> /dev/null; then
        print_info "Configuring UFW..."
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 8080/tcp
        ufw allow 3000/tcp
        ufw --force enable
        print_success "UFW configured"
    elif command -v firewall-cmd &> /dev/null; then
        print_info "Configuring firewalld..."
        firewall-cmd --permanent --add-port=80/tcp
        firewall-cmd --permanent --add-port=443/tcp
        firewall-cmd --permanent --add-port=8080/tcp
        firewall-cmd --permanent --add-port=3000/tcp
        firewall-cmd --reload
        print_success "firewalld configured"
    else
        print_warning "No firewall detected, skipping configuration"
    fi
}

# Initialize Database
initialize_database() {
    print_header "Initializing Database"
    
    print_info "Starting database services..."
    docker-compose up -d postgres timescaledb redis mosquitto
    
    print_info "Waiting for databases to be ready..."
    sleep 20
    
    print_info "Running database initialization..."
    docker-compose exec -T postgres psql -U pju_admin -d pju_smart -f /docker-entrypoint-initdb.d/init.sql
    docker-compose exec -T timescaledb psql -U pju_admin -d pju_smart -f /docker-entrypoint-initdb.d/timescale-init.sql
    
    print_success "Database initialized"
}

# Build and Start Services
start_services() {
    print_header "Building and Starting Services"
    
    print_info "Building Docker images..."
    docker-compose build
    
    print_info "Starting all services..."
    docker-compose up -d
    
    print_info "Waiting for services to be healthy..."
    sleep 15
    
    print_success "All services started"
}

# Verify Installation
verify_installation() {
    print_header "Verifying Installation"
    
    print_info "Checking service status..."
    docker-compose ps
    
    print_info "Testing health endpoint..."
    if curl -s http://localhost:8080/health > /dev/null; then
        print_success "Web server health check passed"
    else
        print_error "Web server health check failed"
    fi
    
    print_info "Testing API endpoint..."
    if curl -s http://localhost:8080/api/v1/dashboard/stats > /dev/null; then
        print_success "API endpoint check passed"
    else
        print_error "API endpoint check failed"
    fi
    
    print_info "Testing database connection..."
    if docker-compose exec -T postgres psql -U pju_admin -d pju_smart -c "SELECT 1;" > /dev/null 2>&1; then
        print_success "Database connection check passed"
    else
        print_error "Database connection check failed"
    fi
}

# Setup Systemd Service
setup_systemd() {
    print_header "Setting Up Systemd Service"
    
    cat > /etc/systemd/system/pju-smart.service << EOF
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
EOF
    
    systemctl daemon-reload
    systemctl enable pju-smart.service
    print_success "Systemd service configured and enabled"
}

# Print Summary
print_summary() {
    print_header "Installation Summary"
    
    echo -e "${GREEN}Smart PJU System installed successfully!${NC}"
    echo ""
    echo -e "${BLUE}Access Points:${NC}"
    echo -e "  Web Server: ${GREEN}http://localhost:8080${NC}"
    echo -e "  Backend API: ${GREEN}http://localhost:3000${NC}"
    echo -e "  API via Nginx: ${GREEN}http://localhost:8080/api/v1${NC}"
    echo ""
    echo -e "${BLUE}Useful Commands:${NC}"
    echo -e "  Check status: ${YELLOW}docker-compose ps${NC}"
    echo -e "  View logs: ${YELLOW}docker-compose logs -f${NC}"
    echo -e "  Stop services: ${YELLOW}docker-compose down${NC}"
    echo -e "  Restart services: ${YELLOW}docker-compose restart${NC}"
    echo ""
    echo -e "${BLUE}Systemd Commands:${NC}"
    echo -e "  Start service: ${YELLOW}systemctl start pju-smart${NC}"
    echo -e "  Stop service: ${YELLOW}systemctl stop pju-smart${NC}"
    echo -e "  Check status: ${YELLOW}systemctl status pju-smart${NC}"
    echo ""
    echo -e "${YELLOW}IMPORTANT: Save your credentials securely!${NC}"
    echo -e "Credentials are stored in: ${GREEN}/var/www/pju-smart/.env${NC}"
    echo ""
    echo -e "${BLUE}For maintenance, run: ${YELLOW}./maintenance.sh${NC}"
}

# Main Installation Process
main() {
    print_header "Smart PJU System - Automated Installation"
    
    check_root
    detect_os
    install_docker
    install_docker_compose
    install_git
    setup_project
    setup_files
    setup_environment
    setup_firewall
    initialize_database
    start_services
    verify_installation
    setup_systemd
    print_summary
    
    print_success "Installation completed successfully!"
}

# Run main function
main
