# Dockerfile untuk Smart PJU System
# Web server Nginx untuk hosting seluruh modul HTML

FROM nginx:alpine

# Metadata
LABEL maintainer="PJU Ternate DevOps Team"
LABEL description="Smart PJU Digital Twin System - Production Deployment"
LABEL version="1.0.0"

# Hapus halaman default nginx
RUN rm -rf /usr/share/nginx/html/*

# Salin seluruh konten proyek ke direktori nginx
COPY . /usr/share/nginx/html/

# Salin konfigurasi nginx kustom
COPY nginx.conf /etc/nginx/nginx.conf

# Buat direktori untuk logs
RUN mkdir -p /var/log/nginx

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
