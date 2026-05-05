// ============================================================
//  PLASTIMON SYS — shared/nav.js
//  Inyecta header pill + bottom nav pill en cada página.
//  Mismo estilo 1:1 que plastimon.html
//
//  USO: Nav.init('tab-activo')
//  Ejemplo en stock.html → Nav.init('stock')
// ============================================================

const LOGO_SVG = `
<svg viewBox="0 0 580 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .bt  { font-family:'Arial Black',Arial,sans-serif; font-weight:900; font-size:54px;
             stroke:#050514; stroke-width:12px; stroke-linejoin:round;
             paint-order:stroke; letter-spacing:8px; }
      .sys { font-family:'Arial Black',Arial,sans-serif; font-weight:900;
             font-size:32px; fill:#050514; letter-spacing:2px; }
    </style>
  </defs>
  <text x="36%" y="65" text-anchor="middle" class="bt">
    <tspan fill="#8B44A3">P</tspan><tspan fill="#00B8C4">L</tspan>
    <tspan fill="#00B8C4">A</tspan><tspan fill="#00B8C4">S</tspan>
    <tspan fill="#00B8C4">T</tspan><tspan fill="#00B8C4" font-size="48">i</tspan>
    <tspan fill="#FFCC00">M</tspan><tspan fill="#FFCC00">O</tspan>
    <tspan fill="#8B44A3">N</tspan>
  </text>
  <text x="495" y="60" class="sys">SYS</text>
</svg>`;

const NAV_TABS = [
  {
    id: 'venta',
    label: 'Venta',
    href: '/modulos/ventas.html',
    color: '#00B8C4',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>`,
  },
  {
    id: 'stock',
    label: 'Stock',
    href: '/modulos/stock.html',
    color: '#8B44A3',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <path d="M3.27 6.96L12 12.01l8.73-5.05"/><path d="M12 22.08V12"/>
    </svg>`,
  },
  {
    id: 'inicio',
    label: 'Inicio',
    href: '/index.html',
    color: '#F05A1A',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>`,
  },
  {
    id: 'clientes',
    label: 'Cli',
    href: '/modulos/clientes.html',
    color: '#FFCC00',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,
  },
  {
    id: 'ruta',
    label: 'Ruta',
    href: '/modulos/ruta.html',
    color: '#00B8C4',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>`,
  },
];

const Nav = {
  init(activeTab) {
    // ── Header ──────────────────────────────────────────────
    const header = document.createElement('header');
    header.innerHTML = `
      <button class="icon-btn" id="nav-search-btn" aria-label="Buscar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 21l-4.35-4.35"/><path d="M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0"/>
        </svg>
      </button>
      <div class="logo-wrap">${LOGO_SVG}</div>
      <button class="icon-btn" id="nav-notif-btn" aria-label="Notificaciones">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span class="notif-dot" id="notif-dot" style="display:none"></span>
      </button>`;
    document.body.prepend(header);

    // ── Bottom nav ───────────────────────────────────────────
    const nav = document.createElement('nav');
    nav.innerHTML = NAV_TABS.map(tab => {
      const active = tab.id === activeTab;
      return `
        <a href="${tab.href}"
           class="nav-item ${active ? 'active' : ''}"
           data-tab="${tab.id}">
          <div class="nav-icon-wrap"
               style="${active ? `color:${tab.color}` : 'color:#64748b'}">
            ${tab.icon}
          </div>
          <span class="nav-label"
                style="${active ? `color:${tab.color}` : ''}">${tab.label}</span>
        </a>`;
    }).join('');
    document.body.appendChild(nav);

    // ── Dot de notificaciones ────────────────────────────────
    Nav._checkNotifDot();
  },

  async _checkNotifDot() {
    try {
      if (typeof DB === 'undefined') return;
      const alertas = await DB.metricas.productosConAlerta();
      const dot = document.getElementById('notif-dot');
      if (dot) dot.style.display = alertas.length > 0 ? 'block' : 'none';
    } catch (_) { /* silencioso */ }
  },
};

window.Nav = Nav;