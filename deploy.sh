#!/bin/bash

# ============================================
_SCRIPT_VERSION="1.0.0"
# ============================================

# Konfigurasi Server
SERVER_HOST="192.168.1.14"
SERVER_USER="root"
SERVER_PASSWORD="1"
REMOTE_DIR="/var/www/pju-smart"
CONTAINER_NAME="pju-smart-web"

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fungsi logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fungsi untuk cek koneksi server
check_server_connection() {
    log_info "Mengecek koneksi ke server ${SERVER_HOST}..."
    
    # Cek koneksi menggunakan plink
    if echo y | plink -ssh ${SERVER_USER}@${SERVER_HOST} -pw ${SERVER_PASSWORD} "echo 'Connected'" > /dev/null 2>&1; then
        log_success "Koneksi ke server berhasil!"
        return 0
    else
        log_error "Gagal terkoneksi ke server ${SERVER_HOST}"
        return 1
    fi
}

# Fungsi untuk setup direktori di server
setup_remote_directory() {
    log_info "Setup direktori di server..."
    
    echo y | plink -ssh ${SERVER_USER}@${SERVER_HOST} -pw ${SERVER_PASSWORD} << 'ENDSSH'
        # Buat direktori utama
        mkdir -p /var/www/pju-smart
        mkdir -p /var/www/pju-smart/logs
        
        # Cek apakah Docker sudah terinstall
        if ! command -v docker &> /dev/null; then
            echo "Docker belum terinstall. Menginstall Docker..."
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh
            systemctl start docker
            systemctl enable docker
        else
            echo "Docker sudah terinstall."
        fi
        
        # Cek apakah Docker Compose sudah terinstall
        if ! command -v docker-compose &> /dev/null; then
            echo "Docker Compose belum terinstall. Menginstall Docker Compose..."
            curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        else
            echo "Docker Compose sudah terinstall."
        fi
        
        echo "Setup direktori selesai."
ENDSSH
    
    if [ $? -eq 0 ]; then
        log_success "Setup direktori berhasil!"
        return 0
    else
        log_error "Gagal setup direktori di server"
        return 1
    fi
}

# Fungsi untuk upload file ke server
upload_files() {
    log_info "Mengupload file ke server..."
    
    # Gunakan pscp untuk upload file
    pscp -pw ${SERVER_PASSWORD} -r . ${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}
    
    if [ $? -eq 0 ]; then
        log_success "Upload file berhasil!"
        return 0
    else
        log_error "Gagal upload file ke server"
        return 1
    fi
}

# Fungsi untuk build dan deploy container
deploy_container() {
    log_info "Build dan deploy Docker container..."
    
    echo y | plink -ssh ${SERVER_USER}@${SERVER_HOST} -pw ${SERVER_PASSWORD} << ENDSSH
        cd ${REMOTE_DIR}
        
        # Stop dan hapus container lama jika ada
        if docker ps -a | grep -q ${CONTAINER_NAME}; then
            echo "Menghentikan container lama..."
            docker stop ${CONTAINER_NAME}
            docker rm ${CONTAINER_NAME}
        fi
        
        # Hapus image lama jika ada
        if docker images | grep -q pju-smart-web; then
            echo "Menghapus image lama..."
            docker rmi pju-smart-web
        fi
        
        # Build image baru
        echo "Building Docker image..."
        docker build -t pju-smart-web .
        
        # Jalankan container menggunakan docker-compose
        echo "Menjalankan container..."
        docker-compose up -d
        
        # Cek status container
        echo "Status container:"
        docker ps | grep ${CONTAINER_NAME}
        
        echo "Deploy selesai!"
ENDSSH
    
    if [ $? -eq 0 ]; then
        log_success "Deploy container berhasil!"
        return 0
    else
        log_error "Gagal deploy container"
        return 1
    fi
}

# Fungsi untuk verifikasi deployment
verify_deployment() {
    log_info "Verifikasi deployment..."
    
    echo y | plink -ssh ${SERVER_USER}@${SERVER_HOST} -pw ${SERVER_PASSWORD} << ENDSSH
        echo "=== Container Status ==="
        docker ps -a | grep ${CONTAINER_NAME}
        
        echo ""
        echo "=== Container Logs ==="
        docker logs --tail 20 ${CONTAINER_NAME}
        
        echo ""
        echo "=== Health Check ==="
        curl -s http://localhost/health || echo "Health check failed"
ENDSSH
    
    if [ $? -eq 0 ]; then
        log_success "Verifikasi deployment selesai!"
        return 0
    else
        log_error "Gagal verifikasi deployment"
        return 1
    fi
}

# Fungsi untuk cleanup
cleanup_old_deployment() {
    log_warning "Melakukan cleanup deployment lama..."
    
    echo y | plink -ssh ${SERVER_USER}@${SERVER_HOST} -pw ${SERVER_PASSWORD} << ENDSSH
        cd ${REMOTE_DIR}
        
        # Hapus container yang tidak berjalan
        docker container prune -f
        
        # Hapus image yang tidak terpakai
        docker image prune -f
        
        echo "Cleanup selesai."
ENDSSH
}

# Main execution
main() {
    echo "=========================================="
    echo "  Smart PJU System - Deployment Script"
    echo "  Version: ${SCRIPT_VERSION}"
    echo "=========================================="
    echo ""
    
    # Step 1: Cek koneksi server
    if ! check_server_connection; then
        log_error "Deployment gagal: Tidak dapat terkoneksi ke server"
        exit 1
    fi
    
    echo ""
    
    # Step 2: Setup direktori di server
    if ! setup_remote_directory; then
        log_error "Deployment gagal: Setup direktori gagal"
        exit 1
    fi
    
    echo ""
    
    # Step 3: Upload file ke server
    if ! upload_files; then
        log_error "Deployment gagal: Upload file gagal"
        exit 1
    fi
    
    echo ""
    
    # Step 4: Deploy container
    if ! deploy_container; then
        log_error "Deployment gagal: Deploy container gagal"
        exit 1
    fi
    
    echo ""
    
    # Step 5: Verifikasi deployment
    if ! verify_deployment; then
        log_warning "Deployment selesai tapi verifikasi gagal"
    fi
    
    echo ""
    echo "=========================================="
    log_success "Deployment Smart PJU System SELESAI!"
    echo "=========================================="
    echo ""
    echo "Akses aplikasi di: http://${SERVER_HOST}"
    echo "Container name: ${CONTAINER_NAME}"
    echo ""
    echo "Perintah untuk melihat logs:"
    echo "  plink -ssh ${SERVER_USER}@${SERVER_HOST} -pw ${SERVER_PASSWORD} 'docker logs -f ${CONTAINER_NAME}'"
    echo ""
    echo "Perintah untuk restart container:"
    echo "  plink -ssh ${SERVER_USER}@${SERVER_HOST} -pw ${SERVER_PASSWORD} 'cd ${REMOTE_DIR} && docker-compose restart'"
    echo ""
}

# Jalankan main function
main
