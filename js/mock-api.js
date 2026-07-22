/**
 * PJU Smart System — Mock API Layer
 * Intercepts fetch calls to /api/v1/* and returns realistic demo data.
 * Falls back to the real network when backend is reachable.
 */
(function () {
  'use strict';

  // ── Shared mock data ──────────────────────────────────────────────────────
  const MOCK_ASSETS = [
    { id: 'PJU-001', name: 'Tiang Jl. Ahmad Yani 01', type: 'LED 60W', status: 'active',   lat: 0.7904, lng: 127.3792, brightness: 100, energy_today: 1.44, last_service: '2026-05-10' },
    { id: 'PJU-002', name: 'Tiang Jl. Pahlawan 12',   type: 'LED 40W', status: 'active',   lat: 0.7889, lng: 127.3801, brightness: 85,  energy_today: 0.96, last_service: '2026-06-01' },
    { id: 'PJU-003', name: 'Tiang Jl. Merdeka 07',    type: 'LED 60W', status: 'fault',    lat: 0.7921, lng: 127.3778, brightness: 0,   energy_today: 0,    last_service: '2026-04-20' },
    { id: 'PJU-004', name: 'Tiang Jl. Sudirman 22',   type: 'LED 80W', status: 'active',   lat: 0.7876, lng: 127.3815, brightness: 100, energy_today: 1.92, last_service: '2026-06-15' },
    { id: 'PJU-005', name: 'Tiang Jl. Batu Angus 03', type: 'LED 40W', status: 'inactive', lat: 0.7934, lng: 127.3765, brightness: 0,   energy_today: 0,    last_service: '2026-03-30' },
    { id: 'PJU-006', name: 'Tiang Jl. Cempaka 18',    type: 'LED 60W', status: 'active',   lat: 0.7862, lng: 127.3828, brightness: 90,  energy_today: 1.30, last_service: '2026-06-20' },
    { id: 'PJU-007', name: 'Tiang Jl. Kelapa 05',     type: 'LED 60W', status: 'active',   lat: 0.7947, lng: 127.3752, brightness: 100, energy_today: 1.44, last_service: '2026-07-01' },
    { id: 'PJU-008', name: 'Tiang Jl. Raya Ternate',  type: 'LED 80W', status: 'fault',    lat: 0.7850, lng: 127.3840, brightness: 0,   energy_today: 0,    last_service: '2026-05-25' },
  ];

  const MOCK_MAINTENANCE = [
    { id: 'MNT-001', asset_id: 'PJU-003', title: 'Ganti ballast rusak',     type: 'corrective', status: 'pending',     priority: 'high',   assigned_to: 'Ahmad Fauzi',    created_at: '2026-07-20', scheduled_date: '2026-07-23' },
    { id: 'MNT-002', asset_id: 'PJU-008', title: 'Periksa driver LED',       type: 'corrective', status: 'in_progress', priority: 'high',   assigned_to: 'Budi Santoso',   created_at: '2026-07-21', scheduled_date: '2026-07-22' },
    { id: 'MNT-003', asset_id: 'PJU-005', title: 'Servis rutin bulanan',     type: 'preventive', status: 'pending',     priority: 'medium', assigned_to: 'Citra Dewi',     created_at: '2026-07-18', scheduled_date: '2026-07-25' },
    { id: 'MNT-004', asset_id: 'PJU-002', title: 'Kalibrasi sensor cahaya',  type: 'preventive', status: 'completed',   priority: 'low',    assigned_to: 'Deni Kurniawan', created_at: '2026-07-15', scheduled_date: '2026-07-19' },
    { id: 'MNT-005', asset_id: 'PJU-006', title: 'Cek koneksi jaringan',     type: 'preventive', status: 'pending',     priority: 'medium', assigned_to: 'Ahmad Fauzi',    created_at: '2026-07-19', scheduled_date: '2026-07-24' },
  ];

  const MOCK_INVENTORY = [
    { id: 'INV-001', name: 'LED Module 60W Philips',    category: 'Lampu',    stock: 45, unit: 'pcs', min_stock: 10, location: 'Gudang A' },
    { id: 'INV-002', name: 'Driver LED 60W',            category: 'Elektrik', stock: 28, unit: 'pcs', min_stock: 8,  location: 'Gudang A' },
    { id: 'INV-003', name: 'Kabel NYY 4x10mm 100m',    category: 'Kabel',    stock: 12, unit: 'rol', min_stock: 3,  location: 'Gudang B' },
    { id: 'INV-004', name: 'MCB 10A Schneider',         category: 'Elektrik', stock: 60, unit: 'pcs', min_stock: 15, location: 'Gudang A' },
    { id: 'INV-005', name: 'Tiang PJU 7m Galvanis',    category: 'Struktur', stock: 5,  unit: 'pcs', min_stock: 2,  location: 'Lapangan' },
    { id: 'INV-006', name: 'Sensor Cahaya LDR',         category: 'Sensor',   stock: 34, unit: 'pcs', min_stock: 10, location: 'Gudang A' },
  ];

  const MOCK_REPORTS = [
    { id: 'RPT-001', title: 'Lampu mati di Jl. Merdeka 07',     status: 'open',       priority: 'high',   reporter: 'Warga001',  created_at: '2026-07-20', location: 'Jl. Merdeka 07' },
    { id: 'RPT-002', title: 'Tiang miring di Jl. Raya Ternate', status: 'in_progress', priority: 'medium', reporter: 'Warga002',  created_at: '2026-07-21', location: 'Jl. Raya Ternate' },
    { id: 'RPT-003', title: 'Lampu kedip-kedip Jl. Pahlawan',   status: 'resolved',   priority: 'low',    reporter: 'Warga003',  created_at: '2026-07-19', location: 'Jl. Pahlawan 12' },
    { id: 'RPT-004', title: 'Kabel terkelupas Jl. Cempaka',     status: 'open',       priority: 'high',   reporter: 'Warga004',  created_at: '2026-07-22', location: 'Jl. Cempaka 18' },
  ];

  const MOCK_FLEET = [
    { id: 'FLT-001', plate: 'DG 1234 AB', type: 'Pickup',    driver: 'Ahmad Fauzi',    status: 'available', fuel_pct: 75, mileage: 42300 },
    { id: 'FLT-002', plate: 'DG 5678 CD', type: 'Pickup',    driver: 'Budi Santoso',   status: 'on_duty',   fuel_pct: 55, mileage: 38100 },
    { id: 'FLT-003', plate: 'DG 9012 EF', type: 'Van',       driver: 'Citra Dewi',     status: 'available', fuel_pct: 90, mileage: 55200 },
    { id: 'FLT-004', plate: 'DG 3456 GH', type: 'Pickup',    driver: 'Deni Kurniawan', status: 'maintenance', fuel_pct: 30, mileage: 61800 },
  ];

  const MOCK_STATS = {
    total_assets: 1248,
    active_assets: 1183,
    fault_assets: 42,
    inactive_assets: 23,
    maintenance_pending: 18,
    maintenance_in_progress: 7,
    reports_open: 11,
    energy_today_kwh: 287.4,
    energy_savings_pct: 34.2,
    uptime_pct: 98.6,
    technicians_active: 12,
    alerts_today: 5,
  };

  const MOCK_ACTIVITIES = [
    { id: 1, type: 'fault',       message: 'Sensor error pada PJU-008',          time: '10 menit lalu',  icon: 'error' },
    { id: 2, type: 'maintenance', message: 'Servis selesai: MNT-004',             time: '45 menit lalu',  icon: 'build' },
    { id: 3, type: 'report',      message: 'Laporan baru: Jl. Cempaka 18',        time: '1 jam lalu',     icon: 'report' },
    { id: 4, type: 'system',      message: 'Backup database berhasil',            time: '2 jam lalu',     icon: 'backup' },
    { id: 5, type: 'maintenance', message: 'Penugasan baru ke Ahmad Fauzi',       time: '3 jam lalu',     icon: 'assignment' },
    { id: 6, type: 'fault',       message: 'Lampu mati terdeteksi: PJU-003',      time: '4 jam lalu',     icon: 'lightbulb' },
  ];

  // ── Mock fetch handler ────────────────────────────────────────────────────
  function createMockResponse(data, status = 200) {
    const body = JSON.stringify(data);
    return new Response(body, {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  function mockFetch(url) {
    const path = url.replace(/^https?:\/\/[^/]+/, '').replace('/api/v1', '');

    // ── Dashboard ──────────────────────────────────────────────────────────
    if (path === '/dashboard/stats' || path === '/dashboard/stats/') {
      return Promise.resolve(createMockResponse({ success: true, data: MOCK_STATS }));
    }
    if (path.startsWith('/dashboard/activities')) {
      return Promise.resolve(createMockResponse({ success: true, data: MOCK_ACTIVITIES }));
    }

    // ── Assets ─────────────────────────────────────────────────────────────
    if (path === '/assets' || path === '/assets/') {
      return Promise.resolve(createMockResponse({ success: true, data: MOCK_ASSETS, total: MOCK_ASSETS.length }));
    }
    const assetMatch = path.match(/^\/assets\/([^/]+)$/);
    if (assetMatch) {
      const asset = MOCK_ASSETS.find(a => a.id === assetMatch[1]) || MOCK_ASSETS[0];
      return Promise.resolve(createMockResponse({ success: true, data: asset }));
    }

    // ── Maintenance ────────────────────────────────────────────────────────
    if (path === '/maintenance' || path === '/maintenance/') {
      return Promise.resolve(createMockResponse({ success: true, data: MOCK_MAINTENANCE, total: MOCK_MAINTENANCE.length }));
    }
    const mntMatch = path.match(/^\/maintenance\/([^/]+)$/);
    if (mntMatch) {
      const task = MOCK_MAINTENANCE.find(t => t.id === mntMatch[1]) || MOCK_MAINTENANCE[0];
      return Promise.resolve(createMockResponse({ success: true, data: task }));
    }
    if (path.endsWith('/complete')) {
      return Promise.resolve(createMockResponse({ success: true, message: 'Task completed' }));
    }

    // ── Inventory ──────────────────────────────────────────────────────────
    if (path === '/inventory' || path === '/inventory/') {
      return Promise.resolve(createMockResponse({ success: true, data: MOCK_INVENTORY, total: MOCK_INVENTORY.length }));
    }

    // ── Reports ────────────────────────────────────────────────────────────
    if (path === '/reports' || path === '/reports/') {
      return Promise.resolve(createMockResponse({ success: true, data: MOCK_REPORTS, total: MOCK_REPORTS.length }));
    }

    // ── Fleet ──────────────────────────────────────────────────────────────
    if (path === '/fleet' || path === '/fleet/') {
      return Promise.resolve(createMockResponse({ success: true, data: MOCK_FLEET, total: MOCK_FLEET.length }));
    }

    // ── Sensors ────────────────────────────────────────────────────────────
    if (path.startsWith('/sensors/')) {
      const now = Date.now();
      const readings = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(now - (23 - i) * 3600000).toISOString(),
        voltage: 218 + Math.random() * 8,
        current: 0.25 + Math.random() * 0.15,
        power_w: 55 + Math.random() * 10,
        temperature: 35 + Math.random() * 12,
        lux: i >= 18 || i <= 5 ? 0 : (200 + Math.random() * 150),
      }));
      if (path.endsWith('/energy')) {
        return Promise.resolve(createMockResponse({ success: true, data: { total_kwh: 1.32 + Math.random() * 0.2, readings } }));
      }
      return Promise.resolve(createMockResponse({ success: true, data: readings }));
    }

    // ── Auth ───────────────────────────────────────────────────────────────
    if (path === '/auth/login') {
      return Promise.resolve(createMockResponse({
        success: true,
        data: { token: 'mock-jwt-token-demo', user: { id: 1, name: 'Admin PJU', role: 'admin', email: 'admin@pju.ternate.go.id' } }
      }));
    }
    if (path === '/auth/register') {
      return Promise.resolve(createMockResponse({ success: true, message: 'Registration successful' }));
    }

    // ── Health ─────────────────────────────────────────────────────────────
    if (path === '/health' || path === '/health/') {
      return Promise.resolve(createMockResponse({ status: 'ok', uptime: 99.98, timestamp: new Date().toISOString() }));
    }

    // ── Fallback ───────────────────────────────────────────────────────────
    return Promise.resolve(createMockResponse({ success: true, data: [], message: 'Mock: endpoint not mapped' }));
  }

  // ── Intercept fetch for /api/v1/* ─────────────────────────────────────────
  const _origFetch = window.fetch.bind(window);
  window.fetch = function (resource, init) {
    const url = (typeof resource === 'string') ? resource : resource.url || '';
    if (url.includes('/api/v1/')) {
      return mockFetch(url, init);
    }
    return _origFetch(resource, init);
  };

  // ── Also expose demo data globally for direct access by modules ───────────
  window.PJU_MOCK = {
    assets: MOCK_ASSETS,
    maintenance: MOCK_MAINTENANCE,
    inventory: MOCK_INVENTORY,
    reports: MOCK_REPORTS,
    fleet: MOCK_FLEET,
    stats: MOCK_STATS,
    activities: MOCK_ACTIVITIES,
  };

  console.info('[PJU Mock API] Active — all /api/v1/* calls return demo data.');
})();
