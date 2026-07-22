# PowerShell Deployment Script untuk Smart PJU System
# Version: 1.0.0

# Konfigurasi Server
$SERVER_HOST = "192.168.1.14"
$SERVER_USER = "root"
$SERVER_PASSWORD = "1"
$REMOTE_DIR = "/var/www/pju-smart"
$CONTAINER_NAME = "pju-smart-web"

# Fungsi logging
function Log-Info {
    param([string]$message)
    Write-Host "[INFO] $message" -ForegroundColor Blue
}

function Log-Success {
    param([string]$message)
    Write-Host "[SUCCESS] $message" -ForegroundColor Green
}

function Log-Warning {
    param([string]$message)
    Write-Host "[WARNING] $message" -ForegroundColor Yellow
}

function Log-Error {
    param([string]$message)
    Write-Host "[ERROR] $message" -ForegroundColor Red
}

# Fungsi untuk cek koneksi server
function Test-ServerConnection {
    Log-Info "Mengecek koneksi ke server ${SERVER_HOST}..."
    
    $command = "echo 'Connected'"
    $plinkCommand = "echo y | plink -ssh ${SERVER_USER}@${SERVER_HOST} -pw ${SERVER_PASSWORD} `"$command`""
    
    $result = Invoke-Expression $plinkCommand 2>&1
    
    if ($LASTEXITCODE -eq 0 -and $result -match "Connected") {
        Log-Success "Koneksi ke server berhasil!"
        return $true
    } else {
        Log-Error "Gagal terkoneksi ke server ${SERVER_HOST}"
        return $false
    }
}

# Fungsi untuk setup direktori di server
function Set-RemoteDirectory {
    Log-Info "Setup direktori di server..."
    
    $remoteCommands = @"
mkdir -p /var/www/pju-smart
mkdir -p /var/www/pju-smart/logs

if ! command -v docker &> /dev/null; then
    echo "Docker belum terinstall. Menginstall Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
else
    echo "Docker sudah terinstall."
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose belum terinstall. Menginstall Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-`$(uname -s)-`$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "Docker Compose sudah terinstall."
fi

echo "Setup direktori selesai."
"@
    
    # Simpan commands ke file temporary
    $tempFile = [System.IO.Path]::GetTempFileName()
    $remoteCommands | Out-File -FilePath $tempFile -Encoding UTF8
    
    # Upload file ke server dan eksekusi
    $uploadCommand = "pscp -pw ${SERVER_PASSWORD} $tempFile ${SERVER_USER}@${SERVER_HOST}:/tmp/setup.sh"
    Invoke-Expression $uploadCommand
    
    $executeCommand = "echo y | plink -ssh ${SERVER_USER}@${SERVER_HOST} -pw ${SERVER_PASSWORD} 'chmod +x /tmp/setup.sh && bash /tmp/setup.sh'"
    $result = Invoke-Expression $executeCommand 2>&1
    
    # Cleanup temp file
    Remove-Item $tempFile -Force
    
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Setup direktori berhasil!"
        return $true
    } else {
        Log-Error "Gagal setup direktori di server"
        return $false
    }
}

# Fungsi untuk upload file ke server
function Upload-Files {
    Log-Info "Mengupload file ke server..."
    
    # Gunakan pscp untuk upload file
    $pscpCommand = "pscp -pw ${SERVER_PASSWORD} -r . ${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}"
    
    $result = Invoke-Expression $pscpCommand 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Upload file berhasil!"
        return $true
    } else {
        Log-Error "Gagal upload file ke server"
        return $false
    }
}

# Fungsi untuk build dan deploy container
function Deploy-Container {
    Log-Info "Build dan deploy Docker container..."
    
    $remoteCommands = @"
cd ${REMOTE_DIR}

if docker ps -a | grep -q ${CONTAINER_NAME}; then
    echo "Menghentikan container lama..."
    docker stop ${CONTAINER_NAME}
    docker rm ${CONTAINER_NAME}
fi

if docker images | grep -q pju-smart-web; then
    echo "Menghapus image lama..."
    docker rmi pju-smart-web
fi

echo "Building Docker image..."
docker build -t pju-smart-web .

echo "Menjalankan container..."
docker-compose up -d

echo "Status container:"
docker ps | grep ${CONTAINER_NAME}

echo "Deploy selesai!"
"@
    
    # Simpan commands ke file temporary
    $tempFile = [System.IO.Path]::GetTempFileName()
    $remoteCommands | Out-File -FilePath $tempFile -Encoding UTF8
    
    # Upload file ke server dan eksekusi
    $uploadCommand = "pscp -pw ${SERVER_PASSWORD} $tempFile ${SERVER_USER}@${SERVER_HOST}:/tmp/deploy.sh"
    Invoke-Expression $uploadCommand
    
    $executeCommand = "echo y | plink -ssh ${SERVER_USER}@${SERVER_HOST} -pw ${SERVER_PASSWORD} 'chmod +x /tmp/deploy.sh && bash /tmp/deploy.sh'"
    $result = Invoke-Expression $executeCommand 2>&1
    
    # Cleanup temp file
    Remove-Item $tempFile -Force
    
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Deploy container berhasil!"
        return $true
    } else {
        Log-Error "Gagal deploy container"
        return $false
    }
}

# Fungsi untuk verifikasi deployment
function Test-Deployment {
    Log-Info "Verifikasi deployment..."
    
    $remoteCommands = @"
echo "=== Container Status ==="
docker ps -a | grep ${CONTAINER_NAME}

echo ""
echo "=== Container Logs ==="
docker logs --tail 20 ${CONTAINER_NAME}

echo ""
echo "=== Health Check ==="
curl -s http://localhost/health || echo "Health check failed"
"@
    
    # Simpan commands ke file temporary
    $tempFile = [System.IO.Path]::GetTempFileName()
    $remoteCommands | Out-File -FilePath $tempFile -Encoding UTF8
    
    # Upload file ke server dan eksekusi
    $uploadCommand = "pscp -pw ${SERVER_PASSWORD} $tempFile ${SERVER_USER}@${SERVER_HOST}:/tmp/verify.sh"
    Invoke-Expression $uploadCommand
    
    $executeCommand = "echo y | plink -ssh ${SERVER_USER}@${SERVER_HOST} -pw ${SERVER_PASSWORD} 'chmod +x /tmp/verify.sh && bash /tmp/verify.sh'"
    $result = Invoke-Expression $executeCommand 2>&1
    
    # Cleanup temp file
    Remove-Item $tempFile -Force
    
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Verifikasi deployment selesai!"
        return $true
    } else {
        Log-Error "Gagal verifikasi deployment"
        return $false
    }
}

# Main execution
function Main {
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "  Smart PJU System - Deployment Script" -ForegroundColor Cyan
    Write-Host "  Version: 1.0.0" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Step 1: Cek koneksi server
    if (-not (Test-ServerConnection)) {
        Log-Error "Deployment gagal: Tidak dapat terkoneksi ke server"
        exit 1
    }
    
    Write-Host ""
    
    # Step 2: Setup direktori di server
    if (-not (Set-RemoteDirectory)) {
        Log-Error "Deployment gagal: Setup direktori gagal"
        exit 1
    }
    
    Write-Host ""
    
    # Step 3: Upload file ke server
    if (-not (Upload-Files)) {
        Log-Error "Deployment gagal: Upload file gagal"
        exit 1
    }
    
    Write-Host ""
    
    # Step 4: Deploy container
    if (-not (Deploy-Container)) {
        Log-Error "Deployment gagal: Deploy container gagal"
        exit 1
    }
    
    Write-Host ""
    
    # Step 5: Verifikasi deployment
    if (-not (Test-Deployment)) {
        Log-Warning "Deployment selesai tapi verifikasi gagal"
    }
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Log-Success "Deployment Smart PJU System SELESAI!"
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Akses aplikasi di: http://${SERVER_HOST}" -ForegroundColor Cyan
    Write-Host "Container name: ${CONTAINER_NAME}" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Perintah untuk melihat logs:" -ForegroundColor Yellow
    Write-Host "  plink -ssh ${SERVER_USER}@${SERVER_HOST} -pw ${SERVER_PASSWORD} 'docker logs -f ${CONTAINER_NAME}'" -ForegroundColor White
    Write-Host ""
    Write-Host "Perintah untuk restart container:" -ForegroundColor Yellow
    Write-Host "  plink -ssh ${SERVER_USER}@${SERVER_HOST} -pw ${SERVER_PASSWORD} 'cd ${REMOTE_DIR} && docker-compose restart'" -ForegroundColor White
    Write-Host ""
}

# Jalankan main function
Main
