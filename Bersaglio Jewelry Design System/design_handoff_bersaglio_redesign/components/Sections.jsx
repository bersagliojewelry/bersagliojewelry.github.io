/* global React, ATELIER, JOURNAL, JOURNAL_TICKER, useReveal, IconArrow */
// Bersaglio storefront — Fase 2 sections: Atelier, The Journal, Share moment.

const IconWhatsapp = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.5 3.5A11 11 0 0 0 3.4 17l-1.4 5.1 5.2-1.4A11 11 0 1 0 20.5 3.5z" />
    <path d="M8 10.5c.3 2 2 3.7 4 4.2 1 .3 1.9.1 2.5-.5.2-.2.3-.6.2-.9l-.3-.9c-.1-.3-.4-.4-.7-.4l-1 .2c-.2 0-.4 0-.6-.2-.5-.4-1-.9-1.3-1.5-.1-.2-.1-.4 0-.5l.4-.6c.2-.2.2-.5.1-.7l-.5-1c-.1-.3-.4-.4-.7-.4l-.9.2c-.4.1-.6.4-.6.8 0 .5 0 1 .2 1.4z" />
  </svg>
);
const IconLink = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
  </svg>
);
const IconInstagram = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const initials = (name) => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('');

// ════════════════════════════════════════════════════════════════════
// ATELIER — process scene with central jewel
// ════════════════════════════════════════════════════════════════════
function AtelierSection({ navigate }) {
  const [ref, cls, st] = useReveal(0);
  return (
    <section className="k-section" style={{ paddingTop: 0 }}>
      <div className="k-container">
        <div className="k-head">
          <span className="chip" style={{ marginBottom: 16 }}><span className="chip-dot" style={{ background: 'var(--bj-gold-500)' }} />Atelier Bersaglio</span>
          <h2>El viaje de creación de <span className="italic emerald-text">una pieza de culto</span></h2>
          <p>Un recorrido artesanal meticuloso que transforma una visión en un objeto eterno.</p>
        </div>
        <div ref={ref} className={'glass glass-iridescent k-at-stage ' + cls} style={st}>
          <div className="k-at-halo" aria-hidden="true" />
          <div className="k-at-ring" aria-hidden="true" />
          <div className="k-at-jewel">
            <img src="../../assets/ring-sapphire.webp" alt="Pieza Bersaglio en proceso de orfebrería" loading="lazy" />
          </div>
          {ATELIER.map((s, i) => (
            <div key={s.n} className={'k-at-card c' + i}>
              <div className="k-at-num">{s.n}</div>
              <div className="k-at-card-t">{s.t}</div>
              <p className="k-at-card-d">{s.d}</p>
            </div>
          ))}
          <div className="k-at-cta">
            <button className="btn-aqua btn-aqua-emerald" onClick={() => navigate('contacto')}>Iniciar mi pieza <IconArrow size={13} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════
// THE BERSAGLIO JOURNAL — NYT-style masthead
// ════════════════════════════════════════════════════════════════════
function JournalSection({ navigate }) {
  const [ref, cls, st] = useReveal(0);
  const cover = JOURNAL.find((e) => e.featured) || JOURNAL[0];
  const rest = JOURNAL.filter((e) => e !== cover).slice(0, 4);
  const ticker = [...JOURNAL_TICKER, ...JOURNAL_TICKER];
  const open = () => navigate('nosotros');
  return (
    <section className="k-section">
      <div className="k-container">
        <div className="k-jr-masthead">
          <div className="k-jr-brand">
            <div className="k-jr-est">EST. 2014</div>
            <div className="k-jr-divider" />
            <div className="k-jr-title">The <span className="italic">Bersaglio</span> Journal</div>
          </div>
          <div className="k-jr-meta">
            <div className="k-jr-issue">Issue Nº 14 · Marzo 2026</div>
            <button className="btn-aqua" style={{ padding: '10px 16px', fontSize: 12 }} onClick={open}>Archivo completo <IconArrow size={12} /></button>
          </div>
        </div>
        <div className="k-jr-rule" />

        <div className="glass k-jr-ticker">
          <span className="k-jr-ticker-tag"><span className="k-jr-pulse" />EN VIVO</span>
          <div className="k-jr-ticker-clip">
            <div className="k-jr-ticker-track">
              {ticker.map((t, i) => <span className="k-jr-ticker-item" key={i}>{t}</span>)}
            </div>
          </div>
        </div>

        <div ref={ref} className={'k-jr-fold ' + cls} style={st}>
          <a className="k-jr-cover" onClick={open}>
            <div className="k-jr-cover-img">
              <div style={{ backgroundImage: `url(${cover.img})` }} />
              <div className="k-jr-cover-vig" />
              <div className="k-jr-cover-flag">
                <span className="k-jr-flag">{cover.section}</span>
                <span className="k-jr-flag">{cover.read} de lectura</span>
              </div>
            </div>
            <div className="k-jr-kicker">{cover.kicker}</div>
            <h3 className="k-jr-cover-title">{cover.title}</h3>
            <p className="k-jr-cover-excerpt">{cover.excerpt}</p>
            <div className="k-jr-cover-meta">
              <div className="k-jr-avatar">{initials(cover.author)}</div>
              <span>Por {cover.author} · {cover.date}</span>
            </div>
          </a>

          <aside className="k-jr-side">
            <div className="k-jr-side-head">
              <div className="k-jr-side-title">Más leídos</div>
              <div className="k-jr-side-week">ESTA SEMANA</div>
            </div>
            {rest.map((e, i) => (
              <a className="k-jr-row" key={e.slug} onClick={open}>
                <div className="k-jr-row-num">0{i + 1}</div>
                <div>
                  <div className="k-jr-row-sec">{e.section} · {e.date}</div>
                  <div className="k-jr-row-title">{e.title}</div>
                  <div className="k-jr-row-read">{e.read} de lectura</div>
                </div>
              </a>
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════
// SHARE moment
// ════════════════════════════════════════════════════════════════════
function ShareSection({ showToast }) {
  const [ref, cls, st] = useReveal(0);
  const share = (kind) => {
    if (kind === 'link' && navigator.clipboard) {
      navigator.clipboard.writeText('https://bersagliojewelry.co/pieza/collar-la-verde').catch(() => {});
      showToast('Enlace copiado al portapapeles');
    } else if (kind === 'wa') {
      showToast('Abriendo WhatsApp…');
    } else {
      showToast('Compartiendo en Instagram…');
    }
  };
  return (
    <section className="k-section" style={{ paddingTop: 0 }}>
      <div className="k-container">
        <div ref={ref} className={'glass glass-iridescent k-share ' + cls} style={st}>
          <div className="k-share-visual">
            <div style={{ backgroundImage: 'url(../../assets/model-emerald.webp)' }} />
            <div className="k-share-visual-shade" />
          </div>
          <div className="k-share-body">
            <span className="eyebrow">Comparte el deseo</span>
            <h2>Una pieza que <span className="italic emerald-text">merece ser contada</span></h2>
            <p className="k-share-lead">¿Encontraste la joya que habla por ti? Compártela con quien debe verla — o guárdala para esa conversación pendiente frente a un café en Cartagena.</p>
            <div className="k-share-actions">
              <button className="k-share-btn wa" onClick={() => share('wa')}><IconWhatsapp /> WhatsApp</button>
              <button className="k-share-btn" onClick={() => share('link')}><IconLink /> Copiar enlace</button>
              <button className="k-share-btn" onClick={() => share('ig')}><IconInstagram /> Instagram</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════
// BERSAGLIO FILMS — multimedia / video gallery + lightbox
// ════════════════════════════════════════════════════════════════════
function PlatformIcon({ name, size = 15 }) {
  if (name === 'Instagram') return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.4-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z" /></svg>;
  if (name === 'Facebook') return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12a12 12 0 1 0-13.88 11.86v-8.39H7.08V12h3.04V9.36c0-3 1.79-4.66 4.53-4.66 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.39A12 12 0 0 0 24 12z" /></svg>;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" /></svg>;
}

function FilmsSection() {
  const [filter, setFilter] = React.useState('Todos');
  const [active, setActive] = React.useState(null);
  const featured = VIDEOS.find((v) => v.featured) || VIDEOS[0];
  const list = (filter === 'Todos' ? VIDEOS : VIDEOS.filter((v) => v.cat === filter)).filter((v) => v !== featured);
  const playIcon = (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>;
  return (
    <section className="home-films">
      <div className="container">
        <div className="films-header">
          <div>
            <span className="eyebrow">Bersaglio Films</span>
            <h2 className="films-title">Mira el <span className="italic emerald-text">oficio</span> en movimiento</h2>
          </div>
          <button className="btn-aqua" onClick={() => setActive(featured)}>Ver el último estreno
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div className="films-filters">
          {VIDEO_CATEGORIES.map((c) => (
            <button key={c} className={'films-pill' + (filter === c ? ' on' : '')} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>

        <div className="films-layout">
          <div className="glass glass-iridescent film-feature" onClick={() => setActive(featured)}>
            <div className="film-feature-img" style={{ backgroundImage: `url(${featured.thumb})` }} />
            <div className="film-feature-shade" />
            <div className="film-play" aria-hidden="true">{playIcon(26)}</div>
            <div className="film-feature-body">
              <div className="film-feature-chips">
                <span className="film-flag">{featured.cat}</span>
                <span className="film-flag">{featured.dur}</span>
              </div>
              <h3 className="film-feature-title">{featured.title}</h3>
              <p className="film-feature-desc">{featured.desc}</p>
            </div>
          </div>

          <div className="films-side">
            {list.slice(0, 4).map((v) => (
              <div key={v.id} className="glass film-card" onClick={() => setActive(v)}>
                <div className="film-thumb" style={{ backgroundImage: `url(${v.thumb})` }}>
                  <div className="film-thumb-play">{playIcon(22)}</div>
                  <span className="film-dur">{v.dur}</span>
                </div>
                <div className="film-card-body">
                  <div className="film-card-cat">{v.cat}</div>
                  <div className="film-card-title">{v.title}{v.badge && <span className="film-badge">{v.badge}</span>}</div>
                </div>
              </div>
            ))}
            <div className="films-upload">
              <div className="films-upload-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" /></svg>
              </div>
              <div className="films-upload-text"><b>Panel de administración:</b> sube videos a Firebase Storage o pega un enlace de YouTube/Vimeo; aparecen aquí al instante.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <div className={'film-lightbox' + (active ? ' is-open' : '')} onClick={() => setActive(null)}>
        {active && (
          <div className="film-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <div className="film-screen">
              <div style={{ backgroundImage: `url(${active.thumb})` }} />
              <div className="film-screen-shade" />
              <div className="film-play" aria-hidden="true">{playIcon(28)}</div>
              <div className="film-screen-note">▶ Demo · aquí se reproduce el video real (Firebase Storage / YouTube / Vimeo)</div>
            </div>
            <div className="film-lightbox-bar">
              <div>
                <div className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'oklch(85% 0.1 90)', marginBottom: 4 }}>{active.cat.toUpperCase()} · {active.dur}</div>
                <div className="film-lightbox-title">{active.title}</div>
              </div>
              <button className="film-lightbox-close" onClick={() => setActive(null)} aria-label="Cerrar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════
// SOCIAL FEED — latest from Instagram / Facebook / TikTok
// ════════════════════════════════════════════════════════════════════
function SocialSection() {
  const [tab, setTab] = React.useState('Todas');
  const list = tab === 'Todas' ? SOCIAL : SOCIAL.filter((p) => p.platform === tab);
  const statIcon = (kind) => kind === 'views'
    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>
    : <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-8-4.5-8-10a4.5 4.5 0 0 1 8-2.9A4.5 4.5 0 0 1 20 11c0 5.5-8 10-8 10z" /></svg>;
  return (
    <section className="home-social">
      <div className="container">
        <div className="social-header">
          <span className="eyebrow">Síguenos de cerca</span>
          <h2 className="social-title">Lo último en <span className="italic emerald-text">nuestras redes</span></h2>
          <p className="social-lead">Cada pieza tiene vida fuera de la vitrina. Esto es lo más reciente que hemos publicado en Instagram, Facebook y TikTok — actualizado automáticamente.</p>
        </div>

        <div className="social-tabs">
          {SOCIAL_PLATFORMS.map((p) => (
            <button key={p} className={'social-tab' + (tab === p ? ' on' : '')} onClick={() => setTab(p)}>
              {p !== 'Todas' && <PlatformIcon name={p} size={14} />}{p}
            </button>
          ))}
        </div>

        <div className="social-grid">
          {list.slice(0, 8).map((p, i) => (
            <a key={i} className="social-card" target="_blank" rel="noopener">
              <div className="social-card-img" style={{ backgroundImage: `url(${p.thumb})` }} />
              <div className="social-card-grad" />
              <span className={'social-badge social-badge--' + p.platform.toLowerCase()}><PlatformIcon name={p.platform} size={15} /></span>
              <span className="social-type">{p.type}</span>
              <div className="social-card-body">
                <div className="social-card-caption">{p.caption}</div>
                <div className="social-card-meta">
                  <span className="social-card-stat">{statIcon(p.kind)}{p.stat}</span>
                  <span>{p.date}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="social-follow">
          <a className="btn-aqua" href="https://instagram.com/bersagliojewelry" target="_blank" rel="noopener"><PlatformIcon name="Instagram" size={15} /> @bersagliojewelry</a>
          <a className="btn-aqua" href="https://tiktok.com/@bersagliojewelry" target="_blank" rel="noopener"><PlatformIcon name="TikTok" size={14} /> TikTok</a>
          <a className="btn-aqua" href="https://facebook.com/bersagliojewelry" target="_blank" rel="noopener"><PlatformIcon name="Facebook" size={15} /> Facebook</a>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { AtelierSection, JournalSection, ShareSection, FilmsSection, SocialSection });
