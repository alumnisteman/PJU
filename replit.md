# Smart PJU Digital Twin — Ternate

Smart city system for managing 1,248+ public street lights (PJU — Penerangan Jalan Umum) in Ternate, Indonesia. Built as a Digital Twin platform with 50 UI modules covering operations, maintenance, field technicians, citizen reporting, PLN mobile, analytics, security, and disaster recovery.

## How to run

```
node server.js
```

Runs on port **5000**. The workflow `Start application` is already configured.

## Project structure

| Path | Description |
|---|---|
| `index.html` | Main portal — lists all 50 modules grouped by category with search |
| `<module_name>/code.html` | Each module's standalone UI (50 total) |
| `js/api-client.js` | API client wrapping all `/api/v1/*` endpoints |
| `js/mock-api.js` | Mock data layer — intercepts fetch to `/api/v1/*` and returns realistic demo data. Active on all module pages. |
| `js/nav.js` | Shared navigation injected into every module. Adds a floating **⚡ apps** hub button (all 50 modules, searchable) and a **Beranda** home button. Also fixes `href="#"` nav links to point to real module paths. |
| `server.js` | Express static file server (root `package.json`) |
| `backend/` | Node.js/Express API backend (requires PostgreSQL + Redis + MQTT — not active in current setup) |
| `database/` | PostgreSQL + TimescaleDB init scripts |

## Module categories (50 total)

- **Operasional** (6): Smart Dashboard, Command Center, Peta Monitoring, Analitik Alert, Dashboard Eksekutif, Pusat Kendali
- **Pemeliharaan** (6): AI Predictive Maintenance, Jadwal, Detail Tiang, AR Inspection, Kontrol Cuaca, Verifikasi Tugas
- **Teknisi** (8): Penugasan, Detail Penugasan, Absensi, Peta Rute, Stok Material, Inspeksi Kendaraan, BBM Armada, Rute Stok
- **Warga** (7): Lapor Gangguan, Detail Lapor, Transparansi Publik, Mobilitas, Peta Rute Terang, Donasi Lampu, Keamanan Publik
- **PLN Mobile** (6): Dashboard PLN, Otentikasi, Profil, Notifikasi, Riwayat Transaksi, Hub EV
- **Analitik** (4): ESG Sustainability, Simulasi ROI, Laporan Keuangan, Skema Database
- **Sistem** (4): Hub Integrasi API, Konfigurasi Backend, Setup Produksi, Kontrol Suara
- **Keamanan** (5): Enkripsi API, Keamanan DB, Log Audit, Security Dashboard, Simulasi Siber
- **Simulasi & DR** (4): Simulasi Darurat, Simulasi Beban, Simulasi Kegagalan Server, Pemulihan Bencana

## Inter-module navigation

Every `code.html` has `js/mock-api.js` and `js/nav.js` injected before `</head>`. The nav widget provides:
- **Floating ⚡ apps button** (bottom-right) → opens full module navigator with category grouping and search
- **Beranda button** → returns to `index.html`
- Sidebar/bottom nav `href="#"` links are automatically resolved to correct module paths based on link text

## User preferences

- Keep Indonesian language for UI text
- Maintain existing module structure — do not merge or restructure modules
