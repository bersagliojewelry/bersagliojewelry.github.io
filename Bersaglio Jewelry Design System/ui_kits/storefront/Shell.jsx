/* global React, fmt$ */
// Bersaglio storefront shell — logo, icons, header pill, footer, cart drawer.

// ── Inline line-icon set (stroke-only, the house style) ─────────────
const Icon = ({ d, size = 18, sw = 1.8, fill = 'none', children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d ? <path d={d} /> : children}
  </svg>
);
const IconCart   = (p) => <Icon {...p}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></Icon>;
const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Icon>;
const IconHeart  = (p) => <Icon {...p} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>;
const IconArrow  = (p) => <Icon {...p} sw={2} d="M5 12h14M13 5l7 7-7 7"/>;
const IconClose  = (p) => <Icon {...p} sw={2}><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></Icon>;
const IconPin    = (p) => <Icon {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="2.5"/></Icon>;
const IconShield = (p) => <Icon {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>;
const IconCheck  = (p) => <Icon {...p} d="M20 6L9 17l-5-5"/>;
const IconPen    = (p) => <Icon {...p} d="M12 20h9M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>;
const IconUser   = (p) => <Icon {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>;
const IconEye    = (p) => <Icon {...p}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></Icon>;
const ServiceIcon = ({ name, ...p }) => ({ pen: IconPen, user: IconUser, check: IconCheck, shield: IconShield }[name] || IconCheck)(p);

// ── Brand mark (serif B in circle with construction axis) ───────────
const BersaglioLogo = ({ size = 28 }) => (
  <svg width={size} height={size * 1.05} viewBox="0 0 80 84" fill="none" style={{ display: 'block' }}>
    <circle cx="40" cy="42" r="28" stroke="#0f5132" strokeWidth="1.2" opacity="0.85" />
    <line x1="40" y1="4" x2="40" y2="80" stroke="#0f5132" strokeWidth="0.8" opacity="0.5" />
    <text x="40" y="54" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="600" fontSize="32" fill="#0f5132">B</text>
  </svg>
);

// ── Header — floating Dynamic Island pill ───────────────────────────
function Header({ route, navigate, cartCount, onCart, onSearch, wishlistCount }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const nav = [
    { k: 'home', label: 'Inicio' },
    { k: 'catalogo', label: 'Colecciones' },
    { k: 'nosotros', label: 'Nosotros' },
    { k: 'contacto', label: 'Contacto' },
  ];
  return (
    <div className="bj-header">
      <div className={'bj-header-pill glass glass-iridescent' + (scrolled ? ' is-scrolled' : '')}>
        <button className="bj-header-logo" onClick={() => navigate('home')}>
          <BersaglioLogo size={28} />
          <div className="bj-header-logo-text">
            <div className="bj-header-brand">BERSAGLIO</div>
            <div className="bj-header-sub">Jewelry</div>
          </div>
        </button>
        <nav className="bj-header-nav">
          {nav.map((n) => {
            const active = route === n.k || (n.k === 'catalogo' && route === 'pieza');
            return (
              <button key={n.k} className={'bj-nav-pill' + (active ? ' is-active' : '')}
                onClick={() => navigate(n.k)}>{n.label}</button>
            );
          })}
        </nav>
        <button className="bj-header-cart" onClick={onSearch} title="Buscar (Ctrl K)" style={{ marginRight: 2 }}>
          <IconSearch size={16} />
        </button>
        <button className="bj-header-cart" onClick={() => navigate('lista-deseos')} title="Favoritos" style={{ marginRight: 2 }}>
          <IconHeart size={16} />
          {wishlistCount > 0 && <span className="bj-header-badge">{wishlistCount}</span>}
        </button>
        <button className="bj-header-cart" onClick={onCart} title="Carrito">
          <IconCart size={16} />
          {cartCount > 0 && <span className="bj-header-badge">{cartCount}</span>}
        </button>
      </div>
    </div>
  );
}

// ── Cart drawer ─────────────────────────────────────────────────────
function CartDrawer({ open, items, onClose, onQty, onRemove, onCheckout }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <React.Fragment>
      <div className={'bj-drawer-backdrop' + (open ? ' is-open' : '')} onClick={onClose} />
      <aside className={'bj-cart-drawer' + (open ? ' is-open' : '')}>
        <div className="bj-cart-header">
          <div>
            <div className="eyebrow">Carrito</div>
            <h3 className="bj-cart-title">Tus joyas</h3>
          </div>
          <button className="bj-cart-close" onClick={onClose}><IconClose size={14} /></button>
        </div>
        <div className="bj-cart-body">
          {items.length === 0 && (
            <div className="bj-cart-empty">
              <div className="bj-cart-empty-icon" style={{ width: 140, height: 140, background: 'none', borderRadius: 0 }}>
                <img src="../../assets/cart-gems.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 24px oklch(42% 0.14 155 / 0.3))' }} />
              </div>
              <div className="bj-cart-empty-title">Aún sin piezas</div>
              <p className="bj-cart-empty-sub">Tu colección comienza con una historia. Explora el atelier.</p>
            </div>
          )}
          {items.map((i) => (
            <div key={i.id} className="bj-cart-row">
              <div className="bj-cart-row-img" style={{ backgroundImage: `url(${i.img})` }} />
              <div className="bj-cart-row-body">
                <div>
                  <div className="bj-cart-row-name">{i.name}</div>
                  <div className="mono bj-cart-row-meta">{fmt$(i.price)}</div>
                </div>
                <div className="bj-cart-row-controls">
                  <div className="bj-cart-qty">
                    <button className="bj-cart-qty-btn" onClick={() => onQty(i.id, i.qty - 1)}>−</button>
                    <span className="mono bj-cart-qty-val">{i.qty}</span>
                    <button className="bj-cart-qty-btn" onClick={() => onQty(i.id, i.qty + 1)}>+</button>
                  </div>
                  <button className="bj-cart-row-remove" onClick={() => onRemove(i.id)}>Quitar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="bj-cart-footer">
            <div className="bj-cart-subtotal-row">
              <span className="eyebrow">Subtotal</span>
              <span className="mono bj-cart-subtotal">{fmt$(subtotal)}</span>
            </div>
            <button className="btn-aqua btn-aqua-emerald bj-cart-checkout-btn" onClick={onCheckout}>
              Ir al checkout <IconArrow size={14} />
            </button>
            <p className="bj-cart-note">Asesoría personalizada antes de cada compra · Envío asegurado mundial</p>
          </div>
        )}
      </aside>
    </React.Fragment>
  );
}

// ── Footer ──────────────────────────────────────────────────────────
function Footer({ navigate }) {
  const cols = [
    { t: 'Colecciones', l: [['Anillos', 'catalogo'], ['Topos & Aretes', 'catalogo'], ['Argollas', 'catalogo'], ['Dijes', 'catalogo']] },
    { t: 'Casa', l: [['Nuestra historia', 'nosotros'], ['Diseño a medida', 'contacto'], ['Certificaciones', 'nosotros'], ['The Journal', 'journal']] },
    { t: 'Servicio', l: [['Contacto', 'contacto'], ['Asesoría', 'contacto'], ['Envíos', 'terminos'], ['Garantía', 'terminos']] },
  ];
  return (
    <footer className="bj-footer">
      <div className="k-container">
        <div className="bj-footer-grid glass glass-iridescent">
          <div className="bj-footer-brand">
            <div className="bj-footer-logo-row">
              <BersaglioLogo size={34} />
              <div className="bj-footer-brand-name">BERSAGLIO</div>
            </div>
            <p className="bj-footer-tagline">Alta joyería con esmeraldas colombianas, diamantes certificados y oro 18K. Piezas diseñadas para trascender generaciones.</p>
          </div>
          {cols.map((col) => (
            <div key={col.t}>
              <div className="eyebrow bj-footer-col-title">{col.t}</div>
              <ul className="bj-footer-col-list">
                {col.l.map(([lab, r]) => (
                  <li key={lab}><a onClick={() => navigate(r)} style={{ cursor: 'pointer' }}>{lab}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="bj-footer-meta">
          <span>© 2026 Bersaglio Jewelry · Cartagena de Indias, Colombia</span>
          <span className="bj-footer-legal">
            <span className="bj-footer-legal-links">
              <a onClick={() => navigate('terminos')}>Términos</a>
              <span aria-hidden="true">·</span>
              <a onClick={() => navigate('privacidad')}>Cookies</a>
              <span aria-hidden="true">·</span>
              <a onClick={() => navigate('privacidad')}>Privacidad</a>
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, {
  BersaglioLogo, Header, CartDrawer, Footer, ServiceIcon,
  IconCart, IconSearch, IconHeart, IconArrow, IconClose, IconPin, IconShield, IconCheck, IconPen, IconUser, IconEye,
});
