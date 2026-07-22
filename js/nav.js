/**
 * PJU Smart System — Shared Navigation
 * Disuntikkan ke semua 50 halaman modul.
 * - Tombol ⚡ (kanan bawah) → panel navigasi 50 modul
 * - Tombol Beranda → index.html
 * - Memperbaiki href="#" pada sidebar/navbar berdasarkan teks
 * - Tombol aksi (KERJAKAN, DETAIL, dll.) mengarah ke modul terkait
 */
(function () {
  'use strict';

  // ── Daftar 50 modul ───────────────────────────────────────────────────────
  const MODULES = [
    { id: 'pju_smart_dashboard',            name: 'Smart Dashboard',         icon: 'speed',               category: 'Operasional' },
    { id: 'digital_twin_command_center',    name: 'Command Center',          icon: 'dashboard_customize', category: 'Operasional' },
    { id: 'peta_monitoring_pju',            name: 'Peta Monitoring',         icon: 'satellite_alt',       category: 'Operasional' },
    { id: 'analitik_alert_pju',             name: 'Analitik Alert',          icon: 'warning',             category: 'Operasional' },
    { id: 'dashboard_eksekutif_smart_pju',  name: 'Dashboard Eksekutif',     icon: 'business_center',     category: 'Operasional' },
    { id: 'pusat_kendali_integrasi',        name: 'Pusat Kendali',           icon: 'control_camera',      category: 'Operasional' },
    { id: 'ai_predictive_maintenance',      name: 'AI Predictive Maint.',    icon: 'memory',              category: 'Pemeliharaan' },
    { id: 'jadwal_pemeliharaan_pju',        name: 'Jadwal Pemeliharaan',     icon: 'calendar_month',      category: 'Pemeliharaan' },
    { id: 'detail_tiang_lampu',             name: 'Detail Tiang Lampu',      icon: 'podcasts',            category: 'Pemeliharaan' },
    { id: 'ar_asset_inspection',            name: 'AR Asset Inspection',     icon: 'view_in_ar',          category: 'Pemeliharaan' },
    { id: 'kontrol_adaptif_cuaca',          name: 'Kontrol Cuaca',           icon: 'cloudy',              category: 'Pemeliharaan' },
    { id: 'verifikasi_penyelesaian_tugas',  name: 'Verifikasi Tugas',        icon: 'task_alt',            category: 'Pemeliharaan' },
    { id: 'dashboard_penugasan_teknisi',    name: 'Penugasan Teknisi',       icon: 'assignment',          category: 'Teknisi' },
    { id: 'detail_penugasan_teknisi',       name: 'Detail Penugasan',        icon: 'engineering',         category: 'Teknisi' },
    { id: 'absensi_kehadiran_teknisi',      name: 'Absensi Teknisi',         icon: 'person_check',        category: 'Teknisi' },
    { id: 'peta_rute_pemeliharaan',         name: 'Peta Rute Pemeliharaan',  icon: 'alt_route',           category: 'Teknisi' },
    { id: 'stok_material_kendaraan',        name: 'Stok Material',           icon: 'inventory',           category: 'Teknisi' },
    { id: 'inspeksi_kendaraan_harian',      name: 'Inspeksi Kendaraan',      icon: 'car_repair',          category: 'Teknisi' },
    { id: 'manajemen_bbm_armada',           name: 'Manajemen BBM',           icon: 'local_gas_station',   category: 'Teknisi' },
    { id: 'pengaturan_rute_berbasis_stok',  name: 'Rute Berbasis Stok',      icon: 'route',               category: 'Teknisi' },
    { id: 'lapor_gangguan_pju',             name: 'Lapor Gangguan',          icon: 'report_problem',      category: 'Warga' },
    { id: 'detail_lapor_lampu_padam',       name: 'Detail Lapor Padam',      icon: 'lightbulb_circle',    category: 'Warga' },
    { id: 'portal_transparansi_publik',     name: 'Portal Transparansi',     icon: 'public',              category: 'Warga' },
    { id: 'dashboard_mobilitas_warga',      name: 'Dashboard Mobilitas',     icon: 'directions_car',      category: 'Warga' },
    { id: 'peta_keamanan_rute_terang',      name: 'Peta Rute Terang',        icon: 'map',                 category: 'Warga' },
    { id: 'donasi_lampu_taman',             name: 'Donasi Lampu Taman',      icon: 'volunteer_activism',  category: 'Warga' },
    { id: 'jaringan_keamanan_publik',       name: 'Keamanan Publik',         icon: 'security',            category: 'Warga' },
    { id: 'dashboard_pln_mobile',           name: 'PLN Mobile',              icon: 'phone_iphone',        category: 'PLN Mobile' },
    { id: 'integrasi_otentikasi_pln_mobile',name: 'Otentikasi PLN',          icon: 'verified_user',       category: 'PLN Mobile' },
    { id: 'profil_pengguna',                name: 'Profil Pengguna',         icon: 'account_circle',      category: 'PLN Mobile' },
    { id: 'notifikasi_informasi',           name: 'Notifikasi',              icon: 'notifications',       category: 'PLN Mobile' },
    { id: 'riwayat_transaksi',              name: 'Riwayat Transaksi',       icon: 'receipt_long',        category: 'PLN Mobile' },
    { id: 'hub_pengisian_ev_pju',           name: 'Hub Pengisian EV',        icon: 'ev_station',          category: 'PLN Mobile' },
    { id: 'esg_sustainability_dash',        name: 'ESG Sustainability',      icon: 'eco',                 category: 'Analitik' },
    { id: 'simulasi_penghematan_roi',       name: 'Simulasi Penghematan',    icon: 'savings',             category: 'Analitik' },
    { id: 'laporan_keuangan_audit',         name: 'Laporan Keuangan',        icon: 'account_balance',     category: 'Analitik' },
    { id: 'skema_database_relasi',          name: 'Skema Database',          icon: 'schema',              category: 'Analitik' },
    { id: 'hub_integrasi_api',              name: 'Hub Integrasi API',       icon: 'hub',                 category: 'Sistem' },
    { id: 'konfigurasi_sistem_backend',     name: 'Konfigurasi Backend',     icon: 'settings',            category: 'Sistem' },
    { id: 'setup_produksi_deploy',          name: 'Setup Produksi',          icon: 'cloud_upload',        category: 'Sistem' },
    { id: 'kontrol_suara_command_center',   name: 'Kontrol Suara',           icon: 'mic',                 category: 'Sistem' },
    { id: 'manajemen_enkripsi_api',         name: 'Enkripsi API',            icon: 'key',                 category: 'Keamanan' },
    { id: 'keamanan_privasi_database',      name: 'Keamanan Database',       icon: 'lock',                category: 'Keamanan' },
    { id: 'log_audit_keamanan',             name: 'Log Audit Keamanan',      icon: 'gavel',               category: 'Keamanan' },
    { id: 'security_dashboard',             name: 'Security Dashboard',      icon: 'shield',              category: 'Keamanan' },
    { id: 'simulasi_serangan_siber',        name: 'Simulasi Serangan Siber', icon: 'bug_report',          category: 'Keamanan' },
    { id: 'simulasi_darurat_pju',           name: 'Simulasi Darurat',        icon: 'emergency',           category: 'Simulasi & DR' },
    { id: 'simulasi_beban_penuh_sistem',    name: 'Simulasi Beban',          icon: 'trending_up',         category: 'Simulasi & DR' },
    { id: 'simulasi_kegagalan_server_dr',   name: 'Simulasi Kegagalan',      icon: 'dangerous',           category: 'Simulasi & DR' },
    { id: 'pusat_pemulihan_bencana_dr',     name: 'Pemulihan Bencana (DR)',  icon: 'health_and_safety',   category: 'Simulasi & DR' },
  ];

  // ── Peta teks navigasi → path modul (case-insensitive) ───────────────────
  const NAV_TEXT_MAP = {
    // Operasional
    'dashboard':              '/pju_smart_dashboard/code.html',
    'smart dashboard':        '/pju_smart_dashboard/code.html',
    'command center':         '/digital_twin_command_center/code.html',
    'peta':                   '/peta_monitoring_pju/code.html',
    'peta aset':              '/peta_monitoring_pju/code.html',
    'map':                    '/peta_monitoring_pju/code.html',
    'map view':               '/peta_monitoring_pju/code.html',
    'analitik':               '/analitik_alert_pju/code.html',
    'analytics':              '/analitik_alert_pju/code.html',
    'alert':                  '/analitik_alert_pju/code.html',
    'alerts':                 '/analitik_alert_pju/code.html',
    'executive overview':     '/dashboard_eksekutif_smart_pju/code.html',
    // Pemeliharaan
    'pemeliharaan':           '/jadwal_pemeliharaan_pju/code.html',
    'jadwal':                 '/jadwal_pemeliharaan_pju/code.html',
    'jadwal pemeliharaan':    '/jadwal_pemeliharaan_pju/code.html',
    'asset management':       '/peta_monitoring_pju/code.html',
    'energy analytics':       '/esg_sustainability_dash/code.html',
    'disaster recovery':      '/pusat_pemulihan_bencana_dr/code.html',
    // Teknisi
    'tugas saya':             '/dashboard_penugasan_teknisi/code.html',
    'tugas':                  '/dashboard_penugasan_teknisi/code.html',
    'penugasan':              '/dashboard_penugasan_teknisi/code.html',
    'riwayat kerja':          '/riwayat_transaksi/code.html',
    'laporan warga':          '/lapor_gangguan_pju/code.html',
    'stok':                   '/stok_material_kendaraan/code.html',
    'rute':                   '/peta_rute_pemeliharaan/code.html',
    // Warga / PLN Mobile
    'notifikasi':             '/notifikasi_informasi/code.html',
    'notifications':          '/notifikasi_informasi/code.html',
    'updates':                '/notifikasi_informasi/code.html',
    'profil':                 '/profil_pengguna/code.html',
    'profile':                '/profil_pengguna/code.html',
    'riwayat':                '/riwayat_transaksi/code.html',
    'history':                '/riwayat_transaksi/code.html',
    'aset':                   '/peta_monitoring_pju/code.html',
    // Umum
    'beranda':                '/',
    'home':                   '/',
    'system logs':            '/log_audit_keamanan/code.html',
    'log':                    '/log_audit_keamanan/code.html',
    'keamanan':               '/security_dashboard/code.html',
    'security':               '/security_dashboard/code.html',
  };

  // ── Peta tombol aksi → path tujuan ────────────────────────────────────────
  // Mendeteksi tombol berdasarkan teks dan menambahkan navigasi demo
  const ACTION_BUTTON_MAP = [
    { match: /^kerjakan$/i,              href: '/detail_penugasan_teknisi/code.html' },
    { match: /^mulai navigasi$/i,        href: '/peta_rute_pemeliharaan/code.html' },
    { match: /^detail$/i,                href: '/detail_penugasan_teknisi/code.html' },
    { match: /^lihat detail$/i,          href: '/detail_tiang_lampu/code.html' },
    { match: /^detail tiang$/i,          href: '/detail_tiang_lampu/code.html' },
    { match: /^detail lampu$/i,          href: '/detail_tiang_lampu/code.html' },
    { match: /^lihat semua log$/i,       href: '/log_audit_keamanan/code.html' },
    { match: /^lihat semua$/i,           href: '/pju_smart_dashboard/code.html' },
    { match: /^lihat peta$/i,            href: '/peta_monitoring_pju/code.html' },
    { match: /lihat.*peta/i,             href: '/peta_monitoring_pju/code.html' },
    { match: /^lapor gangguan$/i,        href: '/lapor_gangguan_pju/code.html' },
    { match: /lapor.*temuan/i,           href: '/lapor_gangguan_pju/code.html' },
    { match: /^verifikasi$/i,            href: '/verifikasi_penyelesaian_tugas/code.html' },
    { match: /^selesai$/i,               href: '/verifikasi_penyelesaian_tugas/code.html' },
    { match: /^tandai selesai$/i,        href: '/verifikasi_penyelesaian_tugas/code.html' },
    { match: /^cek stok$/i,              href: '/stok_material_kendaraan/code.html' },
    { match: /^inspeksi$/i,              href: '/ar_asset_inspection/code.html' },
    { match: /^analitik$/i,              href: '/analitik_alert_pju/code.html' },
    { match: /^prediksi$/i,              href: '/ai_predictive_maintenance/code.html' },
    { match: /^absensi$/i,               href: '/absensi_kehadiran_teknisi/code.html' },
  ];

  // ── Deteksi modul aktif dari URL ─────────────────────────────────────────
  function getCurrentModuleId() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (parts.length >= 1 && parts[parts.length - 1] === 'code.html') {
      return parts[parts.length - 2];
    }
    return null;
  }

  // ── Path modul ───────────────────────────────────────────────────────────
  function modulePath(id) { return '/' + id + '/code.html'; }

  // ── Pastikan Material Symbols tersedia ───────────────────────────────────
  function ensureMaterialSymbols() {
    if (!document.querySelector('link[href*="Material+Symbols"]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0..1&display=swap';
      document.head.appendChild(l);
    }
  }

  // ── Perbaiki href="#" pada nav links ─────────────────────────────────────
  function fixNavLinks() {
    document.querySelectorAll('a[href="#"]').forEach(link => {
      // Ambil teks dari span child atau teks langsung
      const text = (
        Array.from(link.querySelectorAll('span:not(.material-symbols-outlined)'))
          .map(s => s.textContent.trim()).join(' ')
        || link.textContent.trim()
      ).toLowerCase().replace(/\s+/g, ' ');

      const dest = NAV_TEXT_MAP[text];
      if (dest) {
        link.href = dest;
        link.setAttribute('data-pju-fixed', '1');
      }
    });
  }

  // ── Perbaiki tombol aksi untuk navigasi demo ─────────────────────────────
  function fixActionButtons() {
    document.querySelectorAll('button').forEach(btn => {
      if (btn.getAttribute('data-pju-fixed')) return;
      const txt = btn.textContent.trim();
      for (const rule of ACTION_BUTTON_MAP) {
        if (rule.match.test(txt)) {
          btn.setAttribute('data-pju-fixed', '1');
          btn.addEventListener('click', (e) => {
            // Beri efek loading singkat, lalu navigasi
            const orig = btn.innerHTML;
            btn.innerHTML = '<span style="font-family:\'Material Symbols Outlined\';font-size:16px;vertical-align:middle;animation:pju-spin .6s linear infinite">autorenew</span> Memuat...';
            btn.disabled = true;
            setTimeout(() => { window.location.href = rule.href; }, 600);
          });
          break;
        }
      }
    });
  }

  // ── Tambahkan link pada logo/brand di header ─────────────────────────────
  function fixHeaderLogo() {
    // Bungkus elemen brand/judul dengan link ke home jika belum ada
    document.querySelectorAll('header a, nav a[href="/"]').forEach(() => {});
    // Cari elemen yang kemungkinan adalah logo brand
    const brandSelectors = [
      'header .brand', 'header .logo', 'header h1',
      'nav .logo', '.navbar-brand', '[class*="brand"]'
    ];
    brandSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (!el.closest('a') && !el.querySelector('a')) {
          el.style.cursor = 'pointer';
          el.title = 'Kembali ke Beranda';
          el.addEventListener('click', () => { window.location.href = '/'; });
        }
      });
    });
  }

  // ── Suntikkan UI widget navigasi ─────────────────────────────────────────
  function injectUI() {
    const currentId = getCurrentModuleId();

    // Gaya CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pju-spin { to { transform: rotate(360deg); display:inline-block; } }
      #pju-nav-btn {
        position:fixed;bottom:80px;right:16px;z-index:99999;
        width:52px;height:52px;border-radius:50%;
        background:#2563eb;color:#fff;border:none;cursor:pointer;
        box-shadow:0 4px 14px rgba(37,99,235,.45);
        display:flex;align-items:center;justify-content:center;
        font-family:'Material Symbols Outlined';font-variation-settings:'FILL' 1;
        font-size:22px;transition:transform .15s,box-shadow .15s;
      }
      #pju-nav-btn:hover{transform:scale(1.08);box-shadow:0 6px 20px rgba(37,99,235,.55);}
      #pju-home-btn {
        position:fixed;bottom:16px;right:16px;z-index:99999;
        height:40px;padding:0 14px;border-radius:20px;
        background:#1e3a8a;color:#fff;border:none;cursor:pointer;
        box-shadow:0 2px 8px rgba(0,0,0,.25);
        display:flex;align-items:center;gap:6px;
        font-family:inherit;font-size:13px;font-weight:600;
        transition:transform .15s;
      }
      #pju-home-btn:hover{transform:scale(1.04);}
      #pju-hub-overlay{
        position:fixed;inset:0;z-index:100000;
        background:rgba(0,0,0,.5);backdrop-filter:blur(4px);
        display:none;align-items:flex-end;justify-content:center;
      }
      #pju-hub-overlay.open{display:flex;}
      #pju-hub-panel{
        width:100%;max-width:900px;max-height:84vh;
        background:#fff;border-radius:20px 20px 0 0;
        padding:0 0 24px;overflow:hidden;
        display:flex;flex-direction:column;
        box-shadow:0 -8px 40px rgba(0,0,0,.2);
      }
      #pju-hub-header{
        padding:16px 20px 12px;
        display:flex;align-items:center;justify-content:space-between;
        border-bottom:1px solid #e2e8f0;flex-shrink:0;
      }
      #pju-hub-title{font-size:16px;font-weight:700;color:#1e3a8a;}
      #pju-hub-close{
        width:32px;height:32px;border-radius:50%;
        background:#f1f5f9;border:none;cursor:pointer;
        display:flex;align-items:center;justify-content:center;
        font-size:18px;color:#64748b;
      }
      #pju-hub-meta{
        padding:4px 20px 8px;font-size:12px;color:#94a3b8;flex-shrink:0;
      }
      #pju-hub-search{
        margin:4px 16px 8px;padding:8px 12px;
        border:1px solid #e2e8f0;border-radius:10px;
        font-size:13px;outline:none;width:calc(100% - 32px);
        box-sizing:border-box;
      }
      #pju-hub-search:focus{border-color:#2563eb;}
      #pju-hub-body{overflow-y:auto;padding:0 16px;flex:1;}
      .pju-cat-label{
        font-size:11px;font-weight:700;color:#94a3b8;
        text-transform:uppercase;letter-spacing:.06em;
        margin:14px 0 6px;grid-column:1/-1;
        display:flex;align-items:center;gap:8px;
      }
      .pju-cat-label::after{content:'';flex:1;height:1px;background:#e2e8f0;}
      #pju-hub-grid{
        display:grid;
        grid-template-columns:repeat(auto-fill,minmax(140px,1fr));
        gap:8px;
      }
      .pju-hub-item{
        display:flex;flex-direction:column;align-items:center;text-align:center;
        padding:10px 6px;border-radius:12px;text-decoration:none;
        background:#f8fafc;border:1.5px solid #e2e8f0;
        transition:background .12s,border-color .12s,transform .1s;
        color:#1e293b;font-size:11px;font-weight:600;line-height:1.3;
      }
      .pju-hub-item:hover{background:#eff6ff;border-color:#93c5fd;transform:translateY(-2px);}
      .pju-hub-item.active{background:#2563eb;border-color:#2563eb;color:#fff;}
      .pju-hub-item .ms{
        font-family:'Material Symbols Outlined';font-variation-settings:'FILL' 1;
        font-size:22px;margin-bottom:5px;line-height:1;
      }
      .pju-hub-item.active .ms{color:#fff;}
    `;
    document.head.appendChild(style);

    // Tombol Beranda
    const homeBtn = document.createElement('button');
    homeBtn.id = 'pju-home-btn';
    homeBtn.innerHTML = '<span style="font-family:\'Material Symbols Outlined\';font-variation-settings:\'FILL\' 1;font-size:15px;line-height:1">home</span> Beranda';
    homeBtn.title = 'Kembali ke halaman utama';
    homeBtn.onclick = () => { window.location.href = '/'; };
    document.body.appendChild(homeBtn);

    // Tombol hub ⚡
    const hubBtn = document.createElement('button');
    hubBtn.id = 'pju-nav-btn';
    hubBtn.title = 'Navigasi antar modul';
    hubBtn.textContent = 'apps';
    document.body.appendChild(hubBtn);

    // Overlay panel
    const overlay = document.createElement('div');
    overlay.id = 'pju-hub-overlay';
    overlay.innerHTML = `
      <div id="pju-hub-panel">
        <div id="pju-hub-header">
          <span id="pju-hub-title">⚡ Navigasi Modul PJU Cerdas</span>
          <button id="pju-hub-close">✕</button>
        </div>
        <div id="pju-hub-meta">50 modul tersedia • klik untuk berpindah</div>
        <input id="pju-hub-search" placeholder="🔍  Cari nama atau kategori modul..." autocomplete="off"/>
        <div id="pju-hub-body"><div id="pju-hub-grid"></div></div>
      </div>`;
    document.body.appendChild(overlay);

    // Render grid modul
    function renderGrid(filter) {
      const q = (filter || '').toLowerCase();
      const filtered = MODULES.filter(m =>
        !q || m.name.toLowerCase().includes(q) || m.id.includes(q) || m.category.toLowerCase().includes(q)
      );
      const cats = {};
      filtered.forEach(m => { (cats[m.category] = cats[m.category] || []).push(m); });
      const catOrder = ['Operasional','Pemeliharaan','Teknisi','Warga','PLN Mobile','Analitik','Sistem','Keamanan','Simulasi & DR'];
      const keys = [...catOrder.filter(c => cats[c]), ...Object.keys(cats).filter(c => !catOrder.includes(c))];
      const grid = document.getElementById('pju-hub-grid');
      grid.innerHTML = keys.map(cat => `
        <div class="pju-cat-label" style="grid-column:1/-1">${cat} <span style="font-weight:400;font-size:10px">(${cats[cat].length})</span></div>
        ${cats[cat].map(m => `
          <a href="${modulePath(m.id)}" class="pju-hub-item ${m.id === currentId ? 'active' : ''}">
            <span class="ms">${m.icon}</span>${m.name}
          </a>`).join('')}
      `).join('');
    }

    renderGrid('');

    // Event listeners
    hubBtn.onclick  = () => { overlay.classList.add('open'); document.getElementById('pju-hub-search').focus(); };
    document.getElementById('pju-hub-close').onclick  = () => overlay.classList.remove('open');
    overlay.onclick = e => { if (e.target === overlay) overlay.classList.remove('open'); };
    document.getElementById('pju-hub-search').oninput = e => renderGrid(e.target.value);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.classList.remove('open'); });
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  function init() {
    ensureMaterialSymbols();
    injectUI();
    fixNavLinks();
    fixActionButtons();
    fixHeaderLogo();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
