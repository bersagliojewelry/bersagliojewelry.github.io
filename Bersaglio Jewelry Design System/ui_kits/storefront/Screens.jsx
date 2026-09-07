/* global React, CATEGORIES, PRODUCTS, MARQUEE, SERVICES, fmt$,
   BersaglioLogo, IconArrow, IconHeart, IconPin, IconShield, IconCheck, ServiceIcon */
// Bersaglio storefront — Home, Catalog and Product-detail screens.

const Diamond = () => (
  <span className="dia" style={{ display: 'inline-flex', alignItems: 'center' }}>
    <svg width="6" height="6" viewBox="0 0 10 10"><rect x="2.5" y="2.5" width="5" height="5" transform="rotate(45 5 5)" fill="currentColor" /></svg>
  </span>
);

// Count-up that fires when scrolled into view (scroll-based; IO is unreliable in preview)
function CountUp({ to, suffix = '', dur = 1400 }) {
  const [n, setN] = React.useState(0);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    let id, anim;
    const animate = () => {
      const steps = Math.max(1, Math.round(dur / 16));
      let i = 0;
      anim = setInterval(() => {
        i++; const p = Math.min(1, i / steps);
        setN(Math.round((1 - Math.pow(1 - p, 3)) * to));
        if (p >= 1) clearInterval(anim);
      }, 16);
    };
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) { animate(); return; }
      id = setTimeout(check, 120);
    };
    id = setTimeout(check, 60);
    return () => { clearTimeout(id); clearInterval(anim); };
  }, [to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

// Scroll-reveal driven by React state so it survives re-renders (className stays applied)
function useReveal(delay = 0) {
  const ref = React.useRef(null);
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    if (shown) return;
    const el = ref.current; if (!el) return;
    let id;
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > -40) { setShown(true); return; }
      id = setTimeout(check, 120);
    };
    id = setTimeout(check, 60);
    return () => clearTimeout(id);
  }, [shown]);
  return [ref, 'reveal' + (shown ? ' in' : ''), { '--d': delay + 'ms' }];
}

// One animated category tile
function CatTile({ c, i, navigate }) {
  const [ref, cls, st] = useReveal(i * 70);
  return (
    <a ref={ref} className={'glass k-cat ' + cls} style={st} onClick={() => navigate('catalogo')}>
      <div className="k-cat-inner">
        <div className="k-cat-img" style={{ backgroundImage: `url(${c.img})` }} />
        <div className="k-cat-shade" />
        <div className="k-cat-body">
          <div className="k-cat-name">{c.name}</div>
          <div className="mono k-cat-count">Ver piezas</div>
        </div>
      </div>
    </a>
  );
}

