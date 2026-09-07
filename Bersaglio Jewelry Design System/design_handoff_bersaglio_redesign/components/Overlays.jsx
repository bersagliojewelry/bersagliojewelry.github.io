/* global React, PRODUCTS, fmt$, IconSearch, IconClose, IconArrow, IconHeart, IconShield, IconCheck, IconPin */
// Bersaglio storefront — Fase 3 overlays: ⌘K command palette + quick-view modal.

// ════════════════════════════════════════════════════════════════════
// SEARCH PALETTE (⌘K) — reuses production .bj-search-* classes
// ════════════════════════════════════════════════════════════════════
function SearchPalette({ open, onClose, onOpen }) {
  const [q, setQ] = React.useState('');
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef(null);
  const results = React.useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return PRODUCTS.slice(0, 5);
    return PRODUCTS.filter((p) => (p.name + ' ' + p.cat + ' ' + p.stones).toLowerCase().includes(t)).slice(0, 6);
  }, [q]);
  React.useEffect(() => { if (open) { setQ(''); setActive(0); setTimeout(() => inputRef.current && inputRef.current.focus(), 60); } }, [open]);
  React.useEffect(() => { setActive(0); }, [q]);
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) { onOpen(results[active].id); }
  };
  return (
    <div className={'bj-search-backdrop' + (open ? ' is-open' : '')} onClick={onClose}>
      <div className="bj-search-panel glass" onClick={(e) => e.stopPropagation()}>
        <div className="bj-search-input-row">
          <span className="bj-search-icon"><IconSearch size={18} /></span>
          <input ref={inputRef} className="bj-search-input" placeholder="Buscar piezas, colecciones, gemas…"
            value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} />
          <span className="bj-search-kbd">ESC</span>
        </div>
        <div className="bj-search-results">
          {results.length === 0 && <div className="bj-search-empty">Sin resultados para "{q}". Prueba con "esmeralda" o "anillo".</div>}
          {results.map((p, i) => (
            <a key={p.id} className={'bj-search-result' + (i === active ? ' is-active' : '')}
              onMouseEnter={() => setActive(i)} onClick={() => onOpen(p.id)}>
              <div className="bj-search-result-img" style={{ backgroundImage: `url(${p.img})` }} />
              <div className="bj-search-result-body">
                <div className="bj-search-result-name">{p.name}</div>
                <div className="bj-search-result-meta">{p.cat} · {p.stones}</div>
              </div>
              <div className="bj-search-result-price mono">{fmt$(p.price)}</div>
            </a>
          ))}
        </div>
        <div className="bj-search-hint">
          <span><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
          <span><kbd>↵</kbd> abrir</span>
          <span><kbd>esc</kbd> cerrar</span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// QUICK-VIEW MODAL
