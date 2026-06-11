import { NAV_FOOTER, APP_VERSION } from './sidebar-data.js';

const ROLE_RANK = { editor: 1, admin: 2, owner: 3 };

const ICONS = {
  home:    '<path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"/>',
  users:   '<path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>',
  inbox:   '<path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clip-rule="evenodd"/>',
  cart:    '<path d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-2 4h12"/><circle cx="8" cy="18" r="1"/><circle cx="16" cy="18" r="1"/>',
  invoice: '<path d="M5 2h8l3 3v13H5z"/><path d="M8 8h6M8 11h6M8 14h4"/>',
  card:    '<path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9z" clip-rule="evenodd"/>',
  receipt: '<path d="M5 2h10v16l-2-1-2 1-3-1-3 1V2z"/><path d="M8 6h6M8 9h6M8 12h4"/>',
  gem:     '<path fill-rule="evenodd" d="M10 2L3 7l7 5 7-5-7-5zM3 13l7 5 7-5-7-5-7 5z" clip-rule="evenodd"/>',
  layers:  '<path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm-2 4a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>',
  box:     '<path d="M3 6l7-3 7 3v8l-7 3-7-3z"/><path d="M3 6l7 3 7-3M10 9v8"/>',
  chart:   '<path d="M3 16V9M8 16V4M13 16v-5M18 16H2"/>',
  shield:  '<path d="M10 2l6 3v5c0 4-3 6-6 8-3-2-6-4-6-8V5z"/>',
  pulse:   '<path d="M2 10h3l2-5 4 10 2-5h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  sliders: '<path d="M4 3v5M4 12v5M10 3v2M10 9v8M16 3v9M16 16v1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="4" cy="10" r="1.6"/><circle cx="10" cy="7" r="1.6"/><circle cx="16" cy="14" r="1.6"/>',
  gear:    '<path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.53 1.53 0 01-2.29.95c-1.37-.84-2.94.73-2.1 2.1a1.53 1.53 0 01-.95 2.29c-1.56.38-1.56 2.6 0 2.98a1.53 1.53 0 01.95 2.29c-.84 1.37.73 2.94 2.1 2.1a1.53 1.53 0 012.29.95c.38 1.56 2.6 1.56 2.98 0a1.53 1.53 0 012.29-.95c1.37.84 2.94-.73 2.1-2.1a1.53 1.53 0 01.95-2.29c1.56-.38 1.56-2.6 0-2.98a1.53 1.53 0 01-.95-2.29c.84-1.37-.73-2.94-2.1-2.1a1.53 1.53 0 01-2.29-.95zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>',
  external:'<path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>',
};

const svg = (key) =>
  `<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">${ICONS[key] || ''}</svg>`;

function canSee(itemRole, role) {
  return (ROLE_RANK[role] || 0) >= (ROLE_RANK[itemRole] || 1);
}

function linkHTML(item, activePage) {
  if (item.soon) {
    return `<span class="adm-nav-link adm-nav-link--soon" aria-disabled="true">`
      + `${svg(item.icon)}${item.label}<span class="adm-nav-soon-tag">pronto</span></span>`;
  }
  const active = item.href === activePage ? ' is-active' : '';
  const target = item.target ? ` target="${item.target}" rel="noopener"` : '';
  const badge  = item.badgeId ? `<span class="adm-nav-badge" id="${item.badgeId}" hidden></span>` : '';
  return `<a href="${item.href}" class="adm-nav-link${active}"${target}>${svg(item.icon)}${item.label}${badge}</a>`;
}

/**
 * Genera el HTML interno del rail (marca + nav agrupada + Ver sitio).
 * PURO: no toca el DOM ni Firebase.
 * @param {Array}  nav   árbol de grupos (sidebar-data.js NAV)
 * @param {Object} opts  { role, activePage }
 * @returns {string} HTML
 */
export function renderSidebar(nav, { role = 'editor', activePage = 'admin.html' } = {}) {
  const groups = nav.map(group => {
    const items = group.items
      .filter(it => canSee(it.role, role))
      .map(it => linkHTML(it, activePage))
      .join('');
    if (!items) return '';
    const label = group.label ? `<span class="adm-nav-label">${group.label}</span>` : '';
    return `<div class="adm-nav-group">${label}${items}</div>`;
  }).join('');

  const footer = `<div class="adm-nav-divider"></div>${linkHTML(NAV_FOOTER, activePage)}`;

  return `
    <div class="adm-brand">
      <div class="adm-brand-logo">
        <svg width="28" height="29" viewBox="0 0 80 84" fill="none" aria-hidden="true" class="adm-brand-logo-svg">
          <circle cx="40" cy="42" r="28" stroke="currentColor" stroke-width="1.2" opacity="0.85" fill="none"/>
          <line x1="40" y1="4" x2="40" y2="80" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>
          <text x="40" y="54" text-anchor="middle" font-family="Fraunces, serif" font-weight="600" font-size="32" fill="currentColor">B</text>
        </svg>
      </div>
      <div><div class="adm-brand-name">BERSAGLIO</div><div class="adm-brand-role">Panel Admin</div></div>
    </div>
    <nav class="adm-nav">${groups}${footer}</nav>
    <div class="adm-version" title="Versión del panel" style="padding:10px 16px;font-size:11px;letter-spacing:.04em;color:var(--adm-muted);opacity:.7;">${APP_VERSION}</div>`;
}