// One animated service card
function ServiceCard({ s, i }) {
  const [ref, cls, st] = useReveal(i * 80);
  return (
    <div ref={ref} className={'glass ' + cls} style={{ padding: '26px 22px', borderRadius: 28, textAlign: 'center', ...st }}>
      <div style={{ width: 60, height: 60, margin: '0 auto 16px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, oklch(95% 0.08 150), oklch(65% 0.17 155) 70%)', boxShadow: 'inset 0 2px 0 oklch(100% 0 0 / 0.9), 0 8px 24px -4px oklch(50% 0.15 155 / 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <ServiceIcon name={s.icon} size={22} sw={1.6} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 500, color: 'var(--bj-ink-emerald)', marginBottom: 8 }}>{s.t}</div>
      <p style={{ fontSize: 13, color: 'var(--bj-ink-soft)', lineHeight: 1.6 }}>{s.d}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// HOME — mirror of js/pages/home.js (9 sections, .home-* / .at-* / .hj-* classes)
// ════════════════════════════════════════════════════════════════════
const HOME_MARQUEE = ['Oro 18K · Ley 750', 'Esmeraldas Colombianas', 'Asesoría Personalizada', 'Garantía Vitalicia', 'Atelier en Cartagena', 'Envío Asegurado Mundial', 'Una pieza, una historia'];
const HOME_CATEGORIES = [
  { name: 'Anillos',   slug: 'anillos',         img: '../../assets/ring-sapphire.webp',     hue: 200, pos: 'center' },
  { name: 'Topos',     slug: 'topos-aretes',    img: '../../assets/earrings-travertino.webp', hue: 30,  pos: 'center' },
  { name: 'Argollas',  slug: 'argollas',        img: '../../assets/earrings-emerald.webp',  hue: 155, pos: 'center' },
  { name: 'Dijes',     slug: 'dijes-colgantes', img: '../../assets/model-emerald.webp',     hue: 155, pos: 'center top' },
  { name: 'Pulseras',  slug: 'pulseras',        img: '../../assets/banner-hero.webp',       hue: 90,  pos: 'center' },
  { name: 'Editorial', slug: 'editorial',       img: '../../assets/model-emerald.webp',     hue: 155, pos: 'center' },
];
const HOME_SERVICES = [
  { t: 'Diseño a medida',   d: 'Crea la pieza de tus sueños con nuestro atelier. Desde boceto hasta entrega.',  icon: <React.Fragment><path d="m12 19 7-7 3 3-7 7-3-3z" /><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="m2 2 7.586 7.586" /><circle cx="11" cy="11" r="2" /></React.Fragment> },
  { t: 'Asesoría privada',  d: 'Consulta 1:1 con nuestros gemólogos. Virtual o en nuestra casa en Cartagena.',  icon: <React.Fragment><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></React.Fragment> },
  { t: 'Certificación GIA', d: 'Cada pieza con diamante incluye certificado del Gemological Institute.',        icon: <React.Fragment><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /><path d="m9 12 2 2 4-4" /></React.Fragment> },
  { t: 'Garantía vitalicia',d: 'Mantenimiento, pulido y verificación de piedras de por vida.',                  icon: <React.Fragment><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></React.Fragment> },
];
const HOME_ATELIER_STEPS = [
  { n: '01', t: 'El Diseño y Concepto',     d: 'Concebimos la joya desde el boceto inicial sobre papel, seleccionando metales nobles y gemas con carácter propio.', corner: 0 },
  { n: '02', t: 'Asesoría Confidencial',    d: 'Te acompañamos en cada etapa de la elección. Un diálogo íntimo y pausado para dar con la pieza exacta que refleje tu legado.', corner: 1 },
  { n: '03', t: 'Garantía y Certificación', d: 'Respaldamos la autenticidad y excelencia de cada piedra con reportes internacionales de la GIA y origen de mina.', corner: 2 },
  { n: '04', t: 'Custodia de por vida',     d: 'Nuestras piezas nacen con vocación de eternidad. Ofrecemos mantenimiento, pulido y restauración vitalicia sin límites.', corner: 3 },
];

function HomeScreen({ navigate, openPieza, wishlist, toggleWish, openQuickView, openEntrada }) {
  const featured = PRODUCTS.slice(0, 6);
  const tripled = [...HOME_MARQUEE, ...HOME_MARQUEE, ...HOME_MARQUEE];
  const cover = JOURNAL.find((e) => e.featured) || JOURNAL[0];
  const rest = JOURNAL.filter((e) => e !== cover);
  const journalSide = rest.slice(0, 4).map((e) => ({ sec: e.section, date: e.date, title: e.title, read: e.read, slug: e.slug }));
  const journalTrio = rest.slice(4, 7).map((t) => ({ sec: t.section, title: t.title, who: t.author, img: t.img, slug: t.slug }));
  const tickerDoubled = [...JOURNAL_TICKER, ...JOURNAL_TICKER];
  return (
    <React.Fragment>
      {/* 1. HERO */}
      <section className="home-hero" data-hero>
        <div aria-hidden="true" className="home-hero-bg">
          <div className="home-hero-blob home-hero-blob--em" />
          <div className="home-hero-blob home-hero-blob--gold" />
        </div>
        <div className="home-hero-stage">
          <div className="home-hero-frame">
            <div className="home-hero-banner" data-tilt>
              <picture className="home-hero-img" data-tilt-img>
                <img src="../../assets/banner-hero.webp" alt="Atelier Bersaglio en Cartagena de Indias" fetchPriority="high" decoding="async" className="home-hero-img-fallback" />
              </picture>
              <div aria-hidden="true" className="home-hero-rim" />
              <div className="home-hero-content">
                <div className="home-hero-locator-row">
                  <div className="mono home-hero-locator">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="2.5" /></svg>
                    Cartagena de Indias · Colombia
                  </div>
                </div>
                <div className="home-hero-body">
                  <div className="home-hero-eyebrow-row">
                    <span className="home-hero-eyebrow-line" />
                    <span className="mono home-hero-eyebrow">Alta Joyería Personalizada y de Confianza</span>
                  </div>
                  <h1 className="home-hero-headline">
                    El arte de escuchar tu historia,<br />
                    <span className="home-hero-headline-italic">tallado en una joya única.</span>
                  </h1>
                  <p className="home-hero-manifesto">Nacimos visitando a nuestros clientes de puerta en puerta, cimentando una relación de cercanía y confianza duradera. En nuestro atelier privado del Centro Histórico de Cartagena, no diseñamos simples accesorios: nos tomamos el tiempo para asesorarte y dar vida a piezas irrepetibles de oro de 18 quilates y esmeraldas colombianas éticas. Una inversión emocional y material destinada a custodiar tu esencia para siempre.</p>
                  <div className="home-hero-actions">
                    <button className="btn-hero" onClick={() => navigate('catalogo')}>
                      <span className="btn-hero-bg" aria-hidden="true" />
                      <span className="btn-hero-shimmer" aria-hidden="true" />
                      <span className="btn-hero-label">Descubrir la colección</span>
                      <span className="btn-hero-arrow" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="home-hero-signature">
                <span className="mono home-hero-signature-eyebrow">Una creación de</span>
                <span className="home-hero-signature-line" />
                <span className="home-hero-signature-name">Kary Mendoza</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MARQUEE */}
      <section className="home-marquee">
        <div className="hm-track">
          <div className="hm-fade hm-fade--left" aria-hidden="true" />
          <div className="hm-fade hm-fade--right" aria-hidden="true" />
          <div className="hm-row">
            {tripled.map((t, i) => (
              <div key={i} className="hm-item">
                <span className="hm-text">{t}</span>
                <span aria-hidden="true" className="hm-sep">
                  <span className="hm-sep-line" />
                  <svg width="6" height="6" viewBox="0 0 10 10"><rect x="2.5" y="2.5" width="5" height="5" transform="rotate(45 5 5)" fill="currentColor" /></svg>
                  <span className="hm-sep-line" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES */}
      <section className="home-cats">
        <div className="container">
          <div className="home-cats-header">
            <div className="eyebrow">Colecciones singulares</div>
            <h2 className="home-cats-title">La refracción del <span className="italic emerald-text">alma verde</span></h2>
            <p className="home-cats-lead">Nuestras colecciones son capítulos de una historia compartida. Cada anillo, arete y dije es esculpido pacientemente en oro de 18K, rindiendo homenaje al fuego interno y la mística de la esmeralda colombiana.</p>
          </div>
          <div className="cat-dock">
            {HOME_CATEGORIES.map((c) => {
              const count = PRODUCTS.filter((p) => p.collection === c.slug).length;
              return (
                <a key={c.slug} className="glass cat-tile" onClick={() => navigate('catalogo')} style={{ '--cat-hue': c.hue }}>
                  <div className="cat-tile-inner">
                    <div className="cat-tile-img" style={{ background: `url('${c.img}') ${c.pos}/cover` }} />
                    <div className="cat-tile-overlay" />
                    <div className="cat-tile-content">
                      <div className="cat-tile-name">{c.name}</div>
                      <div className="mono cat-tile-count">{count > 0 ? `${count} pieza${count === 1 ? '' : 's'}` : 'Próximamente'}</div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FEATURED */}
      <section className="home-featured">
        <div className="container">
          <div className="home-featured-header">
            <div>
              <div className="eyebrow">Curaduría del Atelier</div>
              <h2 className="home-featured-title">Piezas <span className="italic emerald-text">singulares</span></h2>
            </div>
            <button className="btn-aqua home-featured-cta" onClick={() => navigate('catalogo')}>
              Explorar el catálogo entero
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </button>
          </div>
          <div className="home-featured-grid">
            {featured.map((p) => {
              const tag = p.tag || (p.featured ? 'Destacada' : null);
              const stones = p.specs?.stones || p.specs?.stone || '';
              const metal = p.specs?.metal || p.specs?.gold || '';
              const col = COLLECTIONS.find((c) => c.slug === p.collection);
              const wished = wishlist.includes(p.id);
              return (
                <a key={p.id} className="glass glass-iridescent home-featured-card" onClick={() => openPieza(p.id)}>
                  <div className="home-featured-card-imgwrap">
                    <div className="home-featured-card-img" style={{ background: `url('${p.images?.[0] || p.img}') center/cover` }} />
                    <div className="home-featured-card-vignette" aria-hidden="true" />
                    {tag && (
                      <div className="home-featured-card-tag">
                        <div className="chip"><span className="chip-dot" />{tag}</div>
                      </div>
                    )}
                    <button className="home-featured-card-wishlist" aria-label="Guardar" onClick={(e) => { e.stopPropagation(); toggleWish(p.id); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    </button>
                  </div>
                  <div className="home-featured-card-body">
                    <div className="home-featured-card-cat">{col?.name || p.collection}</div>
                    <div className="home-featured-card-name">{p.name}</div>
                    <div className="home-featured-card-meta">{[stones, metal].filter(Boolean).join(' · ')}</div>
                    <div className="home-featured-card-foot">
                      <div className="mono home-featured-card-price">{fmt$(p.price)}</div>
                      <div className="home-featured-card-arrow">
                        Ver pieza
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL */}
      <section className="home-editorial">
        <div className="container">
          <div className="home-editorial-grid">
            <div className="glass glass-iridescent home-editorial-image">
              <div className="home-editorial-image-bg" />
              <div className="home-editorial-image-shade" />
              <div className="home-editorial-image-content">
                <div className="chip home-editorial-chip"><span className="chip-dot" />Editorial</div>
                <h3 className="home-editorial-image-title">La Verde, 2026</h3>
                <p className="home-editorial-image-sub">Seis piezas esculpidas alrededor de la luz esmeralda colombiana.</p>
              </div>
            </div>
            <div className="glass home-editorial-text">
              <div className="eyebrow">Nuestra filosofía</div>
              <h2 className="home-editorial-title">
                El arte de la orfebrería pausada:<br />
                <span className="italic emerald-text">más que una joya, un legado familiar.</span>
              </h2>
              <p className="home-editorial-lead">Entendemos la esmeralda y el oro de 18 quilates como portadores de la memoria humana. Nos convertimos en cómplices silenciosos de los instantes que definen una vida: promesas que trascienden el tiempo, hitos de amor incondicional y el recuerdo indeleble de quienes somos.</p>
              <blockquote className="home-editorial-quote">"Nuestras esmeraldas colombianas de Muzo y Chivor no son meras pertenencias; son fragmentos de tierra viva custodiados por almas sensibles para ser entregados a la siguiente generación."</blockquote>
              <div className="home-editorial-stats">
                <div className="home-editorial-stat">
                  <div className="display home-editorial-stat-num"><CountUp to={12} suffix="+" /></div>
                  <div className="eyebrow home-editorial-stat-lab">Años</div>
                </div>
                <div className="home-editorial-stat">
                  <div className="display home-editorial-stat-num"><CountUp to={800} suffix="+" /></div>
                  <div className="eyebrow home-editorial-stat-lab">Piezas únicas</div>
                </div>
                <div className="home-editorial-stat">
                  <div className="display home-editorial-stat-num">JA</div>
                  <div className="eyebrow home-editorial-stat-lab">Certificado</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SERVICES */}
      <section className="home-services">
        <div className="container">
          <div className="home-services-header">
            <div className="eyebrow">El valor de lo excepcional</div>
            <h2 className="home-services-title">Una experiencia a la altura<br /><span className="italic emerald-text">de tu propia historia</span></h2>
          </div>
          <div className="home-services-grid">
            {HOME_SERVICES.map((s) => (
              <div key={s.t} className="glass home-service-card">
                <div className="home-service-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{s.icon}</svg>
                </div>
                <div className="home-service-name">{s.t}</div>
                <p className="home-service-desc">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. ATELIER — process scene with central jewel */}
      <section className="home-atelier">
        <div className="container">
          <div className="home-atelier-header">
            <div className="chip"><span className="chip-dot" />Atelier Bersaglio</div>
            <h2 className="home-atelier-title">El viaje de creación de <span className="italic emerald-text">una pieza de culto</span></h2>
            <p className="home-atelier-lead">Un recorrido artesanal meticuloso que transforma una visión en un objeto eterno.</p>
          </div>
          <div className="glass glass-iridescent at-stage">
            <svg className="at-flow" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="at-flow-g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(80% 0.13 85)" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="oklch(68% 0.15 155)" stopOpacity="0.65" />
                </linearGradient>
              </defs>
              <g fill="none" stroke="url(#at-flow-g)" strokeWidth="1.5" strokeDasharray="2 9" strokeLinecap="round" vectorEffect="non-scaling-stroke">
                <path className="at-flow-1" d="M180 150 Q 370 268 470 278" />
                <path className="at-flow-2" d="M820 150 Q 630 268 530 278" />
                <path className="at-flow-3" d="M180 410 Q 370 292 470 282" />
                <path className="at-flow-4" d="M820 410 Q 630 292 530 282" />
              </g>
            </svg>
            <div aria-hidden="true" className="at-halo" />
            <div aria-hidden="true" className="at-ring" />
            <div className="at-jewel">
              <img src="../../assets/gema.png" alt="Esmeralda Bersaglio engastada en oro" className="at-jewel-img" loading="lazy" decoding="async" />
            </div>
            {HOME_ATELIER_STEPS.map((s) => (
              <div key={s.n} className={'at-card at-card--corner-' + s.corner}>
                <div className="at-card-title"><span className="at-card-dot" aria-hidden="true" />{s.t}</div>
                <p className="at-card-desc">{s.d}</p>
              </div>
            ))}
            <div className="at-cta">
              <button className="btn-aqua btn-aqua-emerald" onClick={() => navigate('contacto')}>
                Iniciar mi pieza
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. JOURNAL — NYT-style masthead */}
      <section className="home-journal">
        <div className="container">
          <div className="hj-masthead">
            <div className="hj-masthead-brand">
              <div className="mono hj-est">EST. 2014</div>
              <div className="hj-est-divider" />
              <h2 className="hj-masthead-title">The <span className="italic">Bersaglio</span> Journal</h2>
            </div>
            <div className="hj-masthead-meta">
              <div className="mono hj-issue">{JOURNAL_ISSUE.number} · {cover.dateLong}</div>
              <button className="btn-aqua hj-archive-btn" onClick={() => navigate('journal')}>
                Archivo completo
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
          <div className="hj-masthead-line" />

          <div className="glass hj-ticker">
            <div className="mono hj-ticker-tag"><span className="hj-ticker-pulse" />EN VIVO</div>
            <div className="hj-ticker-clip">
              <div className="hj-ticker-track">
                {tickerDoubled.map((t, i) => (
                  <span key={i} className="hj-ticker-item">{t}<span className="hj-ticker-diamond">◆</span></span>
                ))}
              </div>
            </div>
          </div>

          <div className="journal-fold hj-fold">
            <article className="hj-cover">
              <a className="hj-cover-link" onClick={() => openEntrada ? openEntrada(cover.slug) : navigate('journal')}>
                <div className="hj-cover-imgwrap">
                  <img src={cover.img} alt={cover.title} className="hj-cover-img" loading="lazy" decoding="async" />
                  <div aria-hidden="true" className="hj-cover-vignette" />
                  <div className="hj-cover-flag-row">
                    <span className="mono hj-cover-flag">{cover.section.toUpperCase()}</span>
                    <span className="mono hj-cover-read">{cover.read} de lectura</span>
                  </div>
                  <div className="hj-cover-caption">
                    <div className="mono hj-cover-kicker">{cover.kicker}</div>
                  </div>
                </div>
                <h3 className="hj-cover-title">{cover.title}</h3>
                <p className="hj-cover-excerpt cover-excerpt">
                  <span className="hj-cover-dropcap">{cover.excerpt.charAt(0)}</span>{cover.excerpt.slice(1)}
                </p>
                <div className="hj-cover-meta">
                  <div className="hj-cover-author-row">
                    <div className="hj-cover-avatar">MB</div>
                    <div>
                      <div className="hj-cover-author">{cover.author}</div>
                      <div className="mono hj-cover-date">{(cover.dateLong || '').toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="hj-cover-continue">
                    Continuar leyendo
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </a>
            </article>
            <aside className="hj-side">
              <div className="hj-side-header">
                <h4 className="hj-side-title">Más leídos</h4>
                <div className="mono hj-side-week">ESTA SEMANA</div>
              </div>
              {journalSide.map((s, i) => (
                <article key={s.slug} className="hj-side-row">
                  <a className="hj-side-link" onClick={() => openEntrada ? openEntrada(s.slug) : navigate('journal')}>
                    <div className="hj-side-num">0{i + 1}</div>
                    <div>
                      <div className="mono hj-side-meta">
                        <span>{s.sec}</span><span className="hj-side-meta-dot">·</span><span className="hj-side-meta-date">{s.date}</span>
                      </div>
                      <h5 className="hj-side-headline">{s.title}</h5>
                      <div className="mono hj-side-read">{s.read} de lectura</div>
                    </div>
                  </a>
                </article>
              ))}
              <div className="glass glass-emerald hj-newsletter">
                <div className="mono hj-newsletter-tag">NEWSLETTER</div>
                <div className="hj-newsletter-title">Una nota cada<br /><span className="italic hj-newsletter-italic">luna llena</span></div>
                <form className="hj-newsletter-form" onSubmit={(e) => e.preventDefault()}>
                  <input type="email" name="email" placeholder="tu@correo.com" className="hj-newsletter-input" autoComplete="email" required />
                  <button type="submit" className="hj-newsletter-btn">Suscribir</button>
                </form>
              </div>
            </aside>
          </div>

          {journalTrio.length >= 3 && (
            <div className="journal-trio hj-trio">
              {journalTrio.map((t) => (
                <article key={t.slug} className="hj-trio-item">
                  <a className="hj-trio-link" onClick={() => openEntrada ? openEntrada(t.slug) : navigate('journal')}>
                    <div className="hj-trio-imgwrap">
                      <img src={t.img} alt={t.title} className="hj-trio-img" loading="lazy" decoding="async" />
                      <div aria-hidden="true" className="hj-trio-vignette" />
                      <span className="mono hj-trio-flag">{t.sec}</span>
                    </div>
                    <h4 className="hj-trio-title">{t.title}</h4>
                    <div className="mono hj-trio-who">{t.who}</div>
                  </a>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 8.5 — Bersaglio Films + Social feed */}
      <FilmsSection />
      <SocialSection />

      {/* 9. CTA — Cartagena */}
      <section className="home-cta">
        <div className="container">
          <div className="glass glass-iridescent home-cta-card">
            <div className="home-cta-glow" aria-hidden="true" />
            <div className="home-cta-content">
              <div className="eyebrow">Visita nuestro Atelier privado</div>
              <h2 className="home-cta-title">Nuestra Maison<br /><span className="italic emerald-text">Cartagena de Indias</span></h2>
              <p className="home-cta-lead">Te invitamos a cruzar el umbral de nuestro atelier en el corazón del Centro Histórico. A puerta cerrada y con la calma de un buen café, conversaremos sin prisa sobre la pieza que habitará en tu linaje familiar.</p>
              <p className="mono home-cta-addr">Calle 36 # 6-32 · San Agustín Chiquita<br />Centro Histórico · Bolívar, Colombia</p>
              <div className="home-cta-actions">
                <button className="btn-aqua btn-aqua-emerald" onClick={() => navigate('contacto')}>Agendar cita privada</button>
                <button className="btn-aqua" onClick={() => navigate('catalogo')}>Explorar colecciones</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}

// ════════════════════════════════════════════════════════════════════
// PRODUCT CARD (shared)
// ════════════════════════════════════════════════════════════════════
function ProductCard({ p, onOpen, wished, toggleWish, idx = 0, openQuickView }) {
  const [ref, cls, st] = useReveal((idx % 4) * 80);
  return (
    <a ref={ref} className={'glass glass-iridescent k-card ' + cls} style={st} onClick={() => onOpen(p.id)}>
      <div className="k-card-img">
        <div style={{ backgroundImage: `url(${p.img})` }} />
        <div className="k-card-vig" />
        {p.tag && <div className="k-card-tag"><span className="chip"><span className="chip-dot" />{p.tag}</span></div>}
        {openQuickView && (
          <button className="k-card-qv" title="Vista rápida" onClick={(e) => { e.stopPropagation(); openQuickView(p.id); }}>
            <IconEye size={15} sw={1.7} />
          </button>
        )}
        <button className={'k-card-wish' + (wished ? ' on' : '')}
          onClick={(e) => { e.stopPropagation(); toggleWish(p.id); }}>
          <IconHeart size={14} sw={1.8} fill={wished ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="k-card-body">
        <div className="k-card-cat">{p.cat}</div>
        <div className="k-card-name">{p.name}</div>
        <div className="k-card-meta">{[p.stones, p.gold].filter(Boolean).join(' · ')}</div>
        <div className="k-card-foot">
          <span className="k-card-price">{fmt$(p.price)}</span>
          <span className="k-card-arrow">Ver pieza <IconArrow size={10} /></span>
        </div>
      </div>
    </a>
  );
}

// ════════════════════════════════════════════════════════════════════
// CATALOG — mirror of js/pages/catalogo.js (cat-page · cat-pills · cat-grid)
// ════════════════════════════════════════════════════════════════════
const CATALOG_SORTS = [
  { key: 'destacados', label: 'Destacados' },
  { key: 'menor',      label: 'Precio · menor' },
  { key: 'mayor',      label: 'Precio · mayor' },
  { key: 'nombre',     label: 'Nombre A-Z' },
];

function CatalogScreen({ openPieza }) {
  const [cat, setCat] = React.useState('all');
  const [sort, setSort] = React.useState('destacados');
  const collections = [{ slug: 'all', name: 'Todo' }, ...COLLECTIONS];
  const activeCol = cat !== 'all' ? COLLECTIONS.find((c) => c.slug === cat) : null;
  const title = activeCol
    ? <React.Fragment>{activeCol.name} <span className="italic emerald-text">en cristal</span></React.Fragment>
    : <React.Fragment>Todas las <span className="italic emerald-text">piezas</span></React.Fragment>;
  const lead = activeCol?.description || 'Explora nuestra colección completa. Cada pieza es única, con certificación de origen y oro de ley 750.';

  let list = cat === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.collection === cat);
  if (sort === 'menor')       list = [...list].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  else if (sort === 'mayor')  list = [...list].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  else if (sort === 'nombre') list = [...list].sort((a, b) => String(a.name).localeCompare(String(b.name)));
  else                        list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <div className="container cat-page">
      <div className="cat-page-header">
        <div className="eyebrow cat-page-eyebrow">Catálogo · 2026</div>
        <h1 className="cat-page-title">{title}</h1>
        <p className="cat-page-lead">{lead}</p>
      </div>

      <div className="cat-controls">
        <div className="glass cat-pills" role="tablist" aria-label="Filtrar por colección">
          {collections.map((c) => (
            <button key={c.slug} type="button"
              className={'cat-pill' + (cat === c.slug ? ' is-active' : '')}
              role="tab" aria-selected={cat === c.slug}
              onClick={() => setCat(c.slug)}>{c.name}</button>
          ))}
        </div>
        <div className="glass cat-sort">
          <span className="cat-sort-label">Orden</span>
          <select className="cat-sort-select" aria-label="Ordenar resultados"
            value={sort} onChange={(e) => setSort(e.target.value)}>
            {CATALOG_SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="cat-grid">
        {list.length === 0 ? (
          <div className="cat-empty">
            <div className="cat-empty-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.5" y2="16.5" />
              </svg>
            </div>
            <p className="cat-empty-title">No hay piezas en esta colección — todavía.</p>
            <p className="cat-empty-sub">Estamos curando el próximo lote. Mientras tanto, explora otras categorías.</p>
            <button className="btn-aqua btn-aqua-emerald" onClick={() => setCat('all')}>Ver todo el catálogo</button>
          </div>
        ) : list.map((p) => <CatCard key={p.id} p={p} onOpen={openPieza} />)}
      </div>
    </div>
  );
}

function CatCard({ p, onOpen }) {
  const img = p.images?.[0] || p.image || '';
  const tag = p.tag || (p.featured ? 'Destacada' : null);
  const stones = p.specs?.stones || p.specs?.stone || '';
  const col = COLLECTIONS.find((c) => c.slug === p.collection);
  const catLabel = col?.name || p.collection;
  const price = Number(p.price || 0);
  return (
    <a className="glass glass-iridescent cat-card" onClick={() => onOpen(p.id)}>
      <div className="cat-card-imgwrap">
        <div className="cat-card-img" style={{ background: `url('${img}') center/cover` }} />
        <div className="cat-card-vignette" aria-hidden="true" />
        {tag && (
          <div className="cat-card-tag">
            <div className="chip"><span className="chip-dot" />{tag}</div>
          </div>
        )}
      </div>
      <div className="cat-card-body">
        <div className="cat-card-cat">{catLabel}</div>
        <div className="cat-card-name">{p.name || 'Pieza'}</div>
        <div className="cat-card-meta">{stones}</div>
        <div className="cat-card-foot">
          <div className="mono cat-card-price">{price ? fmt$(price) : '— Editorial —'}</div>
          <div className="cat-card-arrow">
            Ver
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </div>
        </div>
      </div>
    </a>
  );
}

// ════════════════════════════════════════════════════════════════════
// PIEZA — mirror of js/pages/pieza.js (breadcrumb · gallery · info · related)
// ════════════════════════════════════════════════════════════════════
const PZ_TALLAS_COLLECTIONS = new Set(['anillos', 'argollas']);

function PiezaScreen({ product, navigate, addToCart, wishlist, toggleWish, openPieza }) {
  const [viewIdx, setViewIdx] = React.useState(0);
  const [size, setSize] = React.useState(null);
  React.useEffect(() => { setViewIdx(0); setSize(null); window.scrollTo({ top: 0, behavior: 'instant' }); }, [product && product.id]);

  if (!product) {
    return (
      <div className="container pz-page">
        <div className="glass pz-notfound">
          <div className="pz-notfound-icon" aria-hidden="true">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="pz-notfound-title">Esta pieza descansa en otro lugar</h1>
          <p className="pz-notfound-sub">La pieza solicitada no se encuentra disponible actualmente en nuestro atelier.</p>
          <div className="pz-notfound-actions">
            <button className="btn-aqua btn-aqua-emerald" onClick={() => navigate('catalogo')}>Ver el catálogo</button>
            <button className="btn-aqua" onClick={() => navigate('contacto')}>Hablar con un asesor</button>
          </div>
        </div>
      </div>
    );
  }

  const collection = COLLECTIONS.find((c) => c.slug === product.collection);
  const catLabel = collection?.name || product.collection || 'Pieza';
  const images = (product.images || []).filter(Boolean);
  if (images.length === 0 && product.image) images.push(product.image);
  const main = images[Math.min(viewIdx, images.length - 1)];
  const price = Number(product.price || 0);
  const inWishlist = wishlist.includes(product.id);
  const showTalla = PZ_TALLAS_COLLECTIONS.has(product.collection);
  const showCert = product.specs?.certificate || product.specs?.gia || (product.stones || '').includes('Diamante');

  const stones = product.specs?.stones || product.specs?.stone || '';
  const primaryGem = stones.includes('·') ? stones.split('·')[0].trim() : (stones || 'Esmeralda');
  const specs = [
    { key: 'Gema principal', val: primaryGem },
    { key: 'Metal',          val: product.specs?.metal || product.specs?.gold || 'Oro 18K' },
    { key: 'Origen',         val: product.specs?.origin || 'Muzo, Colombia' },
    { key: 'Entrega',        val: product.specs?.delivery || '2-3 semanas' },
  ];
  const description = product.description || product.desc ||
    `Una pieza de alta joyería esculpida a mano en oro de 18 quilates, concebida alrededor del fuego interior de una ${(stones || 'esmeralda colombiana').toLowerCase()}. Acabado pulido y perfeccionado pacientemente por los maestros orfebres de nuestro atelier en Cartagena de Indias.`;

  const slug = product.slug || product.id;
  const related = PRODUCTS.filter((p) => p.id !== product.id && p.collection === product.collection).slice(0, 4);
  while (related.length < 4) {
    const filler = PRODUCTS.find((p) => p.id !== product.id && !related.includes(p));
    if (!filler) break;
    related.push(filler);
  }

  return (
    <div className="container pz-page">
      {/* BREADCRUMB */}
      <nav className="pz-breadcrumb" aria-label="Migas de pan">
        <a className="pz-crumb" onClick={() => navigate('home')}>Inicio</a>
        <span className="pz-crumb-sep" aria-hidden="true">→</span>
        <a className="pz-crumb" onClick={() => navigate('catalogo')}>{catLabel}</a>
        <span className="pz-crumb-sep" aria-hidden="true">→</span>
        <span className="pz-crumb pz-crumb-current">{product.name}</span>
      </nav>

      {/* LAYOUT */}
      <article className="pz-layout">
        {/* GALLERY */}
        <div className="pz-gallery">
          <div className="glass glass-iridescent pz-main">
            <div className="pz-main-img" style={{ background: `url('${main}') center/cover` }} />
            {showCert && (
              <div className="pz-main-chips">
                <div className="chip pz-cert-chip">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12,2 22,8.5 12,22 2,8.5" /></svg>
                  GIA Certificado
                </div>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="pz-thumbs">
              {images.slice(0, 6).map((src, i) => (
                <button key={i} type="button"
                  className={'glass pz-thumb' + (i === viewIdx ? ' is-active' : '')}
                  onClick={() => setViewIdx(i)}
                  aria-label={`Ver imagen ${i + 1}`}>
                  <div className="pz-thumb-img" style={{ background: `url('${src}') center/cover` }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="pz-info">
          <div className="eyebrow pz-info-eyebrow">{catLabel} · Bersaglio 2026</div>
          <h1 className="pz-info-name">{product.name}</h1>

          <div className="pz-price-row">
            <div className="mono pz-price">{price ? fmt$(price) : 'Bajo consulta'}</div>
            {price ? <div className="pz-iva">IVA incluido</div> : null}
          </div>

          <p className="pz-info-desc">{description}</p>

          <div className="pz-specs">
            {specs.map((s) => (
              <div key={s.key} className="glass pz-spec">
                <div className="pz-spec-key">{s.key}</div>
                <div className="pz-spec-val">{s.val}</div>
              </div>
            ))}
          </div>

          {showTalla && (
            <div className="pz-talla">
              <div className="eyebrow pz-talla-label">Talla</div>
              <div className="pz-talla-pills">
                {[5, 6, 7, 8, 9].map((s) => (
                  <button key={s} type="button"
                    className={'glass pz-talla-pill' + (size === s ? ' is-active' : '')}
                    onClick={() => setSize(size === s ? null : s)}>{s}</button>
                ))}
                <button type="button"
                  className={'glass pz-talla-pill pz-talla-custom' + (size === 'custom' ? ' is-active' : '')}
                  onClick={() => setSize(size === 'custom' ? null : 'custom')}>A medida</button>
              </div>
            </div>
          )}

          <div className="pz-actions">
            <button type="button" className="btn-aqua btn-aqua-emerald pz-cart-btn"
              onClick={() => addToCart(product)}>Agregar al carrito</button>
            <button type="button"
              className={'btn-aqua pz-wish-btn' + (inWishlist ? ' is-saved' : '')}
              aria-pressed={inWishlist}
              aria-label={inWishlist ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              onClick={() => toggleWish(product.id)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          <button className="btn-aqua btn-aqua-gold pz-asesor-btn" onClick={() => navigate('contacto')}>
            Consultar con un asesor
          </button>
        </div>
      </article>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="pz-related">
          <div className="pz-related-header">
            <div className="eyebrow">También podría gustarte</div>
            <h2 className="pz-related-title">Más de <span className="italic emerald-text">{catLabel}</span></h2>
          </div>
          <div className="pz-related-grid">
            {related.map((p) => (
              <a key={p.id} className="glass glass-iridescent pz-related-card" onClick={() => openPieza(p.id)}>
                <div className="pz-related-imgwrap">
                  <div className="pz-related-img" style={{ background: `url('${p.images?.[0] || p.img}') center/cover` }} />
                </div>
                <div className="pz-related-body">
                  <div className="pz-related-name">{p.name}</div>
                  <div className="mono pz-related-price">{fmt$(p.price)}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

Object.assign(window, { HomeScreen, CatalogScreen, PiezaScreen, ProductCard });