// ════════════════════════════════════════════════════════════════════
function QuickView({ product, onClose, addToCart, toggleWish, wished, onFull }) {
  const [active, setActive] = React.useState(0);
  React.useEffect(() => { setActive(0); }, [product && product.id]);
  const open = !!product;
  const gallery = product ? (product.gallery || [product.img]) : [];
  return (
    <div className={'k-qv-backdrop' + (open ? ' is-open' : '')} onClick={onClose}>
      {product && (
        <div className="k-qv glass-iridescent" onClick={(e) => e.stopPropagation()}>
          <button className="k-qv-close" onClick={onClose}><IconClose size={14} /></button>
          <div className="k-qv-visual">
            {gallery.map((g, i) => (
              <div key={i} style={{ backgroundImage: `url(${g})`, opacity: i === active ? 1 : 0 }} />
            ))}
            <div className="k-qv-thumbs">
              {gallery.map((g, i) => (
                <div key={i} className={'k-qv-thumb' + (i === active ? ' on' : '')}
                  style={{ backgroundImage: `url(${g})` }} onClick={() => setActive(i)} />
              ))}
            </div>
          </div>
          <div className="k-qv-body">
            <div className="k-qv-cat">{product.cat}</div>
            <div className="k-qv-name">{product.name}</div>
            <div className="k-qv-price">{fmt$(product.price)}</div>
            <p className="k-qv-desc">{product.desc}</p>
            <div className="k-qv-specs">
              {Object.entries(product.specs).map(([k, v]) => (
                <span className="k-qv-spec" key={k}>{k}: <b>{v}</b></span>
              ))}
            </div>
            <div className="k-qv-actions">
              <button className="btn-aqua btn-aqua-emerald" onClick={() => addToCart(product)}>Añadir al carrito</button>
              <button className={'btn-aqua' + (wished ? ' btn-aqua-gold' : '')} onClick={() => toggleWish(product.id)}>
                <IconHeart size={14} fill={wished ? 'currentColor' : 'none'} /> {wished ? 'Guardada' : 'Guardar'}
              </button>
              <button className="btn-aqua" onClick={() => onFull(product.id)}>Ver pieza completa <IconArrow size={12} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// QUICK DOCK — fixed water droplet; hover tilts its top toward the cursor;
// click opens a small irregular water-glass strip of concierge tools
// ════════════════════════════════════════════════════════════════════
function QuickDock({ navigate, onSearch }) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState(null);
  const anchorRef = React.useRef(null);
  const dragRef = React.useRef(null);
  const islandRef = React.useRef(null);
  const peakRef = React.useRef(null);
  const liquidRef = React.useRef(null);
  const close = () => setOpen(false);
  const run = (fn) => { close(); setTimeout(fn, 150); };
  const onMove = (e) => {
    const d = dragRef.current; if (!d) return;
    if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 4) d.moved = true;
    if (d.moved) {
      const x = Math.max(8, Math.min(window.innerWidth - d.w - 8, e.clientX - d.offX));
      const y = Math.max(8, Math.min(window.innerHeight - d.h - 8, e.clientY - d.offY));
      setPos({ x, y });
    }
  };
  const onUp = () => {
    const d = dragRef.current;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    if (d && !d.moved) setOpen((v) => !v);
    dragRef.current = null;
  };
  const onDown = (e) => {
    const a = anchorRef.current; if (!a) return;
    const r = a.getBoundingClientRect();
    dragRef.current = { sx: e.clientX, sy: e.clientY, offX: e.clientX - r.left, offY: e.clientY - r.top, w: r.width, h: r.height, moved: false };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    e.preventDefault();
  };
  const poke = (e) => {
    if (open || dragRef.current) return;
    const isl = islandRef.current; if (!isl) return;
    const dx = Math.max(-1, Math.min(1, (e.clientX - (isl.getBoundingClientRect().left + isl.offsetWidth / 2)) / (isl.offsetWidth / 2)));
    isl.style.setProperty('--gx', (50 + dx * 30) + '%');
  };
  const unpoke = () => { const isl = islandRef.current; if (isl) isl.style.removeProperty('--gx'); };
  const ic = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const tools = [
    { label: 'Buscar', icon: <svg width="19" height="19" viewBox="0 0 24 24" {...ic}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>, onClick: () => run(onSearch) },
    { label: 'WhatsApp', cls: 'qd-tool--wa', href: 'https://wa.me/573013752592', icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.515 5.26l-.999 3.648 3.973-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" /></svg> },
    { label: 'Cita', cls: 'qd-tool--gold', icon: <svg width="19" height="19" viewBox="0 0 24 24" {...ic}><path d="M8 2v4M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>, onClick: () => run(() => navigate('contacto')) },
    { label: 'Favoritos', icon: <svg width="19" height="19" viewBox="0 0 24 24" {...ic}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>, onClick: () => run(() => navigate('lista-deseos')) },
    { label: 'Arriba', icon: <svg width="19" height="19" viewBox="0 0 24 24" {...ic}><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>, onClick: () => run(() => window.scrollTo({ top: 0, behavior: 'smooth' })) },
  ];
  const anchorStyle = pos ? { position: 'fixed', left: pos.x + 'px', top: pos.y + 'px', bottom: 'auto', transform: 'none' } : undefined;
  return (
    <div className={'qd' + (open ? ' open' : '')}>
      <div className="qd-backdrop" onClick={close} />
      <div className={'qd-anchor' + (pos ? ' dragged' : '')} ref={anchorRef} style={anchorStyle}>
        <div className="qd-strip">
          <div className="qd-tools">
            {tools.map((t, i) => t.href ? (
              <a key={i} className={'qd-tool ' + (t.cls || '')} href={t.href} target="_blank" rel="noopener" onClick={close}>
                <span className="qd-tool-ic">{t.icon}</span><span className="qd-tool-label">{t.label}</span>
              </a>
            ) : (
              <button key={i} className={'qd-tool ' + (t.cls || '')} onClick={t.onClick}>
                <span className="qd-tool-ic">{t.icon}</span><span className="qd-tool-label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
        <button ref={islandRef} className="qd-island" onPointerDown={onDown} onPointerMove={poke} onPointerLeave={unpoke} aria-label="Atajos · arrastra para mover, clic para abrir" aria-expanded={open}>
          <span className="qd-island-liquid" ref={liquidRef} aria-hidden="true">
            <svg viewBox="0 0 82 30" preserveAspectRatio="none">
              <defs>
                <clipPath id="qd-wclip"><rect x="0" y="0" width="82" height="30" rx="15" /></clipPath>
                <linearGradient id="qd-air" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="rgba(248,224,138,0.92)" />
                  <stop offset="0.55" stopColor="rgba(248,224,138,0)" />
                </linearGradient>
                <linearGradient id="qd-wgrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="rgba(126,222,168,0.96)" />
                  <stop offset="1" stopColor="rgba(30,138,91,1)" />
                </linearGradient>
                <linearGradient id="qd-gold" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="rgba(244,214,122,0)" />
                  <stop offset="0.5" stopColor="rgba(248,222,142,0.95)" />
                  <stop offset="1" stopColor="rgba(244,214,122,0)" />
                </linearGradient>
              </defs>
              <g clipPath="url(#qd-wclip)">
                <rect x="0" y="0" width="82" height="30" fill="url(#qd-air)" />
                <path className="qd-wave qd-wave-back" fill="rgba(28,116,82,0.85)" d="M0 14 C 16 10, 25 10, 41 14 S 66 18, 82 14 S 107 10, 123 14 S 148 18, 164 14 V30 H0 Z" />
                <path className="qd-wave qd-wave-front" fill="url(#qd-wgrad)" d="M0 15 C 16 19, 25 19, 41 15 S 66 11, 82 15 S 107 19, 123 15 S 148 11, 164 15 V30 H0 Z" />
                <path className="qd-wave qd-wave-gold" fill="none" stroke="url(#qd-gold)" strokeWidth="2.2" d="M0 14 C 16 10, 25 10, 41 14 S 66 18, 82 14 S 107 10, 123 14 S 148 18, 164 14" />
                <path className="qd-wave qd-wave-gold2" fill="none" stroke="url(#qd-gold)" strokeWidth="1.4" d="M0 17 C 16 14, 25 14, 41 17 S 66 20, 82 17 S 107 14, 123 17 S 148 20, 164 17" />
              </g>
            </svg>
          </span>
          <span className="qd-island-sheen" aria-hidden="true" />
          <span className="qd-island-label" aria-hidden="true">
            <img src="../../assets/emerald-gem.png" alt="" />
          </span>
        </button>
        <span className="qd-caption" aria-hidden="true">atajos</span>
      </div>
      <svg className="qd-goo" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id="qd-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
            <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 12 -5" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

Object.assign(window, { SearchPalette, QuickView, QuickDock });
