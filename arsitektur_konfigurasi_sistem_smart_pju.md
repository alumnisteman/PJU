# Arsitektur Sistem Smart PJU Ternate

## 1. Arsitektur Teknis
Sistem ini menggunakan arsitektur berbasis Cloud dengan integrasi IoT (Internet of Things) untuk kendali lampu jalan.

- **Frontend**: React/Next.js (Web Dashboard) & React Native (Mobile Apps).
- **Backend**: Node.js dengan Express/Fastify (RESTful API & WebSockets).
- **Database**: 
    - PostgreSQL: Data relasional (User, Aset PJU, Log Pemeliharaan, Transaksi).
    - TimescaleDB: Data Time-series (Sensor tegangan, arus, konsumsi energi).
    - Redis: Real-time status PJU & Caching.
- **IoT Stack**: MQTT Broker (Mosquitto/EMQX) untuk komunikasi dua arah dengan Tiang PJU.
- **Auth**: Firebase Auth atau Supabase Auth (Mendukung integrasi PLN Mobile).

## 2. Integrasi Database
Setiap modul akan terhubung ke tabel yang saling berelasi:
- `assets`: Detail tiang PJU (Koordinat, Tipe Lampu, Status).
- `maintenance_tasks`: Jadwal & status perbaikan teknisi.
- `inventory`: Stok material di gudang & di kendaraan unit.
- `citizen_reports`: Laporan gangguan dari warga.
- `fleet_management`: Data BBM & Inspeksi kendaraan.

## 3. Alur Kerja Fungsional
1. **Deteksi Otomatis**: Sensor IoT mengirimkan status 'OFFLINE' atau 'FAILURE'.
2. **Tiket Otomatis**: Backend membuat tugas di `maintenance_tasks` berdasarkan deteksi sensor atau `citizen_reports`.
3. **Dispatching**: Penugasan muncul di Dashboard Teknisi berdasarkan lokasi terdekat.
4. **Eksekusi**: Teknisi melakukan perbaikan, update stok di `inventory`, dan verifikasi via foto.
5. **Transparansi**: Data keberhasilan perbaikan muncul di Portal Transparansi Publik secara real-time.