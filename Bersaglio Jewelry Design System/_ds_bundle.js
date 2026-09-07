/* @ds-bundle: {"format":3,"namespace":"BersaglioJewelryDesignSystem_a655d7","components":[],"sourceHashes":{"design_handoff_bersaglio_redesign/components/Overlays.jsx":"d8b07b223039","design_handoff_bersaglio_redesign/components/Pages.jsx":"c47b8ec3c0c3","design_handoff_bersaglio_redesign/components/Screens.jsx":"33263eefb10c","design_handoff_bersaglio_redesign/components/Sections.jsx":"4141fe11cdd5","design_handoff_bersaglio_redesign/components/Shell.jsx":"b8c15f24d948","design_handoff_bersaglio_redesign/components/data.jsx":"aeccac6061bc","ui_kits/storefront/Overlays.jsx":"d8b07b223039","ui_kits/storefront/Pages.jsx":"c47b8ec3c0c3","ui_kits/storefront/Screens.jsx":"33263eefb10c","ui_kits/storefront/Sections.jsx":"4141fe11cdd5","ui_kits/storefront/Shell.jsx":"b8c15f24d948","ui_kits/storefront/data.jsx":"aeccac6061bc"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.BersaglioJewelryDesignSystem_a655d7 = window.BersaglioJewelryDesignSystem_a655d7 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// design_handoff_bersaglio_redesign/components/Overlays.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React, PRODUCTS, fmt$, IconSearch, IconClose, IconArrow, IconHeart, IconShield, IconCheck, IconPin */
// Bersaglio storefront — Fase 3 overlays: ⌘K command palette + quick-view modal.

// ════════════════════════════════════════════════════════════════════
// SEARCH PALETTE (⌘K) — reuses production .bj-search-* classes
// ════════════════════════════════════════════════════════════════════
function SearchPalette({
  open,
  onClose,
  onOpen
}) {
  const [q, setQ] = React.useState('');
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef(null);
  const results = React.useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return PRODUCTS.slice(0, 5);
    return PRODUCTS.filter(p => (p.name + ' ' + p.cat + ' ' + p.stones).toLowerCase().includes(t)).slice(0, 6);
  }, [q]);
  React.useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      setTimeout(() => inputRef.current && inputRef.current.focus(), 60);
    }
  }, [open]);
  React.useEffect(() => {
    setActive(0);
  }, [q]);
  const onKey = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(a => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      onOpen(results[active].id);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: 'bj-search-backdrop' + (open ? ' is-open' : ''),
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-search-panel glass",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-search-input-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bj-search-icon"
  }, /*#__PURE__*/React.createElement(IconSearch, {
    size: 18
  })), /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    className: "bj-search-input",
    placeholder: "Buscar piezas, colecciones, gemas\u2026",
    value: q,
    onChange: e => setQ(e.target.value),
    onKeyDown: onKey
  }), /*#__PURE__*/React.createElement("span", {
    className: "bj-search-kbd"
  }, "ESC")), /*#__PURE__*/React.createElement("div", {
    className: "bj-search-results"
  }, results.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "bj-search-empty"
  }, "Sin resultados para \"", q, "\". Prueba con \"esmeralda\" o \"anillo\"."), results.map((p, i) => /*#__PURE__*/React.createElement("a", {
    key: p.id,
    className: 'bj-search-result' + (i === active ? ' is-active' : ''),
    onMouseEnter: () => setActive(i),
    onClick: () => onOpen(p.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-search-result-img",
    style: {
      backgroundImage: `url(${p.img})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "bj-search-result-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-search-result-name"
  }, p.name), /*#__PURE__*/React.createElement("div", {
    className: "bj-search-result-meta"
  }, p.cat, " \xB7 ", p.stones)), /*#__PURE__*/React.createElement("div", {
    className: "bj-search-result-price mono"
  }, fmt$(p.price))))), /*#__PURE__*/React.createElement("div", {
    className: "bj-search-hint"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("kbd", null, "\u2191"), /*#__PURE__*/React.createElement("kbd", null, "\u2193"), " navegar"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("kbd", null, "\u21B5"), " abrir"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("kbd", null, "esc"), " cerrar"))));
}

// ════════════════════════════════════════════════════════════════════
// QUICK-VIEW MODAL
// ════════════════════════════════════════════════════════════════════
function QuickView({
  product,
  onClose,
  addToCart,
  toggleWish,
  wished,
  onFull
}) {
  const [active, setActive] = React.useState(0);
  React.useEffect(() => {
    setActive(0);
  }, [product && product.id]);
  const open = !!product;
  const gallery = product ? product.gallery || [product.img] : [];
  return /*#__PURE__*/React.createElement("div", {
    className: 'k-qv-backdrop' + (open ? ' is-open' : ''),
    onClick: onClose
  }, product && /*#__PURE__*/React.createElement("div", {
    className: "k-qv glass-iridescent",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "k-qv-close",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(IconClose, {
    size: 14
  })), /*#__PURE__*/React.createElement("div", {
    className: "k-qv-visual"
  }, gallery.map((g, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      backgroundImage: `url(${g})`,
      opacity: i === active ? 1 : 0
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "k-qv-thumbs"
  }, gallery.map((g, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: 'k-qv-thumb' + (i === active ? ' on' : ''),
    style: {
      backgroundImage: `url(${g})`
    },
    onClick: () => setActive(i)
  })))), /*#__PURE__*/React.createElement("div", {
    className: "k-qv-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-qv-cat"
  }, product.cat), /*#__PURE__*/React.createElement("div", {
    className: "k-qv-name"
  }, product.name), /*#__PURE__*/React.createElement("div", {
    className: "k-qv-price"
  }, fmt$(product.price)), /*#__PURE__*/React.createElement("p", {
    className: "k-qv-desc"
  }, product.desc), /*#__PURE__*/React.createElement("div", {
    className: "k-qv-specs"
  }, Object.entries(product.specs).map(([k, v]) => /*#__PURE__*/React.createElement("span", {
    className: "k-qv-spec",
    key: k
  }, k, ": ", /*#__PURE__*/React.createElement("b", null, v)))), /*#__PURE__*/React.createElement("div", {
    className: "k-qv-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => addToCart(product)
  }, "A\xF1adir al carrito"), /*#__PURE__*/React.createElement("button", {
    className: 'btn-aqua' + (wished ? ' btn-aqua-gold' : ''),
    onClick: () => toggleWish(product.id)
  }, /*#__PURE__*/React.createElement(IconHeart, {
    size: 14,
    fill: wished ? 'currentColor' : 'none'
  }), " ", wished ? 'Guardada' : 'Guardar'), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua",
    onClick: () => onFull(product.id)
  }, "Ver pieza completa ", /*#__PURE__*/React.createElement(IconArrow, {
    size: 12
  }))))));
}

// ════════════════════════════════════════════════════════════════════
// QUICK DOCK — fixed water droplet; hover tilts its top toward the cursor;
// click opens a small irregular water-glass strip of concierge tools
// ════════════════════════════════════════════════════════════════════
function QuickDock({
  navigate,
  onSearch
}) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState(null);
  const anchorRef = React.useRef(null);
  const dragRef = React.useRef(null);
  const islandRef = React.useRef(null);
  const peakRef = React.useRef(null);
  const liquidRef = React.useRef(null);
  const close = () => setOpen(false);
  const run = fn => {
    close();
    setTimeout(fn, 150);
  };
  const onMove = e => {
    const d = dragRef.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 4) d.moved = true;
    if (d.moved) {
      const x = Math.max(8, Math.min(window.innerWidth - d.w - 8, e.clientX - d.offX));
      const y = Math.max(8, Math.min(window.innerHeight - d.h - 8, e.clientY - d.offY));
      setPos({
        x,
        y
      });
    }
  };
  const onUp = () => {
    const d = dragRef.current;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    if (d && !d.moved) setOpen(v => !v);
    dragRef.current = null;
  };
  const onDown = e => {
    const a = anchorRef.current;
    if (!a) return;
    const r = a.getBoundingClientRect();
    dragRef.current = {
      sx: e.clientX,
      sy: e.clientY,
      offX: e.clientX - r.left,
      offY: e.clientY - r.top,
      w: r.width,
      h: r.height,
      moved: false
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    e.preventDefault();
  };
  const poke = e => {
    if (open || dragRef.current) return;
    const isl = islandRef.current;
    if (!isl) return;
    const dx = Math.max(-1, Math.min(1, (e.clientX - (isl.getBoundingClientRect().left + isl.offsetWidth / 2)) / (isl.offsetWidth / 2)));
    isl.style.setProperty('--gx', 50 + dx * 30 + '%');
  };
  const unpoke = () => {
    const isl = islandRef.current;
    if (isl) isl.style.removeProperty('--gx');
  };
  const ic = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  };
  const tools = [{
    label: 'Buscar',
    icon: /*#__PURE__*/React.createElement("svg", _extends({
      width: "19",
      height: "19",
      viewBox: "0 0 24 24"
    }, ic), /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m21 21-4.3-4.3"
    })),
    onClick: () => run(onSearch)
  }, {
    label: 'WhatsApp',
    cls: 'qd-tool--wa',
    href: 'https://wa.me/573013752592',
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "19",
      viewBox: "0 0 24 24",
      fill: "currentColor"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.515 5.26l-.999 3.648 3.973-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"
    }))
  }, {
    label: 'Cita',
    cls: 'qd-tool--gold',
    icon: /*#__PURE__*/React.createElement("svg", _extends({
      width: "19",
      height: "19",
      viewBox: "0 0 24 24"
    }, ic), /*#__PURE__*/React.createElement("path", {
      d: "M8 2v4M16 2v4"
    }), /*#__PURE__*/React.createElement("rect", {
      width: "18",
      height: "18",
      x: "3",
      y: "4",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 10h18"
    })),
    onClick: () => run(() => navigate('contacto'))
  }, {
    label: 'Favoritos',
    icon: /*#__PURE__*/React.createElement("svg", _extends({
      width: "19",
      height: "19",
      viewBox: "0 0 24 24"
    }, ic), /*#__PURE__*/React.createElement("path", {
      d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
    })),
    onClick: () => run(() => navigate('lista-deseos'))
  }, {
    label: 'Arriba',
    icon: /*#__PURE__*/React.createElement("svg", _extends({
      width: "19",
      height: "19",
      viewBox: "0 0 24 24"
    }, ic), /*#__PURE__*/React.createElement("path", {
      d: "m5 12 7-7 7 7"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 19V5"
    })),
    onClick: () => run(() => window.scrollTo({
      top: 0,
      behavior: 'smooth'
    }))
  }];
  const anchorStyle = pos ? {
    position: 'fixed',
    left: pos.x + 'px',
    top: pos.y + 'px',
    bottom: 'auto',
    transform: 'none'
  } : undefined;
  return /*#__PURE__*/React.createElement("div", {
    className: 'qd' + (open ? ' open' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "qd-backdrop",
    onClick: close
  }), /*#__PURE__*/React.createElement("div", {
    className: 'qd-anchor' + (pos ? ' dragged' : ''),
    ref: anchorRef,
    style: anchorStyle
  }, /*#__PURE__*/React.createElement("div", {
    className: "qd-strip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "qd-tools"
  }, tools.map((t, i) => t.href ? /*#__PURE__*/React.createElement("a", {
    key: i,
    className: 'qd-tool ' + (t.cls || ''),
    href: t.href,
    target: "_blank",
    rel: "noopener",
    onClick: close
  }, /*#__PURE__*/React.createElement("span", {
    className: "qd-tool-ic"
  }, t.icon), /*#__PURE__*/React.createElement("span", {
    className: "qd-tool-label"
  }, t.label)) : /*#__PURE__*/React.createElement("button", {
    key: i,
    className: 'qd-tool ' + (t.cls || ''),
    onClick: t.onClick
  }, /*#__PURE__*/React.createElement("span", {
    className: "qd-tool-ic"
  }, t.icon), /*#__PURE__*/React.createElement("span", {
    className: "qd-tool-label"
  }, t.label))))), /*#__PURE__*/React.createElement("button", {
    ref: islandRef,
    className: "qd-island",
    onPointerDown: onDown,
    onPointerMove: poke,
    onPointerLeave: unpoke,
    "aria-label": "Atajos \xB7 arrastra para mover, clic para abrir",
    "aria-expanded": open
  }, /*#__PURE__*/React.createElement("span", {
    className: "qd-island-liquid",
    ref: liquidRef,
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 82 30",
    preserveAspectRatio: "none"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
    id: "qd-wclip"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "0",
    width: "82",
    height: "30",
    rx: "15"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "qd-air",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "rgba(248,224,138,0.92)"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "0.55",
    stopColor: "rgba(248,224,138,0)"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "qd-wgrad",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "rgba(126,222,168,0.96)"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "rgba(30,138,91,1)"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "qd-gold",
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "0"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "rgba(244,214,122,0)"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "0.5",
    stopColor: "rgba(248,222,142,0.95)"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "rgba(244,214,122,0)"
  }))), /*#__PURE__*/React.createElement("g", {
    clipPath: "url(#qd-wclip)"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "0",
    width: "82",
    height: "30",
    fill: "url(#qd-air)"
  }), /*#__PURE__*/React.createElement("path", {
    className: "qd-wave qd-wave-back",
    fill: "rgba(28,116,82,0.85)",
    d: "M0 14 C 16 10, 25 10, 41 14 S 66 18, 82 14 S 107 10, 123 14 S 148 18, 164 14 V30 H0 Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: "qd-wave qd-wave-front",
    fill: "url(#qd-wgrad)",
    d: "M0 15 C 16 19, 25 19, 41 15 S 66 11, 82 15 S 107 19, 123 15 S 148 11, 164 15 V30 H0 Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: "qd-wave qd-wave-gold",
    fill: "none",
    stroke: "url(#qd-gold)",
    strokeWidth: "2.2",
    d: "M0 14 C 16 10, 25 10, 41 14 S 66 18, 82 14 S 107 10, 123 14 S 148 18, 164 14"
  }), /*#__PURE__*/React.createElement("path", {
    className: "qd-wave qd-wave-gold2",
    fill: "none",
    stroke: "url(#qd-gold)",
    strokeWidth: "1.4",
    d: "M0 17 C 16 14, 25 14, 41 17 S 66 20, 82 17 S 107 14, 123 17 S 148 20, 164 17"
  })))), /*#__PURE__*/React.createElement("span", {
    className: "qd-island-sheen",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: "qd-island-label",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/emerald-gem.png",
    alt: ""
  }))), /*#__PURE__*/React.createElement("span", {
    className: "qd-caption",
    "aria-hidden": "true"
  }, "atajos")), /*#__PURE__*/React.createElement("svg", {
    className: "qd-goo",
    width: "0",
    height: "0",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("filter", {
    id: "qd-goo"
  }, /*#__PURE__*/React.createElement("feGaussianBlur", {
    in: "SourceGraphic",
    stdDeviation: "6",
    result: "b"
  }), /*#__PURE__*/React.createElement("feColorMatrix", {
    in: "b",
    mode: "matrix",
    values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 12 -5"
  })))));
}
Object.assign(window, {
  SearchPalette,
  QuickView,
  QuickDock
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_bersaglio_redesign/components/Overlays.jsx", error: String((e && e.message) || e) }); }

// design_handoff_bersaglio_redesign/components/Pages.jsx
try { (() => {
/* global React, IconArrow */
// Bersaglio storefront — Pages.jsx · faithful mirrors of production pages.
// Loaded after Shell.jsx, Screens.jsx, Sections.jsx, Overlays.jsx.

// ════════════════════════════════════════════════════════════════════
// NOSOTROS — mirror of js/pages/nosotros.js (11 sections)
// ════════════════════════════════════════════════════════════════════
const NOS_CHAPTERS = [{
  y: '2013',
  t: 'El Diálogo Inicial',
  d: 'El taller comenzó con un sueño, dedicación y visitas personalizadas directamente en los hogares de nuestros clientes. Este contacto íntimo nos enseñó que antes que una joya, el huésped busca sentirse seguro, asesorado y acompañado en su elección.'
}, {
  y: '2016',
  t: 'La Consagración del Espacio',
  d: 'Gracias a esta filosofía de servicio y cercanía, crecimos paso a paso. Abrimos las puertas de nuestro primer atelier privado en el centro histórico de Cartagena, un refugio para mantener esa atención pausada e individual.'
}, {
  y: '2020',
  t: 'Estándares y Confianza',
  d: 'Consolidamos nuestra reputación basándonos en la transparencia absoluta de cada gema. Cada esmeralda y diamante se entrega con trazabilidad total y certificación ética, reforzando la credibilidad y el valor real de cada inversión.'
}, {
  y: '2023',
  t: 'Una Década de Relaciones',
  d: 'Cumplimos diez años de trayectoria construyendo vínculos duraderos. El acompañamiento y asesoramiento personalizado se consolidan formalmente como el corazón absoluto de Bersaglio.'
}, {
  y: '2026',
  t: 'La Verde y la Esencia',
  d: 'Hoy, seguimos conservando intacta la misma esencia con la que iniciamos: ofrecer una experiencia cercana, elegante y completamente personalizada, donde cada cliente se siente especial y cada joya tiene un significado real.'
}];
const NOS_VALORES = [{
  n: '01',
  t: 'La Elegancia como Silencio',
  d: 'Entendemos la sofisticación no como un destello ruidoso, sino como un susurro de distinción. Una joya Bersaglio es la expresión poética de tu estilo y de tu esencia.'
}, {
  n: '02',
  t: 'El Pacto de Credibilidad',
  d: 'Construimos relaciones duraderas basadas en la transparencia, la credibilidad y una confianza inquebrantable que custodia tu tranquilidad.'
}, {
  n: '03',
  t: 'La Asesoría antes del Oficio',
  d: 'Antes que vender, nos dedicamos a guiarte y asesorarte con paciencia, asegurando que cada cliente encuentre o co-cree la pieza idónea.'
}, {
  n: '04',
  t: 'Devoción en cada Detalle',
  d: 'Cada milímetro esculpido y cada interacción con nosotros está cuidada con devoción, buscando hacer de tu experiencia un recuerdo memorable.'
}, {
  n: '05',
  t: 'Cómplices de tu Felicidad',
  d: 'Nos apasiona ser parte de tus momentos más significativos. Diseñamos con el orgullo de dar forma física a tus emociones y celebraciones sagradas.'
}, {
  n: '06',
  t: 'Valor e Inversión Eterna',
  d: 'Transmitimos a nuestros clientes que una joya no es un gasto efímero, sino una inversión duradera que conserva e incrementa su significado y valor en el tiempo.'
}];
const NOS_EQUIPO = [{
  n: 'Kary Mendoza',
  r: 'Fundadora & Directora',
  b: 'Diez años dedicada a escuchar con empatía las historias de nuestros clientes para traducirlas en obras de arte eternas. Su mirada sensible guía la selección de cada gema y supervisa el detalle final de cada pieza.'
}, {
  n: 'Maestro Eliécer Patiño',
  r: 'Orfebre principal',
  b: 'Treinta y dos años de maestría y devoción orfebre. Formado bajo la tradición de la filigrana en Mompox y perfeccionado en Cartagena, domina la fundición a cera perdida y el engaste pavé de alta precisión.'
}, {
  n: 'Lucía Restrepo',
  r: 'Gemóloga GIA',
  b: 'Certificada por el prestigioso Gemological Institute of America (GIA). Es la guardiana de la excelencia gemológica de la Maison, analizando la pureza, color y procedencia de cada esmeralda y diamante.'
}, {
  n: 'Andrés Beltrán',
  r: 'Diseño & dibujo técnico',
  b: 'Traduce las conversaciones íntimas del atelier en bocetos poéticos a mano alzada, planos técnicos y modelados 3D meticulosos, sirviendo de puente entre el deseo del cliente y el crisol del orfebre.'
}];
const NOS_RESENAS = [{
  n: 'Valentina Restrepo',
  t: 'Llegué sin saber muy bien qué quería y salí con la pieza de mis sueños. Kary entendió mi historia mejor que yo. El trato es de otro nivel.',
  loc: 'Reseña en Google Maps'
}, {
  n: 'Andrés Mejía',
  t: 'Mandé hacer el anillo de compromiso y superó todo lo que imaginaba. Se siente el amor por el oficio en cada detalle. Mil gracias.',
  loc: 'Reseña en Google Maps'
}, {
  n: 'Camila Tordecilla',
  t: 'Un lugar precioso en el Centro Histórico. Te reciben con un café y una paciencia que ya no se ve. La esmeralda quedó espectacular.',
  loc: 'Reseña en Google Maps'
}, {
  n: 'Juan Pablo Vergara',
  t: 'Calidad real y honestidad. Me explicaron cada piedra con su certificado. Volveré sin duda para la próxima ocasión especial.',
  loc: 'Reseña en Google Maps'
}];
const NOS_FAQS = [{
  q: '¿Cuánto tarda una pieza a medida?',
  a: 'Entre cuatro y seis semanas desde la aprobación del boceto. La primera conversación, los renders y los ajustes pueden sumar dos semanas adicionales. No aceleramos plazos: el oficio paciente no admite atajos.'
}, {
  q: '¿Trabajan con piedras del cliente?',
  a: 'Sí. Recibimos gemas heredadas, las evaluamos con nuestra gemóloga, y las integramos en una pieza nueva. Si la talla original tiene daños, ofrecemos retalle previo en taller especializado.'
}, {
  q: '¿Hacen envíos internacionales?',
  a: 'Sí, con seguro pleno declarado y entrega registrada por DHL Express o FedEx Priority. Despachamos a más de cuarenta países. Los aranceles del país destino corren por cuenta del cliente.'
}, {
  q: '¿Aceptan financiación?',
  a: 'Hasta tres cuotas sin interés con tarjetas locales. Para piezas sobre $50.000.000 COP estructuramos planes a seis o doce meses con entidades aliadas.'
}, {
  q: '¿Puedo visitar el atelier sin comprar?',
  a: 'Por supuesto. La cita previa es solo para garantizar que tengamos tiempo para ti. Recibirás un café, te mostraremos el taller, conocerás al maestro orfebre. Sin compromiso de compra.'
}, {
  q: '¿Qué garantía tienen las piezas?',
  a: 'Garantía de por vida en estructura y engaste. Si una piedra se afloja, la reparamos sin costo. Si una soldadura cede, la rehacemos. Mientras Bersaglio exista, tu pieza tiene casa.'
}];
const NOS_STATS = [{
  n: '13',
  l: 'años de oficio',
  s: 'desde 2013'
}, {
  n: '+1.200',
  l: 'piezas entregadas',
  s: 'con libreta de origen'
}, {
  n: '40',
  l: 'países alcanzados',
  s: 'envíos asegurados'
}, {
  n: '100%',
  l: 'trazabilidad',
  s: 'gema · oro · orfebre'
}];
const NOS_CERTS = [{
  t: 'Jewelers of America',
  d: 'Miembro acreditado desde 2020'
}, {
  t: 'GIA',
  d: 'Reportes gemológicos en cada diamante'
}, {
  t: 'Muzo Origin',
  d: 'Certificación de mina en cada esmeralda'
}, {
  t: 'Responsible Jewellery Council',
  d: 'Trazabilidad de oro y prácticas éticas'
}];
const avatarInitials = name => {
  const parts = name.trim().split(/\s+/);
  return (parts[0] && parts[0][0] || '') + (parts[parts.length - 1] && parts[parts.length - 1][0] || '');
};
function NosotrosScreen({
  navigate
}) {
  const [activeChapter, setActiveChapter] = React.useState(0);
  const [openFaq, setOpenFaq] = React.useState(0);
  const c = NOS_CHAPTERS[activeChapter];
  return /*#__PURE__*/React.createElement("div", {
    className: "container abt-page"
  }, /*#__PURE__*/React.createElement("section", {
    className: "abt-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-hero-text"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono abt-eyebrow"
  }, "CAP\xCDTULO 00 \xB7 NUESTRA ALMA"), /*#__PURE__*/React.createElement("h1", {
    className: "abt-hero-title"
  }, "Un legado", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text abt-hero-title-em"
  }, "se susurra,"), /*#__PURE__*/React.createElement("br", null), "no se compra."), /*#__PURE__*/React.createElement("p", {
    className: "abt-hero-lead"
  }, "Nacimos con una visi\xF3n clara: acercar piezas \xFAnicas a quienes aprecian la elegancia y el valor de una joya aut\xE9ntica. Nuestro viaje comenz\xF3 desde cero, visitando a nuestros clientes en la calidez de sus hogares, construyendo relaciones basadas en la confianza y en una cercan\xEDa que hoy se mantiene como el alma del atelier."), /*#__PURE__*/React.createElement("p", {
    className: "abt-hero-italic"
  }, "M\xE1s que vender joyas, nos apasiona asesorar. Dise\xF1amos con la convicci\xF3n de que una pieza no es un simple accesorio, sino un reflejo de tu esencia, una emoci\xF3n duradera y una inversi\xF3n que trasciende en el tiempo."), /*#__PURE__*/React.createElement("div", {
    className: "abt-hero-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => navigate('contacto')
  }, "Agendar una visita ", /*#__PURE__*/React.createElement(IconArrow, {
    size: 14
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua",
    onClick: () => navigate('catalogo')
  }, "Ver colecciones"))), /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent abt-hero-image"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-hero-image-bg"
  }), /*#__PURE__*/React.createElement("div", {
    className: "abt-hero-image-shade"
  }), /*#__PURE__*/React.createElement("div", {
    className: "abt-hero-image-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono abt-hero-image-eyebrow"
  }, "ATELIER \xB7 CARTAGENA DE INDIAS"), /*#__PURE__*/React.createElement("div", {
    className: "abt-hero-quote"
  }, "\"Nuestra casa es tu casa.\""), /*#__PURE__*/React.createElement("div", {
    className: "mono abt-hero-quote-author"
  }, "\u2014 KARY MENDOZA")))), /*#__PURE__*/React.createElement("section", {
    className: "glass abt-stats"
  }, NOS_STATS.map((k, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: 'abt-stat' + (i > 0 ? ' abt-stat--bordered' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "display abt-stat-num"
  }, k.n), /*#__PURE__*/React.createElement("div", {
    className: "abt-stat-label"
  }, k.l), /*#__PURE__*/React.createElement("div", {
    className: "mono abt-stat-sub"
  }, k.s)))), /*#__PURE__*/React.createElement("section", {
    className: "abt-manifiesto"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "abt-manifiesto-title"
  }, "Sostenemos que el lujo aut\xE9ntico carece de estridencias.", ' ', /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "Es un secreto compartido entre dos personas"), ", esbozado en la calidez de nuestro atelier, donde el tiempo se detiene para dar vida a una creaci\xF3n que trascender\xE1 nuestra propia existencia."), /*#__PURE__*/React.createElement("div", {
    className: "abt-manifiesto-divider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "mono abt-manifiesto-foot"
  }, "MAISON BERSAGLIO \xB7 CARTAGENA DE INDIAS")), /*#__PURE__*/React.createElement("section", {
    className: "abt-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "filosofia-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent val-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono val-card-num"
  }, "MISI\xD3N"), /*#__PURE__*/React.createElement("h3", {
    className: "val-card-title"
  }, "Nuestra Promesa"), /*#__PURE__*/React.createElement("p", {
    className: "val-card-desc"
  }, "Concebir piezas exclusivas mediante una asesor\xEDa \xEDntima y cercana. Acompa\xF1amos a nuestros clientes en la elecci\xF3n de joyas que representen su distinci\xF3n y los instantes m\xE1s valiosos de su vida, asegurando siempre una experiencia de confianza, calidad y emotividad perdurable.")), /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent val-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono val-card-num"
  }, "VISI\xD3N"), /*#__PURE__*/React.createElement("h3", {
    className: "val-card-title"
  }, "El Horizonte"), /*#__PURE__*/React.createElement("p", {
    className: "val-card-desc"
  }, "Ser el atelier de alta joyer\xEDa personalizada de referencia en excelencia y discreci\xF3n, consolidando un acompa\xF1amiento generacional que perpet\xFAa el legado emocional de nuestros clientes a trav\xE9s de piezas de autor \xFAnicas que vencen al tiempo.")))), /*#__PURE__*/React.createElement("section", {
    className: "abt-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-section-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono abt-eyebrow"
  }, "NUESTROS PRINCIPIOS"), /*#__PURE__*/React.createElement("h2", {
    className: "abt-section-title"
  }, "Seis cosas en las que ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "no negociamos"))), /*#__PURE__*/React.createElement("div", {
    className: "val-grid"
  }, NOS_VALORES.map(v => /*#__PURE__*/React.createElement("div", {
    key: v.n,
    className: "glass glass-iridescent val-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "val-card-num-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono val-card-num"
  }, v.n), /*#__PURE__*/React.createElement("div", {
    className: "val-card-line"
  })), /*#__PURE__*/React.createElement("div", {
    className: "val-card-title"
  }, v.t), /*#__PURE__*/React.createElement("p", {
    className: "val-card-desc"
  }, v.d))))), /*#__PURE__*/React.createElement("section", {
    className: "abt-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-section-header"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "abt-section-title"
  }, "Trece a\xF1os en ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "cinco cap\xEDtulos"))), /*#__PURE__*/React.createElement("div", {
    className: "glass abt-timeline"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-timeline-tabs"
  }, NOS_CHAPTERS.map((ch, i) => /*#__PURE__*/React.createElement("button", {
    key: ch.y,
    type: "button",
    className: 'abt-timeline-tab' + (i === activeChapter ? ' is-active' : ''),
    onClick: () => setActiveChapter(i)
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono abt-timeline-tab-year"
  }, ch.y), ch.t))), /*#__PURE__*/React.createElement("div", {
    className: "abt-timeline-content tl-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-timeline-side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "display abt-timeline-year"
  }, c.y), /*#__PURE__*/React.createElement("div", {
    className: "abt-timeline-divider"
  })), /*#__PURE__*/React.createElement("div", {
    className: "abt-timeline-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-timeline-title"
  }, c.t), /*#__PURE__*/React.createElement("p", {
    className: "abt-timeline-desc"
  }, c.d))))), /*#__PURE__*/React.createElement("section", {
    className: "atl-split"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent atl-image"
  }, /*#__PURE__*/React.createElement("div", {
    className: "atl-image-bg"
  }), /*#__PURE__*/React.createElement("div", {
    className: "chip glass-pill atl-chip"
  }, "El Atelier")), /*#__PURE__*/React.createElement("div", {
    className: "glass atl-text"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "atl-text-title"
  }, "Donde el oficio", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "toma forma")), /*#__PURE__*/React.createElement("p", {
    className: "atl-text-p"
  }, "En el coraz\xF3n del Centro Hist\xF3rico de Cartagena tenemos nuestra casa: un espacio abierto al p\xFAblico donde te recibimos con calma y una atenci\xF3n c\xE1lida y personalizada. Aqu\xED se conversa, se dise\xF1a y se crea \u2014 porque en Bersaglio no revendemos: fabricamos cada pieza."), /*#__PURE__*/React.createElement("p", {
    className: "atl-text-p"
  }, "Kary y su equipo acompa\xF1an cada paso: desde la primera conversaci\xF3n y el boceto a mano, hasta dar vida a la joya y entregarla firmada. Un proceso cercano, sin prisas y hecho a la medida de tu historia."), /*#__PURE__*/React.createElement("div", {
    className: "atl-stats"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mono atl-stat-key"
  }, "UBICACI\xD3N"), /*#__PURE__*/React.createElement("div", {
    className: "atl-stat-val"
  }, "Cartagena de Indias", /*#__PURE__*/React.createElement("br", null), "Calle 36 # 6-32", /*#__PURE__*/React.createElement("br", null), "San Agust\xEDn Chiquita \xB7 Centro Hist\xF3rico", /*#__PURE__*/React.createElement("br", null), "Bol\xEDvar, Colombia")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mono atl-stat-key"
  }, "VISITAS"), /*#__PURE__*/React.createElement("div", {
    className: "atl-stat-val"
  }, "Con o sin cita previa", /*#__PURE__*/React.createElement("br", null), "Lun\u2013S\xE1b \xB7 10:00\u201319:00"))))), /*#__PURE__*/React.createElement("section", {
    className: "abt-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-section-header"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "abt-section-title"
  }, "El equipo ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "detr\xE1s del atelier"))), /*#__PURE__*/React.createElement("div", {
    className: "team-grid"
  }, NOS_EQUIPO.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: p.n,
    className: "glass glass-iridescent team-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "team-avatar",
    style: {
      '--ti': i
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "team-avatar-letter"
  }, avatarInitials(p.n))), /*#__PURE__*/React.createElement("div", {
    className: "team-name"
  }, p.n), /*#__PURE__*/React.createElement("div", {
    className: "mono team-role"
  }, p.r), /*#__PURE__*/React.createElement("p", {
    className: "team-bio"
  }, p.b))))), /*#__PURE__*/React.createElement("section", {
    className: "glass glass-emerald cert-section",
    id: "certificaciones"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cert-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cert-side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono cert-eyebrow"
  }, "RESPALDOS Y CERTIFICACIONES"), /*#__PURE__*/React.createElement("h3", {
    className: "cert-title"
  }, "Cada pieza viene con ", /*#__PURE__*/React.createElement("span", {
    className: "italic cert-title-em"
  }, "papel y palabra"))), /*#__PURE__*/React.createElement("div", {
    className: "cert-list"
  }, NOS_CERTS.map(c2 => /*#__PURE__*/React.createElement("div", {
    key: c2.t,
    className: "cert-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cert-card-title"
  }, c2.t), /*#__PURE__*/React.createElement("div", {
    className: "cert-card-desc"
  }, c2.d)))))), /*#__PURE__*/React.createElement("section", {
    className: "abt-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-section-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono abt-eyebrow"
  }, "EN SUS PALABRAS"), /*#__PURE__*/React.createElement("h2", {
    className: "abt-section-title"
  }, "Historias que ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "nos confiaron"))), /*#__PURE__*/React.createElement("div", {
    className: "resena-grid"
  }, NOS_RESENAS.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.n,
    className: "glass glass-iridescent resena-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "resena-stars",
    "aria-label": "5 de 5 estrellas"
  }, [0, 1, 2, 3, 4].map(i => /*#__PURE__*/React.createElement("svg", {
    key: i,
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z"
  })))), /*#__PURE__*/React.createElement("p", {
    className: "resena-quote"
  }, p.t), /*#__PURE__*/React.createElement("div", {
    className: "resena-foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "resena-name"
  }, p.n), /*#__PURE__*/React.createElement("span", {
    className: "mono resena-src"
  }, p.loc)))))), /*#__PURE__*/React.createElement("section", {
    className: "abt-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-section-header"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "abt-section-title"
  }, "Lo que ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "suelen preguntarnos"))), /*#__PURE__*/React.createElement("div", {
    className: "glass faq-wrap"
  }, NOS_FAQS.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: 'faq-item' + (i < NOS_FAQS.length - 1 ? ' faq-item--bordered' : '')
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "faq-trigger",
    "aria-expanded": openFaq === i,
    onClick: () => setOpenFaq(openFaq === i ? -1 : i)
  }, /*#__PURE__*/React.createElement("span", {
    className: "faq-q"
  }, f.q), /*#__PURE__*/React.createElement("span", {
    className: 'faq-toggle' + (openFaq === i ? ' is-open' : ''),
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  })))), openFaq === i && /*#__PURE__*/React.createElement("div", {
    className: "faq-answer"
  }, /*#__PURE__*/React.createElement("p", null, f.a)))))), /*#__PURE__*/React.createElement("section", {
    className: "glass glass-iridescent abt-cta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-cta-glow",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "abt-cta-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono abt-eyebrow"
  }, "EMPEZAMOS POR UNA CONVERSACI\xD3N"), /*#__PURE__*/React.createElement("h3", {
    className: "abt-cta-title"
  }, "Tu pr\xF3xima joya", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "comienza con un caf\xE9")), /*#__PURE__*/React.createElement("p", {
    className: "abt-cta-lead"
  }, "Agenda una visita al atelier o escr\xEDbenos. Sin compromiso, sin guion, sin prisas. Solo una conversaci\xF3n."), /*#__PURE__*/React.createElement("div", {
    className: "abt-cta-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => navigate('contacto')
  }, "Hablemos ", /*#__PURE__*/React.createElement(IconArrow, {
    size: 14
  }))))));
}

// ════════════════════════════════════════════════════════════════════
// CONTACTO — mirror of js/pages/contacto.js (3-tab form + sidebar)
// ════════════════════════════════════════════════════════════════════
const CT_CANALES = [{
  k: 'whatsapp',
  t: 'WhatsApp',
  v: '+57 301 375 2592',
  d: 'Respuesta inmediata · 09:00–20:00',
  href: 'https://wa.me/573013752592'
}, {
  k: 'email',
  t: 'Correo',
  v: 'info@bersagliojewelry.co',
  d: 'Respondemos en < 24h',
  href: 'mailto:info@bersagliojewelry.co'
}, {
  k: 'instagram',
  t: 'Instagram',
  v: '@bersagliojewelry',
  d: 'Mensaje directo',
  href: 'https://instagram.com/bersagliojewelry'
}];
const CT_CANAL_ICON = {
  whatsapp: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.737-.979zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
  })),
  telefono: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
  })),
  email: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "22,6 12,13 2,6"
  })),
  instagram: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.4-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z"
  }))
};
const CT_HORAS = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const CT_HORARIOS = [{
  d: 'Lunes',
  h: '10:00 – 19:00',
  abierto: true
}, {
  d: 'Martes',
  h: '10:00 – 19:00',
  abierto: true
}, {
  d: 'Miércoles',
  h: '10:00 – 19:00',
  abierto: true
}, {
  d: 'Jueves',
  h: '10:00 – 19:00',
  abierto: true
}, {
  d: 'Viernes',
  h: '10:00 – 20:00',
  abierto: true
}, {
  d: 'Sábado',
  h: '10:00 – 18:00',
  abierto: true
}, {
  d: 'Domingo',
  h: 'Solo con cita previa',
  abierto: false
}];
const CT_FAQS = [{
  q: '¿Necesito cita previa?',
  a: 'No es obligatoria: puedes acercarte directamente o reservar una cita para una atención más dedicada. Ambas son bienvenidas.'
}, {
  q: '¿Hay parqueadero?',
  a: 'En el Centro Histórico encuentras varios parqueaderos privados y seguros a pocos pasos del atelier.'
}, {
  q: '¿Puedo llevar acompañantes?',
  a: 'Hasta tres personas. Indícalo al agendar para preparar el espacio.'
}, {
  q: '¿Atienden en otro idioma?',
  a: 'Español e inglés. Francés e italiano con cita previa, informándolo al agendar.'
}];
const CT_MOTIVOS = [{
  k: 'asesoria',
  t: 'Asesoría general',
  d: 'Quiero conocer las colecciones'
}, {
  k: 'pieza',
  t: 'Pieza a medida',
  d: 'Tengo una idea o una historia'
}, {
  k: 'compromiso',
  t: 'Anillo de compromiso',
  d: 'Asesoría privada y discreta'
}, {
  k: 'herencia',
  t: 'Pieza heredada',
  d: 'Restauración o reinterpretación'
}, {
  k: 'prensa',
  t: 'Prensa & medios',
  d: 'Editoriales y entrevistas'
}, {
  k: 'otro',
  t: 'Otro motivo',
  d: 'Cuéntame en el mensaje'
}];
const CT_PRESUPS = ['Definiendo', '< $5M', '$5M–$15M', '$15M–$50M', '> $50M'];
const CT_VISITA_MOTIVOS = [['asesoria', 'Asesoría general'], ['pieza', 'Pieza a medida'], ['compromiso', 'Anillo de compromiso'], ['evento', 'Evento especial'], ['otro', 'Otro']];
const CT_FRANJAS = [{
  k: 'manana',
  t: 'Mañana',
  h: '09:00–12:00'
}, {
  k: 'tarde',
  t: 'Tarde',
  h: '14:00–17:00'
}, {
  k: 'noche',
  t: 'Final de tarde',
  h: '17:00–19:00'
}];
const CT_URGENCIAS = [['normal', 'Sin prisa'], ['semana', 'Esta semana'], ['urgente', 'Hoy mismo']];
const CT_PROCESO = [{
  n: '01',
  t: 'Lectura Personal',
  d: 'Tu mensaje es leído directamente por Kary Mendoza y su equipo. Prescindimos de respuestas automáticas o chatbots; valoramos el contacto humano desde el primer segundo.',
  tiempo: 'En el día'
}, {
  n: '02',
  t: 'Primer Diálogo',
  d: 'Nos pondremos en contacto para entender mejor el contexto de tu joya: la historia detrás del encargo, el tipo de gema preferida y las expectativas de entrega.',
  tiempo: '< 24 horas'
}, {
  n: '03',
  t: 'Encuentro Pausado',
  d: 'Agendamos una llamada de voz, chat directo o un café en nuestra Maison en el centro histórico de Cartagena. Una conversación íntima, sin presiones comerciales.',
  tiempo: 'A tu ritmo'
}, {
  n: '04',
  t: 'Manos a la Obra',
  d: 'Si decides que Bersaglio sea el custodio de tu legado, damos vida a tu pieza paso a paso: del primer boceto a mano alzada hasta la creación final en nuestro taller, siempre con tu aprobación.',
  tiempo: 'A medida'
}];
const minDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split('T')[0];
};
const todayIdx = () => (new Date().getDay() + 6) % 7;
function ContactoScreen() {
  const [tab, setTab] = React.useState('mensaje');
  const [sent, setSent] = React.useState(false);
  const [form, setForm] = React.useState({
    n: '',
    e: '',
    tel: '',
    t: 'asesoria',
    presup: '',
    m: ''
  });
  const [visit, setVisit] = React.useState({
    n: '',
    e: '',
    tel: '',
    fecha: '',
    hora: '10:00',
    personas: '1',
    motivo: 'asesoria',
    notas: ''
  });
  const [call, setCall] = React.useState({
    n: '',
    tel: '',
    franja: 'manana',
    urgencia: 'normal'
  });
  const updF = (k, v) => setForm(p => ({
    ...p,
    [k]: v
  }));
  const updV = (k, v) => setVisit(p => ({
    ...p,
    [k]: v
  }));
  const updC = (k, v) => setCall(p => ({
    ...p,
    [k]: v
  }));
  const onSubmit = e => {
    e.preventDefault();
    setSent(true);
  };
  const today = CT_HORARIOS[todayIdx()];
  const TABS = [{
    k: 'mensaje',
    t: 'Enviar mensaje'
  }, {
    k: 'visita',
    t: 'Agendar visita'
  }, {
    k: 'llamada',
    t: 'Pedir llamada'
  }];
  const successName = (tab === 'mensaje' ? form.n : tab === 'visita' ? visit.n : call.n) || 'distinguido huésped';
  const successMsg = tab === 'visita' ? `Confirmaremos los detalles de tu cita privada por canales directos para el ${visit.fecha || 'día solicitado'} a las ${visit.hora}. El atelier estará reservado exclusivamente para ti.` : tab === 'llamada' ? 'Nos comunicaremos contigo telefónicamente en la franja horaria establecida. Esperamos conversar pronto.' : 'Agradecemos tu confidencia. Kary Mendoza o un gemólogo del atelier se pondrá en contacto contigo en las próximas horas.';
  return /*#__PURE__*/React.createElement("div", {
    className: "container ct-page"
  }, /*#__PURE__*/React.createElement("section", {
    className: "ct-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono ct-hero-eyebrow"
  }, "CONSERJER\xCDA PRIVADA"), /*#__PURE__*/React.createElement("h1", {
    className: "ct-hero-title"
  }, "Un encuentro pausado,", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text ct-hero-title-em"
  }, "una esmeralda \xFAnica,"), " un legado eterno."), /*#__PURE__*/React.createElement("p", {
    className: "ct-hero-lead"
  }, "Te invitamos a dar el primer paso. Elige la v\xEDa de comunicaci\xF3n que te resulte m\xE1s c\xF3moda; cada mensaje es atendido de manera directa y confidencial por Kary Mendoza y su equipo.")), /*#__PURE__*/React.createElement("section", {
    className: "ct-canales canales-grid"
  }, CT_CANALES.map(c => /*#__PURE__*/React.createElement("a", {
    key: c.k,
    className: "glass glass-iridescent canal-card",
    href: c.href,
    target: c.k === 'instagram' || c.k === 'whatsapp' ? '_blank' : undefined,
    rel: c.k === 'instagram' || c.k === 'whatsapp' ? 'noopener' : undefined
  }, /*#__PURE__*/React.createElement("div", {
    className: 'canal-icon canal-icon--' + c.k
  }, CT_CANAL_ICON[c.k]), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "canal-title"
  }, c.t), /*#__PURE__*/React.createElement("div", {
    className: "mono canal-value"
  }, c.v), /*#__PURE__*/React.createElement("div", {
    className: "canal-desc"
  }, c.d))))), /*#__PURE__*/React.createElement("section", {
    className: "contact-grid ct-mainrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent ct-form-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-tabbar",
    role: "tablist"
  }, TABS.map(opt => /*#__PURE__*/React.createElement("button", {
    key: opt.k,
    type: "button",
    className: 'ct-tab' + (tab === opt.k ? ' is-active' : ''),
    role: "tab",
    "aria-selected": tab === opt.k,
    onClick: () => {
      setTab(opt.k);
      setSent(false);
    }
  }, opt.t))), sent ? /*#__PURE__*/React.createElement("div", {
    className: "ct-success"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-success-check",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "36",
    height: "36",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "2.5"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6L9 17l-5-5"
  }))), /*#__PURE__*/React.createElement("h3", {
    className: "ct-success-title"
  }, "Recibido, ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, successName)), /*#__PURE__*/React.createElement("p", {
    className: "ct-success-msg"
  }, successMsg), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-aqua ct-success-again",
    onClick: () => setSent(false)
  }, "Enviar otro")) : tab === 'mensaje' ? /*#__PURE__*/React.createElement("form", {
    className: "ct-form",
    onSubmit: onSubmit,
    noValidate: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-form-row ct-form-row--2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Nombre completo", /*#__PURE__*/React.createElement("span", {
    className: "ct-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "ct-field-input",
    value: form.n,
    onChange: e => updF('n', e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Email", /*#__PURE__*/React.createElement("span", {
    className: "ct-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "email",
    className: "ct-field-input",
    value: form.e,
    onChange: e => updF('e', e.target.value),
    required: true
  }))), /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Tel\xE9fono / WhatsApp (opcional)"), /*#__PURE__*/React.createElement("input", {
    type: "tel",
    className: "ct-field-input",
    value: form.tel,
    onChange: e => updF('tel', e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow ct-section-label"
  }, "\xBFSobre qu\xE9 quieres hablar?"), /*#__PURE__*/React.createElement("div", {
    className: "motivo-grid"
  }, CT_MOTIVOS.map(mt => /*#__PURE__*/React.createElement("button", {
    key: mt.k,
    type: "button",
    className: 'ct-motivo-card' + (form.t === mt.k ? ' is-active' : ''),
    onClick: () => updF('t', mt.k)
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-motivo-title"
  }, mt.t), /*#__PURE__*/React.createElement("div", {
    className: "ct-motivo-desc"
  }, mt.d))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow ct-section-label"
  }, "Rango de presupuesto (opcional)"), /*#__PURE__*/React.createElement("div", {
    className: "ct-presup-row"
  }, CT_PRESUPS.map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    type: "button",
    className: 'ct-presup-pill' + (form.presup === p ? ' is-active' : ''),
    onClick: () => updF('presup', p)
  }, p)))), /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Describe el motivo de tu inspiraci\xF3n"), /*#__PURE__*/React.createElement("textarea", {
    className: "ct-field-input",
    rows: 5,
    value: form.m,
    placeholder: "\xBFQu\xE9 historia o momento desea conmemorar? \xBFTiene alguna preferencia por una gema en particular?",
    onChange: e => updF('m', e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "ct-form-foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-discreto"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
  })), "Tus datos se tratan con discreci\xF3n absoluta."), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn-aqua btn-aqua-emerald ct-submit"
  }, "Enviar mensaje", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  }))))) : tab === 'visita' ? /*#__PURE__*/React.createElement("form", {
    className: "ct-form",
    onSubmit: onSubmit,
    noValidate: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-banner ct-banner--visit"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-banner-icon",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "26",
    height: "26",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M17 8h1a4 4 0 1 1 0 8h-1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 1v3M10 1v3M14 1v3"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ct-banner-title"
  }, "Cita Privada en la Maison"), /*#__PURE__*/React.createElement("div", {
    className: "ct-banner-desc"
  }, "Centro Hist\xF3rico, Cartagena \xB7 60\u201390 min \xB7 Un espacio consagrado a tus ideas"))), /*#__PURE__*/React.createElement("div", {
    className: "ct-form-row ct-form-row--2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Nombre completo", /*#__PURE__*/React.createElement("span", {
    className: "ct-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "ct-field-input",
    value: visit.n,
    onChange: e => updV('n', e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Email", /*#__PURE__*/React.createElement("span", {
    className: "ct-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "email",
    className: "ct-field-input",
    value: visit.e,
    onChange: e => updV('e', e.target.value),
    required: true
  }))), /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Tel\xE9fono / WhatsApp", /*#__PURE__*/React.createElement("span", {
    className: "ct-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "tel",
    className: "ct-field-input",
    value: visit.tel,
    onChange: e => updV('tel', e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "ct-form-row visit-row"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Fecha preferida", /*#__PURE__*/React.createElement("span", {
    className: "ct-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "ct-field-input",
    min: minDate(),
    value: visit.fecha,
    onChange: e => updV('fecha', e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Hora"), /*#__PURE__*/React.createElement("select", {
    className: "ct-field-input",
    value: visit.hora,
    onChange: e => updV('hora', e.target.value)
  }, CT_HORAS.map(h => /*#__PURE__*/React.createElement("option", {
    key: h,
    value: h
  }, h)))), /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Personas"), /*#__PURE__*/React.createElement("select", {
    className: "ct-field-input",
    value: visit.personas,
    onChange: e => updV('personas', e.target.value)
  }, ['1', '2', '3', '4'].map(n => /*#__PURE__*/React.createElement("option", {
    key: n,
    value: n
  }, n))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow ct-section-label"
  }, "Motivo de la visita"), /*#__PURE__*/React.createElement("div", {
    className: "ct-pills"
  }, CT_VISITA_MOTIVOS.map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    type: "button",
    className: 'ct-pill' + (visit.motivo === k ? ' is-active' : ''),
    onClick: () => updV('motivo', k)
  }, l)))), /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Notas (alergias, idioma preferido, accesibilidad...)"), /*#__PURE__*/React.createElement("textarea", {
    className: "ct-field-input",
    rows: 5,
    value: visit.notas,
    placeholder: "Cualquier detalle que nos ayude a recibirte mejor.",
    onChange: e => updV('notas', e.target.value)
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn-aqua btn-aqua-emerald ct-submit ct-submit--start"
  }, "Reservar mi visita", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))) : /*#__PURE__*/React.createElement("form", {
    className: "ct-form",
    onSubmit: onSubmit,
    noValidate: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-banner ct-banner--call"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-banner-icon",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ct-banner-title"
  }, "Llamada Confidencial"), /*#__PURE__*/React.createElement("div", {
    className: "ct-banner-desc"
  }, "Establezcamos una conversaci\xF3n telef\xF3nica en el horario de tu preferencia."))), /*#__PURE__*/React.createElement("div", {
    className: "ct-form-row ct-form-row--2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Nombre", /*#__PURE__*/React.createElement("span", {
    className: "ct-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "ct-field-input",
    value: call.n,
    onChange: e => updC('n', e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Tel\xE9fono", /*#__PURE__*/React.createElement("span", {
    className: "ct-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "tel",
    className: "ct-field-input",
    value: call.tel,
    onChange: e => updC('tel', e.target.value),
    required: true
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow ct-section-label"
  }, "Mejor franja horaria"), /*#__PURE__*/React.createElement("div", {
    className: "ct-franja-grid"
  }, CT_FRANJAS.map(f => /*#__PURE__*/React.createElement("button", {
    key: f.k,
    type: "button",
    className: 'ct-franja-card' + (call.franja === f.k ? ' is-active' : ''),
    onClick: () => updC('franja', f.k)
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-franja-title"
  }, f.t), /*#__PURE__*/React.createElement("div", {
    className: "mono ct-franja-hour"
  }, f.h))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow ct-section-label"
  }, "Urgencia"), /*#__PURE__*/React.createElement("div", {
    className: "ct-pills"
  }, CT_URGENCIAS.map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    type: "button",
    className: 'ct-pill' + (call.urgencia === k ? ' is-active' : ''),
    onClick: () => updC('urgencia', k)
  }, l)))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn-aqua btn-aqua-emerald ct-submit ct-submit--start"
  }, "Pedir llamada", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  }))))), /*#__PURE__*/React.createElement("aside", {
    className: "ct-sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass glass-emerald ct-atelier"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-map"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: "100%",
    viewBox: "0 0 400 200",
    preserveAspectRatio: "xMidYMid slice",
    className: "ct-map-svg"
  }, /*#__PURE__*/React.createElement("g", {
    stroke: "oklch(85% 0.14 90)",
    strokeWidth: "0.7",
    fill: "none",
    opacity: "0.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M-10 52 H410"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M-10 96 H410"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M-10 140 H410"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M60 -10 V210"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M150 -10 V210"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M250 -10 V210"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M330 -10 V210"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M-10 74 L410 124",
    opacity: "0.35"
  })), /*#__PURE__*/React.createElement("path", {
    d: "M-10 176 Q120 160 240 178 T410 168",
    stroke: "oklch(72% 0.09 220)",
    strokeWidth: "3",
    fill: "none",
    opacity: "0.4",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("g", {
    fill: "oklch(85% 0.14 90)",
    opacity: "0.16"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "70",
    y: "104",
    width: "68",
    height: "30",
    rx: "2"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "160",
    y: "58",
    width: "78",
    height: "32",
    rx: "2"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "260",
    y: "104",
    width: "58",
    height: "30",
    rx: "2"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ct-map-pin",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-map-pin-bubble"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-map-pin-dot"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ct-map-pin-label"
  }, "Atelier")), /*#__PURE__*/React.createElement("div", {
    className: "ct-map-flag"
  }, "CENTRO HIST\xD3RICO")), /*#__PURE__*/React.createElement("div", {
    className: "ct-atelier-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono ct-atelier-eyebrow"
  }, "CASA BERSAGLIO"), /*#__PURE__*/React.createElement("div", {
    className: "ct-atelier-title"
  }, "Cartagena de Indias"), /*#__PURE__*/React.createElement("p", {
    className: "ct-atelier-addr"
  }, "Calle 36 # 6-32", /*#__PURE__*/React.createElement("br", null), "San Agust\xEDn Chiquita \xB7 Centro Hist\xF3rico", /*#__PURE__*/React.createElement("br", null), "Bol\xEDvar, Colombia"), /*#__PURE__*/React.createElement("a", {
    href: "https://maps.google.com/?q=Cartagena+Centro+Hist%C3%B3rico",
    target: "_blank",
    rel: "noopener",
    className: "ct-atelier-mapbtn"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "10",
    r: "3"
  })), "Abrir en mapas"))), /*#__PURE__*/React.createElement("div", {
    className: "glass ct-horarios"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono ct-horarios-eyebrow"
  }, "HORARIOS DE ATENCI\xD3N"), /*#__PURE__*/React.createElement("ul", {
    className: "ct-horarios-list"
  }, CT_HORARIOS.map((h, i) => /*#__PURE__*/React.createElement("li", {
    key: h.d,
    className: 'ct-horario-row' + (i < CT_HORARIOS.length - 1 ? ' ct-horario-row--bordered' : '') + (h.abierto ? '' : ' ct-horario-row--closed')
  }, /*#__PURE__*/React.createElement("span", {
    className: "ct-horario-day"
  }, h.d), /*#__PURE__*/React.createElement("span", {
    className: "mono ct-horario-hour"
  }, h.h)))), today.abierto && /*#__PURE__*/React.createElement("div", {
    className: "ct-horarios-status"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ct-status-dot"
  }), /*#__PURE__*/React.createElement("span", null, "Abierto hoy \xB7 ", today.h))), /*#__PURE__*/React.createElement("div", {
    className: "glass ct-respuesta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono ct-respuesta-eyebrow"
  }, "RESPUESTA GARANTIZADA"), /*#__PURE__*/React.createElement("div", {
    className: "ct-respuesta-num"
  }, "< 24h"), /*#__PURE__*/React.createElement("div", {
    className: "ct-respuesta-sub"
  }, "en d\xEDas h\xE1biles")))), /*#__PURE__*/React.createElement("section", {
    className: "glass ct-proceso"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-proceso-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono ct-proceso-eyebrow"
  }, "QU\xC9 ESPERAR DE NOSOTROS"), /*#__PURE__*/React.createElement("h2", {
    className: "ct-proceso-title"
  }, "Despu\xE9s de que ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "nos escribes"))), /*#__PURE__*/React.createElement("div", {
    className: "ct-proceso-grid proc-grid"
  }, CT_PROCESO.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.n,
    className: "ct-proceso-step"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-proceso-num"
  }, p.n), /*#__PURE__*/React.createElement("div", {
    className: "ct-proceso-stepname"
  }, p.t), /*#__PURE__*/React.createElement("p", {
    className: "ct-proceso-stepdesc"
  }, p.d), /*#__PURE__*/React.createElement("div", {
    className: "mono ct-proceso-time"
  }, p.tiempo))))), /*#__PURE__*/React.createElement("section", {
    className: "ct-faq-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-faq-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono ct-faq-eyebrow"
  }, "ANTES DE TU VISITA"), /*#__PURE__*/React.createElement("h3", {
    className: "ct-faq-title"
  }, "Lo que necesitas ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "saber")), /*#__PURE__*/React.createElement("p", {
    className: "ct-faq-lead"
  }, "Cuatro respuestas r\xE1pidas para que llegues con todo claro. Si te queda alguna duda, escr\xEDbenos por WhatsApp."), /*#__PURE__*/React.createElement("a", {
    href: "https://wa.me/573013752592",
    target: "_blank",
    rel: "noopener",
    className: "btn-aqua btn-aqua-emerald ct-faq-cta"
  }, "Preguntar por WhatsApp", /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "ct-faq-grid"
  }, CT_FAQS.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "glass glass-iridescent ct-faq-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-faq-q"
  }, f.q), /*#__PURE__*/React.createElement("p", {
    className: "ct-faq-a"
  }, f.a))))));
}

// ════════════════════════════════════════════════════════════════════
// CARRITO — mirror of js/pages/carrito.js (3-step checkout stepper)
// ════════════════════════════════════════════════════════════════════
const CK_STEPS = ['Carrito', 'Envío', 'Pago'];
const CK_PAYMENT_OPTIONS = [{
  k: 'whatsapp',
  t: 'Coordinar por WhatsApp',
  d: 'Hablas directo con Kary, eliges el método de pago y los plazos.',
  icon: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M20.5 3.5A11 11 0 0 0 3.4 17l-1.4 5.1 5.2-1.4A11 11 0 1 0 20.5 3.5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 10.5c.3 2 2 3.7 4 4.2 1 .3 1.9.1 2.5-.5"
  }))
}, {
  k: 'transferencia',
  t: 'Transferencia bancaria',
  d: 'Bancolombia o Davivienda. Te enviamos los datos por correo.',
  icon: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M3 9h18v11H3z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 9l9-6 9 6"
  }))
}, {
  k: 'asesor',
  t: 'Que un asesor me llame',
  d: 'Preferimos hablar antes de avanzar. Te llamamos en menos de 4 horas hábiles.',
  icon: /*#__PURE__*/React.createElement("path", {
    d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
  })
}];
function CarritoScreen({
  items,
  onQty,
  onRemove,
  navigate
}) {
  const [step, setStep] = React.useState(1);
  const [payment, setPayment] = React.useState('whatsapp');
  const [ship, setShip] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Colombia',
    zip: ''
  });
  const updS = (k, v) => setShip(p => ({
    ...p,
    [k]: v
  }));
  const subtotal = items.reduce((s, i) => s + Number(i.price || 0) * (i.qty || 1), 0);
  const totalQty = items.reduce((s, i) => s + (i.qty || 1), 0);
  const empty = items.length === 0;
  const go = n => {
    if (empty && n > 1) return;
    setStep(Math.max(1, Math.min(3, n)));
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  };
  const onShipSubmit = e => {
    e.preventDefault();
    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }
    go(3);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "container ck-page"
  }, /*#__PURE__*/React.createElement("header", {
    className: "ck-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Checkout"), /*#__PURE__*/React.createElement("h1", {
    className: "ck-title"
  }, "Finalizar ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "compra"))), /*#__PURE__*/React.createElement("nav", {
    className: "glass ck-stepper",
    role: "tablist",
    "aria-label": "Pasos del checkout"
  }, CK_STEPS.map((s, i) => {
    const idx = i + 1;
    const disabled = empty && idx > 1;
    return /*#__PURE__*/React.createElement("button", {
      key: s,
      type: "button",
      className: 'ck-step' + (step === idx ? ' is-active' : '') + (disabled ? ' is-disabled' : ''),
      role: "tab",
      "aria-selected": step === idx,
      disabled: disabled,
      onClick: () => go(idx)
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono ck-step-num"
    }, "0", idx), s);
  })), /*#__PURE__*/React.createElement("div", {
    className: "ck-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass ck-card"
  }, step === 1 && (empty ? /*#__PURE__*/React.createElement("div", {
    className: "ck-empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-empty-icon",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "64",
    height: "64",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 2l-2 5v15h16V7l-2-5H6z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 7h16M10 11a2 2 0 0 0 4 0"
  }))), /*#__PURE__*/React.createElement("h3", {
    className: "ck-empty-title"
  }, "Tu carrito espera la primera pieza"), /*#__PURE__*/React.createElement("p", {
    className: "ck-empty-sub"
  }, "Explora la colecci\xF3n. Cada pieza Bersaglio se elige con tiempo, con calma y con un caf\xE9."), /*#__PURE__*/React.createElement("div", {
    className: "ck-empty-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => navigate('catalogo')
  }, "Ver el cat\xE1logo"), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua",
    onClick: () => navigate('contacto')
  }, "Hablar con un asesor"))) : /*#__PURE__*/React.createElement("div", {
    className: "ck-step-body"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ck-step-title"
  }, "Tus piezas"), /*#__PURE__*/React.createElement("div", {
    className: "ck-items"
  }, items.map(i => /*#__PURE__*/React.createElement("article", {
    key: i.id,
    className: "ck-item"
  }, /*#__PURE__*/React.createElement("a", {
    className: "ck-item-img",
    style: {
      background: `url('${i.img}') center/cover`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "ck-item-body"
  }, /*#__PURE__*/React.createElement("a", {
    className: "ck-item-name"
  }, i.name), /*#__PURE__*/React.createElement("div", {
    className: "mono ck-item-price"
  }, fmt$(i.price)), /*#__PURE__*/React.createElement("div", {
    className: "ck-item-controls"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-qty"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ck-qty-btn",
    onClick: () => onQty(i.id, i.qty - 1),
    "aria-label": "Restar uno"
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    className: "mono ck-qty-val"
  }, i.qty), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ck-qty-btn",
    onClick: () => onQty(i.id, i.qty + 1),
    "aria-label": "Sumar uno"
  }, "+")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ck-item-remove",
    onClick: () => onRemove(i.id)
  }, "Quitar")))))), /*#__PURE__*/React.createElement("div", {
    className: "ck-step-footer"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-aqua btn-aqua-emerald ck-cta",
    onClick: () => go(2)
  }, "Continuar al env\xEDo", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))))), step === 2 && /*#__PURE__*/React.createElement("div", {
    className: "ck-step-body"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ck-step-title"
  }, "Informaci\xF3n de env\xEDo"), /*#__PURE__*/React.createElement("form", {
    className: "ck-shipping",
    onSubmit: onShipSubmit,
    noValidate: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-field-row ck-field-row--2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Nombre", /*#__PURE__*/React.createElement("span", {
    className: "ck-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "ck-field-input",
    value: ship.firstName,
    autoComplete: "given-name",
    required: true,
    onChange: e => updS('firstName', e.target.value)
  })), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Apellido", /*#__PURE__*/React.createElement("span", {
    className: "ck-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "ck-field-input",
    value: ship.lastName,
    autoComplete: "family-name",
    required: true,
    onChange: e => updS('lastName', e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ck-field-row ck-field-row--2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Email", /*#__PURE__*/React.createElement("span", {
    className: "ck-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "email",
    className: "ck-field-input",
    value: ship.email,
    autoComplete: "email",
    required: true,
    onChange: e => updS('email', e.target.value)
  })), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Tel\xE9fono / WhatsApp", /*#__PURE__*/React.createElement("span", {
    className: "ck-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "tel",
    className: "ck-field-input",
    value: ship.phone,
    autoComplete: "tel",
    required: true,
    onChange: e => updS('phone', e.target.value)
  }))), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Direcci\xF3n", /*#__PURE__*/React.createElement("span", {
    className: "ck-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "ck-field-input",
    value: ship.address,
    autoComplete: "street-address",
    required: true,
    onChange: e => updS('address', e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "ck-field-row ck-field-row--3"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Ciudad", /*#__PURE__*/React.createElement("span", {
    className: "ck-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "ck-field-input",
    value: ship.city,
    autoComplete: "address-level2",
    required: true,
    onChange: e => updS('city', e.target.value)
  })), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Pa\xEDs", /*#__PURE__*/React.createElement("span", {
    className: "ck-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "ck-field-input",
    value: ship.country,
    autoComplete: "country-name",
    required: true,
    onChange: e => updS('country', e.target.value)
  })), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "C\xF3digo postal"), /*#__PURE__*/React.createElement("input", {
    className: "ck-field-input",
    value: ship.zip,
    autoComplete: "postal-code",
    onChange: e => updS('zip', e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ck-step-footer"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-aqua ck-back",
    onClick: () => go(1)
  }, "\u2190 Volver"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn-aqua btn-aqua-emerald ck-cta"
  }, "Continuar al pago", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))))), step === 3 && /*#__PURE__*/React.createElement("div", {
    className: "ck-step-body"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ck-step-title"
  }, "C\xF3mo quieres avanzar"), /*#__PURE__*/React.createElement("p", {
    className: "ck-step-lead"
  }, "Las piezas Bersaglio son \xFAnicas y de alto valor: cerramos cada compra en conversaci\xF3n. Elige c\xF3mo prefieres coordinar."), /*#__PURE__*/React.createElement("div", {
    className: "ck-payment-list"
  }, CK_PAYMENT_OPTIONS.map(opt => /*#__PURE__*/React.createElement("label", {
    key: opt.k,
    className: 'glass ck-payment' + (payment === opt.k ? ' is-active' : ''),
    onClick: () => setPayment(opt.k)
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "payment",
    value: opt.k,
    checked: payment === opt.k,
    readOnly: true,
    className: "ck-payment-radio"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ck-payment-icon"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    "aria-hidden": "true"
  }, opt.icon)), /*#__PURE__*/React.createElement("div", {
    className: "ck-payment-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-payment-title"
  }, opt.t), /*#__PURE__*/React.createElement("div", {
    className: "ck-payment-desc"
  }, opt.d))))), /*#__PURE__*/React.createElement("div", {
    className: "ck-step-footer"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-aqua ck-back",
    onClick: () => go(2)
  }, "\u2190 Volver"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-aqua btn-aqua-emerald ck-cta ck-confirm",
    onClick: () => navigate('gracias')
  }, "Confirmar \xB7 ", fmt$(subtotal), /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))))), !empty && /*#__PURE__*/React.createElement("aside", {
    className: "glass glass-emerald ck-summary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow ck-summary-eyebrow"
  }, "Resumen"), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary-lines"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-summary-row"
  }, /*#__PURE__*/React.createElement("span", null, "Subtotal \xB7 ", totalQty, " ", totalQty === 1 ? 'pieza' : 'piezas'), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, fmt$(subtotal))), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary-row"
  }, /*#__PURE__*/React.createElement("span", null, "Env\xEDo asegurado"), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "Cotizar")), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary-row"
  }, /*#__PURE__*/React.createElement("span", null, "IVA"), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "incluido"))), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary-divider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary-total"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ck-summary-total-label"
  }, "Total"), /*#__PURE__*/React.createElement("span", {
    className: "mono ck-summary-total-val"
  }, fmt$(subtotal))), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary-note"
  }, "Los precios se confirman al cierre con Kary. El env\xEDo internacional se cotiza por DHL Express o FedEx Priority."))));
}

// ════════════════════════════════════════════════════════════════════
// JOURNAL — mirror of js/pages/journal.js (masthead · ticker · cover · archive)
// ════════════════════════════════════════════════════════════════════
const jrAuthorInitials = author => {
  const clean = String(author || '').replace(/^Por\s+/i, '').trim();
  const parts = clean.split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase();
};
const jrTruncate = (t, n) => {
  t = String(t || '');
  return t.length <= n ? t : t.slice(0, n).replace(/\s+\S*$/, '') + '…';
};
function JournalScreen({
  navigate,
  openEntrada
}) {
  const feat = JOURNAL.find(e => e.featured) || JOURNAL[0];
  const rest = JOURNAL.filter(e => e !== feat);
  const side = rest.slice(0, 4);
  const ticker = [...JOURNAL_TICKER, ...JOURNAL_TICKER];
  const [subscribed, setSubscribed] = React.useState(false);
  const openE = slug => openEntrada ? openEntrada(slug) : navigate('entrada');
  return /*#__PURE__*/React.createElement("div", {
    className: "container jr-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-masthead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-masthead-brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono jr-est"
  }, JOURNAL_ISSUE.est), /*#__PURE__*/React.createElement("div", {
    className: "jr-est-divider"
  }), /*#__PURE__*/React.createElement("h1", {
    className: "jr-masthead-title"
  }, "The ", /*#__PURE__*/React.createElement("span", {
    className: "italic"
  }, "Bersaglio"), " Journal")), /*#__PURE__*/React.createElement("div", {
    className: "jr-masthead-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono jr-issue"
  }, JOURNAL_ISSUE.number, " \xB7 ", feat.dateLong))), /*#__PURE__*/React.createElement("div", {
    className: "jr-masthead-line"
  }), /*#__PURE__*/React.createElement("div", {
    className: "glass jr-ticker"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono jr-ticker-tag"
  }, /*#__PURE__*/React.createElement("span", {
    className: "jr-ticker-pulse"
  }), "EN VIVO"), /*#__PURE__*/React.createElement("div", {
    className: "jr-ticker-clip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-ticker-track"
  }, ticker.map((t, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "jr-ticker-item"
  }, t, /*#__PURE__*/React.createElement("span", {
    className: "jr-ticker-diamond"
  }, "\u25C6")))))), /*#__PURE__*/React.createElement("div", {
    className: "jr-fold"
  }, /*#__PURE__*/React.createElement("article", {
    className: "jr-cover"
  }, /*#__PURE__*/React.createElement("a", {
    className: "jr-cover-link",
    onClick: () => openE(feat.slug)
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-cover-imgwrap"
  }, /*#__PURE__*/React.createElement("img", {
    src: feat.img,
    alt: feat.title,
    className: "jr-cover-img",
    loading: "eager",
    decoding: "async"
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    className: "jr-cover-vignette"
  }), /*#__PURE__*/React.createElement("div", {
    className: "jr-cover-flag-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono jr-cover-flag"
  }, feat.section.toUpperCase()), /*#__PURE__*/React.createElement("span", {
    className: "mono jr-cover-read"
  }, feat.read, " de lectura")), /*#__PURE__*/React.createElement("div", {
    className: "jr-cover-caption"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono jr-cover-kicker"
  }, feat.kicker))), /*#__PURE__*/React.createElement("h2", {
    className: "jr-cover-title"
  }, feat.title), /*#__PURE__*/React.createElement("p", {
    className: "jr-cover-excerpt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "jr-cover-dropcap"
  }, feat.excerpt.charAt(0)), feat.excerpt.slice(1)), /*#__PURE__*/React.createElement("div", {
    className: "jr-cover-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-cover-author-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-cover-avatar"
  }, jrAuthorInitials(feat.author)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "jr-cover-author"
  }, feat.author), /*#__PURE__*/React.createElement("div", {
    className: "mono jr-cover-date"
  }, (feat.dateLong || '').toUpperCase()))), /*#__PURE__*/React.createElement("div", {
    className: "jr-cover-continue"
  }, "Continuar leyendo", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))))), /*#__PURE__*/React.createElement("aside", {
    className: "jr-side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-side-header"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "jr-side-title"
  }, "M\xE1s le\xEDdos"), /*#__PURE__*/React.createElement("div", {
    className: "mono jr-side-week"
  }, "ESTA SEMANA")), side.map((s, i) => /*#__PURE__*/React.createElement("article", {
    key: s.slug,
    className: "jr-side-row"
  }, /*#__PURE__*/React.createElement("a", {
    className: "jr-side-link",
    onClick: () => openE(s.slug)
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-side-num"
  }, "0", i + 1), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mono jr-side-meta"
  }, /*#__PURE__*/React.createElement("span", null, s.section), /*#__PURE__*/React.createElement("span", {
    className: "jr-side-meta-dot"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    className: "jr-side-meta-date"
  }, s.date)), /*#__PURE__*/React.createElement("h4", {
    className: "jr-side-headline"
  }, s.title), /*#__PURE__*/React.createElement("div", {
    className: "mono jr-side-read"
  }, s.read, " de lectura"))))), /*#__PURE__*/React.createElement("div", {
    className: "glass glass-emerald jr-newsletter"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono jr-newsletter-tag"
  }, "NEWSLETTER"), /*#__PURE__*/React.createElement("div", {
    className: "jr-newsletter-title"
  }, "Una nota cada", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "italic jr-newsletter-italic"
  }, "luna llena")), subscribed ? /*#__PURE__*/React.createElement("div", {
    className: "hj-newsletter-thanks"
  }, "Gracias. Te escribiremos pronto.") : /*#__PURE__*/React.createElement("form", {
    className: "jr-newsletter-form",
    onSubmit: e => {
      e.preventDefault();
      setSubscribed(true);
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "email",
    name: "email",
    placeholder: "tu@correo.com",
    className: "jr-newsletter-input",
    autoComplete: "email",
    required: true
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "jr-newsletter-btn"
  }, "Suscribir"))))), rest.length > 0 && /*#__PURE__*/React.createElement("section", {
    className: "jr-archive"
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-archive-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono jr-archive-eyebrow"
  }, "EL ARCHIVO COMPLETO"), /*#__PURE__*/React.createElement("h2", {
    className: "jr-archive-title"
  }, "Todas las entradas ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "del Journal"))), /*#__PURE__*/React.createElement("div", {
    className: "jr-archive-grid"
  }, rest.map(e => /*#__PURE__*/React.createElement("article", {
    key: e.slug,
    className: "glass jr-archive-card"
  }, /*#__PURE__*/React.createElement("a", {
    className: "jr-archive-link",
    onClick: () => openE(e.slug)
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-archive-imgwrap"
  }, /*#__PURE__*/React.createElement("img", {
    src: e.img,
    alt: e.title,
    className: "jr-archive-img",
    loading: "lazy",
    decoding: "async"
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    className: "jr-archive-vignette"
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono jr-archive-flag"
  }, e.section.toUpperCase())), /*#__PURE__*/React.createElement("div", {
    className: "jr-archive-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono jr-archive-meta"
  }, /*#__PURE__*/React.createElement("span", null, e.date), /*#__PURE__*/React.createElement("span", {
    className: "jr-archive-meta-dot"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, e.read, " de lectura")), /*#__PURE__*/React.createElement("h3", {
    className: "jr-archive-headline"
  }, e.title), /*#__PURE__*/React.createElement("p", {
    className: "jr-archive-excerpt"
  }, jrTruncate(e.excerpt, 140)), /*#__PURE__*/React.createElement("div", {
    className: "jr-archive-foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono jr-archive-author"
  }, e.author), /*#__PURE__*/React.createElement("span", {
    className: "jr-archive-arrow"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))))))))), /*#__PURE__*/React.createElement("section", {
    className: "glass glass-iridescent jr-cta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-cta-glow",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "jr-cta-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono jr-cta-eyebrow"
  }, "DETR\xC1S DE CADA TEXTO HAY UNA PIEZA"), /*#__PURE__*/React.createElement("h3", {
    className: "jr-cta-title"
  }, "Cu\xE9ntanos qu\xE9 te ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "inspira")), /*#__PURE__*/React.createElement("p", {
    className: "jr-cta-lead"
  }, "Si una entrada te movi\xF3, escr\xEDbenos. Nuestras mejores piezas nacen de conversaciones que empiezan as\xED."), /*#__PURE__*/React.createElement("div", {
    className: "jr-cta-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => navigate('contacto')
  }, "Hablemos"), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua",
    onClick: () => navigate('catalogo')
  }, "Ver colecciones")))));
}

// ════════════════════════════════════════════════════════════════════
// ENTRADA — mirror of js/pages/entrada.js (single journal post)
// ════════════════════════════════════════════════════════════════════
function EntradaScreen({
  entrySlug,
  navigate,
  openEntrada
}) {
  const entry = JOURNAL.find(e => e.slug === entrySlug);
  const [copied, setCopied] = React.useState(false);
  const openE = slug => openEntrada ? openEntrada(slug) : navigate('journal');
  if (!entry) {
    return /*#__PURE__*/React.createElement("div", {
      className: "container en-page"
    }, /*#__PURE__*/React.createElement("nav", {
      className: "en-breadcrumb"
    }, /*#__PURE__*/React.createElement("a", {
      className: "en-crumb",
      onClick: () => navigate('home')
    }, "Inicio"), /*#__PURE__*/React.createElement("span", {
      className: "en-crumb-sep",
      "aria-hidden": "true"
    }, "\u2192"), /*#__PURE__*/React.createElement("a", {
      className: "en-crumb",
      onClick: () => navigate('journal')
    }, "Journal")), /*#__PURE__*/React.createElement("div", {
      className: "glass en-notfound"
    }, /*#__PURE__*/React.createElement("div", {
      className: "en-notfound-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "56",
      height: "56",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.2"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "8",
      x2: "12",
      y2: "13"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "16",
      x2: "12.01",
      y2: "16"
    }))), /*#__PURE__*/React.createElement("h1", {
      className: "en-notfound-title"
    }, "Esta entrada se mud\xF3 del archivo"), /*#__PURE__*/React.createElement("p", {
      className: "en-notfound-sub"
    }, "Quiz\xE1 la retiramos o el enlace cambi\xF3. Explora el resto del Journal."), /*#__PURE__*/React.createElement("button", {
      className: "btn-aqua btn-aqua-emerald",
      onClick: () => navigate('journal')
    }, "Ver todas las entradas")));
  }
  const body = entry.body || entry.excerpt;
  const paragraphs = String(body).split(/\n\s*\n/).filter(Boolean);
  const related = JOURNAL.filter(e => e.slug !== entry.slug && e.section === entry.section).slice(0, 3);
  while (related.length < 3) {
    const filler = JOURNAL.find(e => e.slug !== entry.slug && !related.includes(e));
    if (!filler) break;
    related.push(filler);
  }
  const copy = () => {
    const url = `https://bersagliojewelry.co/entrada.html?e=${encodeURIComponent(entry.slug)}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "container en-page"
  }, /*#__PURE__*/React.createElement("nav", {
    className: "en-breadcrumb",
    "aria-label": "Migas de pan"
  }, /*#__PURE__*/React.createElement("a", {
    className: "en-crumb",
    onClick: () => navigate('home')
  }, "Inicio"), /*#__PURE__*/React.createElement("span", {
    className: "en-crumb-sep",
    "aria-hidden": "true"
  }, "\u2192"), /*#__PURE__*/React.createElement("a", {
    className: "en-crumb",
    onClick: () => navigate('journal')
  }, "Journal"), /*#__PURE__*/React.createElement("span", {
    className: "en-crumb-sep",
    "aria-hidden": "true"
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    className: "en-crumb en-crumb-current"
  }, entry.section)), /*#__PURE__*/React.createElement("header", {
    className: "en-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "en-hero-flags"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono en-flag-section"
  }, entry.section.toUpperCase()), /*#__PURE__*/React.createElement("span", {
    className: "en-flag-divider"
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono en-flag-kicker"
  }, entry.kicker)), /*#__PURE__*/React.createElement("h1", {
    className: "en-title"
  }, entry.title), /*#__PURE__*/React.createElement("div", {
    className: "en-hero-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "en-hero-author-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "en-hero-avatar"
  }, jrAuthorInitials(entry.author)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "en-hero-author"
  }, entry.author), /*#__PURE__*/React.createElement("div", {
    className: "mono en-hero-role"
  }, entry.authorRole || ''))), /*#__PURE__*/React.createElement("div", {
    className: "en-hero-meta-right"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono en-hero-date"
  }, entry.dateLong || entry.date), /*#__PURE__*/React.createElement("span", {
    className: "en-hero-meta-divider"
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono en-hero-read"
  }, entry.read, " de lectura")))), /*#__PURE__*/React.createElement("figure", {
    className: "glass glass-iridescent en-featured"
  }, /*#__PURE__*/React.createElement("img", {
    src: entry.img,
    alt: entry.title,
    className: "en-featured-img",
    loading: "eager",
    decoding: "async"
  })), /*#__PURE__*/React.createElement("div", {
    className: "en-layout"
  }, /*#__PURE__*/React.createElement("article", {
    className: "en-body"
  }, paragraphs.map((p, i) => i === 0 ? /*#__PURE__*/React.createElement("p", {
    key: i,
    className: "en-body-p en-body-p--lede"
  }, /*#__PURE__*/React.createElement("span", {
    className: "en-dropcap"
  }, p.charAt(0)), p.slice(1)) : /*#__PURE__*/React.createElement("p", {
    key: i,
    className: "en-body-p"
  }, p))), /*#__PURE__*/React.createElement("aside", {
    className: "en-share",
    "aria-label": "Compartir entrada"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono en-share-label"
  }, "COMPARTIR"), /*#__PURE__*/React.createElement("div", {
    className: "en-share-btns"
  }, /*#__PURE__*/React.createElement("a", {
    className: "en-share-btn",
    href: `https://wa.me/?text=${encodeURIComponent(entry.title)}%20${encodeURIComponent('https://bersagliojewelry.co/entrada.html?e=' + entry.slug)}`,
    target: "_blank",
    rel: "noopener",
    "aria-label": "Compartir por WhatsApp"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20.5 3.5A11 11 0 0 0 3.4 17l-1.4 5.1 5.2-1.4A11 11 0 1 0 20.5 3.5zM12 20c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3.1-.2-.3C4.4 14.9 4 13.5 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8z"
  }))), /*#__PURE__*/React.createElement("a", {
    className: "en-share-btn",
    href: `mailto:?subject=${encodeURIComponent(entry.title)}&body=${encodeURIComponent('https://bersagliojewelry.co/entrada.html?e=' + entry.slug)}`,
    "aria-label": "Enviar por correo"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "22,6 12,13 2,6"
  }))), /*#__PURE__*/React.createElement("button", {
    className: "en-share-btn",
    type: "button",
    onClick: copy,
    "aria-label": "Copiar enlace"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "9",
    y: "9",
    width: "13",
    height: "13",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
  }))), /*#__PURE__*/React.createElement("span", {
    className: "en-share-feedback"
  }, copied ? '✓ Enlace copiado' : '')))), related.length > 0 && /*#__PURE__*/React.createElement("section", {
    className: "en-related"
  }, /*#__PURE__*/React.createElement("div", {
    className: "en-related-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono en-related-eyebrow"
  }, "SEGUIR LEYENDO"), /*#__PURE__*/React.createElement("h2", {
    className: "en-related-title"
  }, "M\xE1s de ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, entry.section))), /*#__PURE__*/React.createElement("div", {
    className: "en-related-grid"
  }, related.map(r => /*#__PURE__*/React.createElement("article", {
    key: r.slug,
    className: "glass en-related-card"
  }, /*#__PURE__*/React.createElement("a", {
    className: "en-related-link",
    onClick: () => openE(r.slug)
  }, /*#__PURE__*/React.createElement("div", {
    className: "en-related-imgwrap"
  }, /*#__PURE__*/React.createElement("img", {
    src: r.img,
    alt: r.title,
    className: "en-related-img",
    loading: "lazy",
    decoding: "async"
  })), /*#__PURE__*/React.createElement("div", {
    className: "en-related-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono en-related-meta"
  }, /*#__PURE__*/React.createElement("span", null, r.section), /*#__PURE__*/React.createElement("span", {
    className: "en-related-meta-dot"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, r.read)), /*#__PURE__*/React.createElement("h3", {
    className: "en-related-headline"
  }, r.title))))))), /*#__PURE__*/React.createElement("div", {
    className: "en-back"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua en-back-btn",
    onClick: () => navigate('journal')
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M19 12H5M12 5l-7 7 7 7"
  })), "Volver al Journal")));
}

// ════════════════════════════════════════════════════════════════════
// LISTA DE DESEOS — mirror of js/pages/lista-deseos.js (.wl-* classes)
// ════════════════════════════════════════════════════════════════════
function ListaDeseosScreen({
  wishlist: wl,
  items,
  onToggleWish,
  onAddCart,
  onClear,
  navigate
}) {
  const rows = wl.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  const shareURL = (() => {
    const lines = rows.map(p => `• ${p.name}\n  https://bersagliojewelry.co/pieza.html?p=${p.slug || p.id}`);
    const msg = `Hola Bersaglio, me interesan estas piezas de mi lista:\n\n${lines.join('\n\n')}`;
    return `https://wa.me/573013752592?text=${encodeURIComponent(msg)}`;
  })();
  return /*#__PURE__*/React.createElement("div", {
    className: "container wl-page"
  }, /*#__PURE__*/React.createElement("section", {
    className: "wl-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow wl-hero-eyebrow"
  }, "Tus favoritas \xB7 ", rows.length), /*#__PURE__*/React.createElement("h1", {
    className: "wl-hero-title"
  }, "Lista de ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "deseos")), /*#__PURE__*/React.createElement("p", {
    className: "wl-hero-lead"
  }, "Las piezas que te detuvieron. Vuelve cuando quieras, comparte con quien quieras, agrega al carrito cuando est\xE9s lista.")), rows.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "wl-empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wl-empty-icon",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "64",
    height: "64",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
  }))), /*#__PURE__*/React.createElement("h2", {
    className: "wl-empty-title"
  }, "Tu lista est\xE1 vac\xEDa"), /*#__PURE__*/React.createElement("p", {
    className: "wl-empty-sub"
  }, "Guarda piezas que te inspiren tocando el coraz\xF3n en cualquier ficha."), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => navigate('catalogo')
  }, "Explorar el cat\xE1logo")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "wl-grid"
  }, rows.map(p => {
    const inCart = items.some(i => i.id === p.id);
    return /*#__PURE__*/React.createElement("article", {
      key: p.id,
      className: "glass glass-iridescent wl-card"
    }, /*#__PURE__*/React.createElement("a", {
      className: "wl-card-imglink"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wl-card-img",
      style: {
        background: `url('${p.img}') center/cover`
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "wl-card-vignette",
      "aria-hidden": "true"
    })), /*#__PURE__*/React.createElement("div", {
      className: "wl-card-body"
    }, /*#__PURE__*/React.createElement("a", {
      className: "wl-card-name"
    }, p.name), /*#__PURE__*/React.createElement("div", {
      className: "mono wl-card-price"
    }, fmt$(p.price)), /*#__PURE__*/React.createElement("div", {
      className: "wl-card-actions"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: 'wl-card-cart' + (inCart ? ' is-in-cart' : ''),
      onClick: () => onAddCart(p)
    }, inCart ? 'En carrito' : 'Al carrito'), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "wl-card-remove",
      "aria-label": "Quitar de favoritos",
      onClick: () => onToggleWish(p.id)
    }, "Quitar"))));
  })), /*#__PURE__*/React.createElement("div", {
    className: "wl-actions"
  }, /*#__PURE__*/React.createElement("a", {
    href: shareURL,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "btn-aqua btn-aqua-emerald wl-share-btn"
  }, "Consultar lista por WhatsApp", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  }))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-aqua wl-clear-btn",
    onClick: () => {
      if (confirm('¿Vaciar toda la lista de deseos?')) onClear();
    }
  }, "Vaciar la lista"))));
}

// ════════════════════════════════════════════════════════════════════
// GRACIAS — mirror of js/pages/gracias.js (confirmation, .lg-page--gracias)
// ════════════════════════════════════════════════════════════════════
const GR_MESSAGES = {
  transferencia: {
    eyebrow: 'TRANSFERENCIA BANCARIA',
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Una elecci\xF3n excepcional. Iniciamos la creaci\xF3n de tu ", /*#__PURE__*/React.createElement("span", {
      className: "italic emerald-text"
    }, "pieza"), "."),
    body: 'En las próximas horas te enviaremos el detalle y la confirmación de tu encargo por correo privado. Al confirmarse la transferencia bancaria, nuestro atelier dará inicio a la confección y coordinaremos el envío asegurado.',
    nextLabel: 'Bitácora enviada en menos de 24 horas hábiles'
  },
  asesor: {
    eyebrow: 'ASESOR PRIVADO',
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Un encuentro en la distancia. Te ", /*#__PURE__*/React.createElement("span", {
      className: "italic emerald-text"
    }, "llamamos"), " pronto."),
    body: 'Kary Mendoza o un gemólogo del atelier se comunicará contigo de forma confidencial en menos de cuatro horas. Compartiremos referencias, responderemos tus dudas y agendaremos, si lo deseas, una videollamada o cita presencial.',
    nextLabel: 'Contacto en menos de 4 horas hábiles'
  },
  visita: {
    eyebrow: 'CITA PRIVADA CONCERTADA',
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Cartagena de Indias te espera. El caf\xE9 ", /*#__PURE__*/React.createElement("span", {
      className: "italic emerald-text"
    }, "estar\xE1 listo"), "."),
    body: 'Confirmaremos tu cita privada de forma directa. El atelier estará cerrado exclusivamente para ti; Kary Mendoza te recibirá personalmente en Casa San Agustín.',
    nextLabel: 'Confirmación directa en pocas horas'
  },
  llamada: {
    eyebrow: 'LLAMADA CONFIDENCIAL RESERVADA',
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Conversaci\xF3n de ", /*#__PURE__*/React.createElement("span", {
      className: "italic emerald-text"
    }, "intenci\xF3n"), "."),
    body: 'Nos comunicaremos en el horario solicitado para iniciar un diálogo pausado. Si prefieres reprogramar por WhatsApp o cambiar de vía de contacto, estamos enteramente a tu disposición.',
    nextLabel: 'Te llamamos en el horario solicitado'
  },
  mensaje: {
    eyebrow: 'CONFIDENCIA RECIBIDA',
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Agradecemos tu confianza. Te ", /*#__PURE__*/React.createElement("span", {
      className: "italic emerald-text"
    }, "respondemos"), " en persona."),
    body: 'Tu mensaje es atendido de forma confidencial y directa por Kary Mendoza o un especialista del atelier. Prescindimos de asistentes virtuales; valoramos el tiempo y el trato humano.',
    nextLabel: 'Respuesta en menos de 24 horas hábiles'
  },
  default: {
    eyebrow: 'CORTESÍA BERSAGLIO',
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Te ", /*#__PURE__*/React.createElement("span", {
      className: "italic emerald-text"
    }, "escribimos"), " de manera directa."),
    body: 'Hemos recibido tu solicitud. Un gemólogo de nuestro atelier se pondrá en contacto contigo a la brevedad. Mientras tanto, te invitamos a explorar el catálogo o leer el Journal.',
    nextLabel: 'Contacto en menos de 24 horas hábiles'
  }
};
function GraciasScreen({
  method = 'default',
  navigate
}) {
  const msg = GR_MESSAGES[method] || GR_MESSAGES.default;
  return /*#__PURE__*/React.createElement("div", {
    className: "container lg-page lg-page--gracias"
  }, /*#__PURE__*/React.createElement("section", {
    className: "lg-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg-check",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "40",
    height: "40",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "2.5"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6L9 17l-5-5"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mono lg-eyebrow"
  }, msg.eyebrow), /*#__PURE__*/React.createElement("h1", {
    className: "lg-title"
  }, msg.title), /*#__PURE__*/React.createElement("p", {
    className: "lg-body"
  }, msg.body), /*#__PURE__*/React.createElement("div", {
    className: "lg-pill",
    "aria-label": "Tiempo estimado"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lg-pill-dot"
  }), msg.nextLabel), /*#__PURE__*/React.createElement("div", {
    className: "lg-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => navigate('catalogo')
  }, "Ver colecciones"), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua",
    onClick: () => navigate('journal')
  }, "Leer el Journal"))));
}

// ════════════════════════════════════════════════════════════════════
// LEGAL — shared layout for Términos & Privacidad (mirror of legal.css .lg-*)
// ════════════════════════════════════════════════════════════════════
function LegalScreen({
  eyebrow,
  title,
  sub,
  sections,
  lastUpdate,
  foot,
  navigate
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "container lg-page"
  }, /*#__PURE__*/React.createElement("header", {
    className: "lg-pagehero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono lg-eyebrow"
  }, "DOCUMENTACI\xD3N LEGAL"), /*#__PURE__*/React.createElement("h1", {
    className: "lg-pagehero-title"
  }, eyebrow, " ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, title)), /*#__PURE__*/React.createElement("p", {
    className: "lg-pagehero-sub"
  }, sub), /*#__PURE__*/React.createElement("div", {
    className: "mono lg-update"
  }, "\xDAltima actualizaci\xF3n \xB7 ", lastUpdate)), /*#__PURE__*/React.createElement("div", {
    className: "lg-layout"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "lg-toc",
    "aria-label": "Tabla de contenidos"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono lg-toc-eyebrow"
  }, "EN ESTA P\xC1GINA"), /*#__PURE__*/React.createElement("ol", {
    className: "lg-toc-list"
  }, sections.map(s => /*#__PURE__*/React.createElement("li", {
    key: s.id
  }, /*#__PURE__*/React.createElement("a", {
    className: "lg-toc-link",
    href: `#${s.id}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono lg-toc-num"
  }, s.n), s.title))))), /*#__PURE__*/React.createElement("article", {
    className: "lg-prose"
  }, sections.map(s => {
    const paragraphs = String(s.body).split(/\n\s*\n/).filter(Boolean);
    return /*#__PURE__*/React.createElement("section", {
      key: s.id,
      id: s.id,
      className: "lg-section"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lg-section-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono lg-section-num"
    }, s.n), /*#__PURE__*/React.createElement("h2", {
      className: "lg-section-title"
    }, s.title)), /*#__PURE__*/React.createElement("div", {
      className: "lg-section-body"
    }, paragraphs.map((p, i) => /*#__PURE__*/React.createElement("p", {
      key: i
    }, p))));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "lg-foot"
  }, /*#__PURE__*/React.createElement("p", null, foot), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua lg-back-btn",
    onClick: () => navigate('home')
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M19 12H5M12 5l-7 7 7 7"
  })), "Volver al inicio")));
}
const TERMINOS_SECTIONS = [{
  id: 'objeto',
  n: '01',
  title: 'Objeto',
  body: `Estos términos regulan la relación entre Bersaglio Jewelry (en adelante, "el Atelier") y la persona que adquiere productos o servicios a través del sitio web bersagliojewelry.co, del atelier físico en Cartagena de Indias o de cualquier canal directo (WhatsApp, correo electrónico, llamada telefónica).\n\nAl usar el sitio o iniciar una compra, aceptas estos términos en su totalidad. Si no estás de acuerdo, te pedimos cerrar la pestaña y no proceder.`
}, {
  id: 'productos',
  n: '02',
  title: 'Productos y precios',
  body: `Cada pieza Bersaglio es única o producida en series muy limitadas. Las fotografías son fieles; sin embargo, debido a variaciones de luz, calibración de pantalla y la naturaleza misma de las gemas naturales, el color real puede presentar diferencias mínimas respecto a la imagen.\n\nLos precios se expresan en pesos colombianos (COP) y ya incluyen el IVA del 19%. Los envíos internacionales pueden generar aranceles y trámites aduaneros del país destino que corren por cuenta del comprador. Los precios pueden variar sin previo aviso, pero una vez confirmada una compra el precio queda bloqueado.`
}, {
  id: 'cierre-compra',
  n: '03',
  title: 'Cierre de compra',
  body: `Por la naturaleza de alta gama de cada pieza, todas las compras se cierran en conversación con un asesor: WhatsApp, correo, llamada o visita al atelier. No procesamos pagos automáticos directos en el sitio web.\n\nMétodos de pago aceptados: transferencia bancaria (Bancolombia, Davivienda), tarjetas Visa/Mastercard procesadas presencial o vía link de pago, financiación hasta 12 meses con entidades aliadas para piezas superiores a $50.000.000 COP.`
}, {
  id: 'envios',
  n: '04',
  title: 'Envíos',
  body: `Despachos nacionales (Colombia): envío gratuito con seguro pleno por Servientrega Premium, 2-5 días hábiles dependiendo de la ciudad.\n\nDespachos internacionales: DHL Express o FedEx Priority con seguro declarado por el valor total de la pieza, 5-8 días hábiles, entrega registrada con firma. Aranceles e impuestos del país destino son responsabilidad del comprador.\n\nCada pieza viaja en estuche de presentación Bersaglio, con libreta de origen (mina de la gema, oficio del orfebre, certificación GIA si aplica) y certificado de garantía de por vida.`
}, {
  id: 'garantia',
  n: '05',
  title: 'Garantía',
  body: `Toda pieza Bersaglio cuenta con garantía de por vida en estructura y engaste. Esto incluye: reparación gratuita si una piedra se afloja, restauración si una soldadura cede, redimensionado de anillos hasta dos tallas arriba/abajo (un servicio por pieza), limpieza profesional y pulido (un servicio anual sin costo).\n\nLa garantía no cubre: daño por golpe directo (caída sobre piedra), exposición prolongada a químicos abrasivos (cloro, ammonia, blanqueador), modificación realizada por terceros ajenos al Atelier, robo o pérdida.`
}, {
  id: 'devoluciones',
  n: '06',
  title: 'Devoluciones y cambios',
  body: `Piezas a medida: por su naturaleza única, las piezas diseñadas a medida no admiten devolución. Sí admitimos cambios en boceto y prototipo de cera previo a la fundición, sin costo adicional, hasta tres iteraciones.\n\nPiezas de catálogo: aceptamos cambio (no reembolso en efectivo) dentro de los 15 días hábiles siguientes a la entrega, siempre que la pieza llegue en condiciones impecables, con estuche, libreta y certificado. El cliente cubre el costo de envío del cambio.`
}, {
  id: 'propiedad',
  n: '07',
  title: 'Propiedad intelectual',
  body: `Todas las imágenes, textos, diseños y videos publicados en bersagliojewelry.co son propiedad de Bersaglio Jewelry o se usan bajo licencia. Está prohibida su reproducción total o parcial sin autorización expresa por escrito.\n\nLos diseños de joyas Bersaglio están protegidos por derecho de autor. Está prohibida la reproducción industrial o artesanal de las piezas, incluyendo aquellas hechas a medida para clientes específicos.`
}, {
  id: 'modificaciones',
  n: '08',
  title: 'Modificaciones',
  body: `Podemos actualizar estos términos en cualquier momento. La versión vigente es siempre la publicada en esta página, con la fecha de última actualización al inicio. Te recomendamos revisarlos periódicamente.`
}, {
  id: 'jurisdiccion',
  n: '09',
  title: 'Ley aplicable y jurisdicción',
  body: `Estos términos se rigen por la ley colombiana. Cualquier controversia se someterá a los tribunales competentes de Cartagena de Indias, salvo cuando la ley de protección al consumidor disponga otra cosa.`
}];
const PRIVACIDAD_SECTIONS = [{
  id: 'compromiso',
  n: '01',
  title: 'Nuestro compromiso',
  body: `Bersaglio Jewelry trata tus datos personales con el mismo cuidado con el que tratamos una esmeralda Muzo Vieja: con paciencia, con discreción, y con la certeza de que cada decisión sobre tu información debe pasar primero por la pregunta "¿esto es necesario para servirte mejor?".\n\nEsta política explica qué datos recolectamos, por qué, cómo los protegemos y qué derechos tienes sobre ellos.`
}, {
  id: 'responsable',
  n: '02',
  title: 'Responsable del tratamiento',
  body: `Bersaglio Jewelry S.A.S., NIT en proceso de actualización, con domicilio en Calle 36 # 6-32, San Agustín Chiquita, Centro Histórico, Cartagena de Indias, Bolívar, Colombia.\n\nContacto del responsable: info@bersagliojewelry.co · WhatsApp +57 301 375 2592.`
}, {
  id: 'datos-recolectados',
  n: '03',
  title: 'Datos que recolectamos',
  body: `Datos de contacto: nombre, apellido, correo electrónico, número de teléfono o WhatsApp, dirección postal.\n\nDatos de pedido: piezas que has consultado o adquirido, métodos de pago utilizados (procesados por terceros, nunca almacenamos números de tarjeta), historial de conversaciones por WhatsApp o correo.\n\nDatos de navegación: páginas visitadas en bersagliojewelry.co, tiempo en cada página, dispositivo y navegador usados, IP aproximada (recolectados vía cookies y Google Analytics si has aceptado el consentimiento de cookies).\n\nDatos opcionales: cualquier información adicional que decidas compartir al contactarnos (presupuesto orientativo, ocasión, gemas de tu interés, gemas heredadas que quieras integrar).`
}, {
  id: 'finalidad',
  n: '04',
  title: 'Finalidad del tratamiento',
  body: `Atender tus solicitudes de información, asesoría o compra. Procesar pedidos y coordinar envíos. Enviarte el newsletter mensual del Atelier si te has suscrito (con derecho a cancelar en cualquier momento desde el enlace en cada correo).\n\nMejorar nuestro servicio: analizamos datos agregados de navegación para entender qué piezas atraen más interés, qué páginas se leen más, qué dudas suelen surgir. Nunca usamos datos individuales para perfilamiento publicitario.`
}, {
  id: 'compartir',
  n: '05',
  title: 'Con quién compartimos tus datos',
  body: `Nunca vendemos ni cedemos tus datos a terceros con fines comerciales.\n\nCompartimos información estrictamente necesaria con: empresas de mensajería (DHL, FedEx, Servientrega) para coordinar envíos; pasarelas de pago (Wompi, link de pago bancario) cuando realizas una compra; servicios técnicos (Firebase de Google, Brevo para correo transaccional) que alojan o procesan datos bajo acuerdos de confidencialidad y conformidad con regulación de protección de datos.\n\nEn el caso de autoridades judiciales o regulatorias, cumpliremos con cualquier solicitud formal y debidamente notificada por estos canales.`
}, {
  id: 'derechos',
  n: '06',
  title: 'Tus derechos',
  body: `Tienes derecho a conocer, actualizar, rectificar y suprimir tus datos personales en cualquier momento. Para ejercer estos derechos, escribe a info@bersagliojewelry.co con asunto "Datos personales" y te responderemos en máximo 10 días hábiles.\n\nTambién puedes solicitar una copia de toda la información que tenemos sobre ti, oponerte al uso de cookies analíticas, o revocar tu suscripción al newsletter desde cualquier correo que recibas. Ningún ejercicio de derechos afecta el servicio que prestamos.`
}, {
  id: 'cookies',
  n: '07',
  title: 'Cookies',
  body: `Usamos cookies estrictamente necesarias (para que el sitio funcione, recordar tu carrito y lista de deseos) y cookies analíticas opcionales (Google Analytics) que solo se activan tras tu consentimiento explícito en el banner.\n\nPuedes rechazar las cookies opcionales sin afectar tu experiencia. El banner aparece en tu primera visita; tu decisión queda guardada localmente en tu navegador.`
}, {
  id: 'seguridad',
  n: '08',
  title: 'Seguridad',
  body: `Todos los datos viajan cifrados (HTTPS / TLS 1.3) y se almacenan en infraestructura de Google Cloud con cifrado en reposo. Los accesos al panel administrativo requieren autenticación multifactor.\n\nNunca almacenamos números completos de tarjetas de crédito; las pasarelas de pago manejan esa información bajo certificación PCI-DSS.`
}, {
  id: 'menores',
  n: '09',
  title: 'Menores de edad',
  body: `Nuestros servicios están dirigidos a personas mayores de 18 años. No recolectamos conscientemente datos de menores de edad. Si detectamos información de un menor, la eliminamos de inmediato.`
}, {
  id: 'cambios',
  n: '10',
  title: 'Cambios a esta política',
  body: `Podemos actualizar esta política para reflejar cambios legales, técnicos o de negocio. La versión vigente es siempre la publicada en esta página, con la fecha de última actualización al inicio. Si hacemos un cambio sustantivo (por ejemplo, agregar un nuevo destinatario de datos), te avisaremos por correo electrónico si te has suscrito.`
}];
function TerminosScreen({
  navigate
}) {
  return /*#__PURE__*/React.createElement(LegalScreen, {
    eyebrow: "T\xE9rminos y",
    title: "condiciones",
    sub: "C\xF3mo funcionan las compras, los env\xEDos, la garant\xEDa y los cambios en Bersaglio Jewelry. Texto plano, sin trampas.",
    sections: TERMINOS_SECTIONS,
    lastUpdate: "2026-04-12",
    foot: /*#__PURE__*/React.createElement(React.Fragment, null, "\xBFUna duda espec\xEDfica? Escr\xEDbenos a ", /*#__PURE__*/React.createElement("a", {
      href: "mailto:info@bersagliojewelry.co"
    }, "info@bersagliojewelry.co"), " o por ", /*#__PURE__*/React.createElement("a", {
      href: "https://wa.me/573013752592",
      target: "_blank",
      rel: "noopener"
    }, "WhatsApp"), "."),
    navigate: navigate
  });
}
function PrivacidadScreen({
  navigate
}) {
  return /*#__PURE__*/React.createElement(LegalScreen, {
    eyebrow: "Pol\xEDtica de",
    title: "privacidad",
    sub: "C\xF3mo cuidamos tu informaci\xF3n personal. Sin tecnicismos innecesarios. Sin trampas.",
    sections: PRIVACIDAD_SECTIONS,
    lastUpdate: "2026-04-12",
    foot: /*#__PURE__*/React.createElement(React.Fragment, null, "\xBFQuieres ejercer un derecho sobre tus datos? Escr\xEDbenos a ", /*#__PURE__*/React.createElement("a", {
      href: "mailto:info@bersagliojewelry.co"
    }, "info@bersagliojewelry.co"), "."),
    navigate: navigate
  });
}
Object.assign(window, {
  NosotrosScreen,
  ContactoScreen,
  CarritoScreen,
  JournalScreen,
  EntradaScreen,
  ListaDeseosScreen,
  GraciasScreen,
  TerminosScreen,
  PrivacidadScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_bersaglio_redesign/components/Pages.jsx", error: String((e && e.message) || e) }); }

// design_handoff_bersaglio_redesign/components/Screens.jsx
try { (() => {
/* global React, CATEGORIES, PRODUCTS, MARQUEE, SERVICES, fmt$,
   BersaglioLogo, IconArrow, IconHeart, IconPin, IconShield, IconCheck, ServiceIcon */
// Bersaglio storefront — Home, Catalog and Product-detail screens.

const Diamond = () => /*#__PURE__*/React.createElement("span", {
  className: "dia",
  style: {
    display: 'inline-flex',
    alignItems: 'center'
  }
}, /*#__PURE__*/React.createElement("svg", {
  width: "6",
  height: "6",
  viewBox: "0 0 10 10"
}, /*#__PURE__*/React.createElement("rect", {
  x: "2.5",
  y: "2.5",
  width: "5",
  height: "5",
  transform: "rotate(45 5 5)",
  fill: "currentColor"
})));

// Count-up that fires when scrolled into view (scroll-based; IO is unreliable in preview)
function CountUp({
  to,
  suffix = '',
  dur = 1400
}) {
  const [n, setN] = React.useState(0);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let id, anim;
    const animate = () => {
      const steps = Math.max(1, Math.round(dur / 16));
      let i = 0;
      anim = setInterval(() => {
        i++;
        const p = Math.min(1, i / steps);
        setN(Math.round((1 - Math.pow(1 - p, 3)) * to));
        if (p >= 1) clearInterval(anim);
      }, 16);
    };
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
        animate();
        return;
      }
      id = setTimeout(check, 120);
    };
    id = setTimeout(check, 60);
    return () => {
      clearTimeout(id);
      clearInterval(anim);
    };
  }, [to]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref
  }, n, suffix);
}

// Scroll-reveal driven by React state so it survives re-renders (className stays applied)
function useReveal(delay = 0) {
  const ref = React.useRef(null);
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el) return;
    let id;
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > -40) {
        setShown(true);
        return;
      }
      id = setTimeout(check, 120);
    };
    id = setTimeout(check, 60);
    return () => clearTimeout(id);
  }, [shown]);
  return [ref, 'reveal' + (shown ? ' in' : ''), {
    '--d': delay + 'ms'
  }];
}

// One animated category tile
function CatTile({
  c,
  i,
  navigate
}) {
  const [ref, cls, st] = useReveal(i * 70);
  return /*#__PURE__*/React.createElement("a", {
    ref: ref,
    className: 'glass k-cat ' + cls,
    style: st,
    onClick: () => navigate('catalogo')
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-cat-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-cat-img",
    style: {
      backgroundImage: `url(${c.img})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "k-cat-shade"
  }), /*#__PURE__*/React.createElement("div", {
    className: "k-cat-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-cat-name"
  }, c.name), /*#__PURE__*/React.createElement("div", {
    className: "mono k-cat-count"
  }, "Ver piezas"))));
}

// One animated service card
function ServiceCard({
  s,
  i
}) {
  const [ref, cls, st] = useReveal(i * 80);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: 'glass ' + cls,
    style: {
      padding: '26px 22px',
      borderRadius: 28,
      textAlign: 'center',
      ...st
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60,
      height: 60,
      margin: '0 auto 16px',
      borderRadius: '50%',
      background: 'radial-gradient(circle at 30% 30%, oklch(95% 0.08 150), oklch(65% 0.17 155) 70%)',
      boxShadow: 'inset 0 2px 0 oklch(100% 0 0 / 0.9), 0 8px 24px -4px oklch(50% 0.15 155 / 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement(ServiceIcon, {
    name: s.icon,
    size: 22,
    sw: 1.6
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 19,
      fontWeight: 500,
      color: 'var(--bj-ink-emerald)',
      marginBottom: 8
    }
  }, s.t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--bj-ink-soft)',
      lineHeight: 1.6
    }
  }, s.d));
}

// ════════════════════════════════════════════════════════════════════
// HOME — mirror of js/pages/home.js (9 sections, .home-* / .at-* / .hj-* classes)
// ════════════════════════════════════════════════════════════════════
const HOME_MARQUEE = ['Oro 18K · Ley 750', 'Esmeraldas Colombianas', 'Asesoría Personalizada', 'Garantía Vitalicia', 'Atelier en Cartagena', 'Envío Asegurado Mundial', 'Una pieza, una historia'];
const HOME_CATEGORIES = [{
  name: 'Anillos',
  slug: 'anillos',
  img: '../../assets/ring-sapphire.webp',
  hue: 200,
  pos: 'center'
}, {
  name: 'Topos',
  slug: 'topos-aretes',
  img: '../../assets/earrings-travertino.webp',
  hue: 30,
  pos: 'center'
}, {
  name: 'Argollas',
  slug: 'argollas',
  img: '../../assets/earrings-emerald.webp',
  hue: 155,
  pos: 'center'
}, {
  name: 'Dijes',
  slug: 'dijes-colgantes',
  img: '../../assets/model-emerald.webp',
  hue: 155,
  pos: 'center top'
}, {
  name: 'Pulseras',
  slug: 'pulseras',
  img: '../../assets/banner-hero.webp',
  hue: 90,
  pos: 'center'
}, {
  name: 'Editorial',
  slug: 'editorial',
  img: '../../assets/model-emerald.webp',
  hue: 155,
  pos: 'center'
}];
const HOME_SERVICES = [{
  t: 'Diseño a medida',
  d: 'Crea la pieza de tus sueños con nuestro atelier. Desde boceto hasta entrega.',
  icon: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m12 19 7-7 3 3-7 7-3-3z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m2 2 7.586 7.586"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "2"
  }))
}, {
  t: 'Asesoría privada',
  d: 'Consulta 1:1 con nuestros gemólogos. Virtual o en nuestra casa en Cartagena.',
  icon: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "7",
    r: "4"
  }))
}, {
  t: 'Certificación GIA',
  d: 'Cada pieza con diamante incluye certificado del Gemological Institute.',
  icon: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 12 2 2 4-4"
  }))
}, {
  t: 'Garantía vitalicia',
  d: 'Mantenimiento, pulido y verificación de piedras de por vida.',
  icon: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 12 2 2 4-4"
  }))
}];
const HOME_ATELIER_STEPS = [{
  n: '01',
  t: 'El Diseño y Concepto',
  d: 'Concebimos la joya desde el boceto inicial sobre papel, seleccionando metales nobles y gemas con carácter propio.',
  corner: 0
}, {
  n: '02',
  t: 'Asesoría Confidencial',
  d: 'Te acompañamos en cada etapa de la elección. Un diálogo íntimo y pausado para dar con la pieza exacta que refleje tu legado.',
  corner: 1
}, {
  n: '03',
  t: 'Garantía y Certificación',
  d: 'Respaldamos la autenticidad y excelencia de cada piedra con reportes internacionales de la GIA y origen de mina.',
  corner: 2
}, {
  n: '04',
  t: 'Custodia de por vida',
  d: 'Nuestras piezas nacen con vocación de eternidad. Ofrecemos mantenimiento, pulido y restauración vitalicia sin límites.',
  corner: 3
}];
function HomeScreen({
  navigate,
  openPieza,
  wishlist,
  toggleWish,
  openQuickView,
  openEntrada
}) {
  const featured = PRODUCTS.slice(0, 6);
  const tripled = [...HOME_MARQUEE, ...HOME_MARQUEE, ...HOME_MARQUEE];
  const cover = JOURNAL.find(e => e.featured) || JOURNAL[0];
  const rest = JOURNAL.filter(e => e !== cover);
  const journalSide = rest.slice(0, 4).map(e => ({
    sec: e.section,
    date: e.date,
    title: e.title,
    read: e.read,
    slug: e.slug
  }));
  const journalTrio = rest.slice(4, 7).map(t => ({
    sec: t.section,
    title: t.title,
    who: t.author,
    img: t.img,
    slug: t.slug
  }));
  const tickerDoubled = [...JOURNAL_TICKER, ...JOURNAL_TICKER];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    className: "home-hero",
    "data-hero": true
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    className: "home-hero-bg"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-hero-blob home-hero-blob--em"
  }), /*#__PURE__*/React.createElement("div", {
    className: "home-hero-blob home-hero-blob--gold"
  })), /*#__PURE__*/React.createElement("div", {
    className: "home-hero-stage"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-hero-frame"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-hero-banner",
    "data-tilt": true
  }, /*#__PURE__*/React.createElement("picture", {
    className: "home-hero-img",
    "data-tilt-img": true
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/banner-hero.webp",
    alt: "Atelier Bersaglio en Cartagena de Indias",
    fetchPriority: "high",
    decoding: "async",
    className: "home-hero-img-fallback"
  })), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    className: "home-hero-rim"
  }), /*#__PURE__*/React.createElement("div", {
    className: "home-hero-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-hero-locator-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono home-hero-locator"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "10",
    r: "2.5"
  })), "Cartagena de Indias \xB7 Colombia")), /*#__PURE__*/React.createElement("div", {
    className: "home-hero-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-hero-eyebrow-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "home-hero-eyebrow-line"
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono home-hero-eyebrow"
  }, "Alta Joyer\xEDa Personalizada y de Confianza")), /*#__PURE__*/React.createElement("h1", {
    className: "home-hero-headline"
  }, "El arte de escuchar tu historia,", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "home-hero-headline-italic"
  }, "tallado en una joya \xFAnica.")), /*#__PURE__*/React.createElement("p", {
    className: "home-hero-manifesto"
  }, "Nacimos visitando a nuestros clientes de puerta en puerta, cimentando una relaci\xF3n de cercan\xEDa y confianza duradera. En nuestro atelier privado del Centro Hist\xF3rico de Cartagena, no dise\xF1amos simples accesorios: nos tomamos el tiempo para asesorarte y dar vida a piezas irrepetibles de oro de 18 quilates y esmeraldas colombianas \xE9ticas. Una inversi\xF3n emocional y material destinada a custodiar tu esencia para siempre."), /*#__PURE__*/React.createElement("div", {
    className: "home-hero-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-hero",
    onClick: () => navigate('catalogo')
  }, /*#__PURE__*/React.createElement("span", {
    className: "btn-hero-bg",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: "btn-hero-shimmer",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: "btn-hero-label"
  }, "Descubrir la colecci\xF3n"), /*#__PURE__*/React.createElement("span", {
    className: "btn-hero-arrow",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  }))))))), /*#__PURE__*/React.createElement("div", {
    className: "home-hero-signature"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono home-hero-signature-eyebrow"
  }, "Una creaci\xF3n de"), /*#__PURE__*/React.createElement("span", {
    className: "home-hero-signature-line"
  }), /*#__PURE__*/React.createElement("span", {
    className: "home-hero-signature-name"
  }, "Kary Mendoza")))))), /*#__PURE__*/React.createElement("section", {
    className: "home-marquee"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-fade hm-fade--left",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hm-fade hm-fade--right",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hm-row"
  }, tripled.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "hm-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hm-text"
  }, t), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    className: "hm-sep"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hm-sep-line"
  }), /*#__PURE__*/React.createElement("svg", {
    width: "6",
    height: "6",
    viewBox: "0 0 10 10"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "2.5",
    y: "2.5",
    width: "5",
    height: "5",
    transform: "rotate(45 5 5)",
    fill: "currentColor"
  })), /*#__PURE__*/React.createElement("span", {
    className: "hm-sep-line"
  }))))))), /*#__PURE__*/React.createElement("section", {
    className: "home-cats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-cats-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Colecciones singulares"), /*#__PURE__*/React.createElement("h2", {
    className: "home-cats-title"
  }, "La refracci\xF3n del ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "alma verde")), /*#__PURE__*/React.createElement("p", {
    className: "home-cats-lead"
  }, "Nuestras colecciones son cap\xEDtulos de una historia compartida. Cada anillo, arete y dije es esculpido pacientemente en oro de 18K, rindiendo homenaje al fuego interno y la m\xEDstica de la esmeralda colombiana.")), /*#__PURE__*/React.createElement("div", {
    className: "cat-dock"
  }, HOME_CATEGORIES.map(c => {
    const count = PRODUCTS.filter(p => p.collection === c.slug).length;
    return /*#__PURE__*/React.createElement("a", {
      key: c.slug,
      className: "glass cat-tile",
      onClick: () => navigate('catalogo'),
      style: {
        '--cat-hue': c.hue
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "cat-tile-inner"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cat-tile-img",
      style: {
        background: `url('${c.img}') ${c.pos}/cover`
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "cat-tile-overlay"
    }), /*#__PURE__*/React.createElement("div", {
      className: "cat-tile-content"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cat-tile-name"
    }, c.name), /*#__PURE__*/React.createElement("div", {
      className: "mono cat-tile-count"
    }, count > 0 ? `${count} pieza${count === 1 ? '' : 's'}` : 'Próximamente'))));
  })))), /*#__PURE__*/React.createElement("section", {
    className: "home-featured"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-featured-header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Curadur\xEDa del Atelier"), /*#__PURE__*/React.createElement("h2", {
    className: "home-featured-title"
  }, "Piezas ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "singulares"))), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua home-featured-cta",
    onClick: () => navigate('catalogo')
  }, "Explorar el cat\xE1logo entero", /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "home-featured-grid"
  }, featured.map(p => {
    const tag = p.tag || (p.featured ? 'Destacada' : null);
    const stones = p.specs?.stones || p.specs?.stone || '';
    const metal = p.specs?.metal || p.specs?.gold || '';
    const col = COLLECTIONS.find(c => c.slug === p.collection);
    const wished = wishlist.includes(p.id);
    return /*#__PURE__*/React.createElement("a", {
      key: p.id,
      className: "glass glass-iridescent home-featured-card",
      onClick: () => openPieza(p.id)
    }, /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-imgwrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-img",
      style: {
        background: `url('${p.images?.[0] || p.img}') center/cover`
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-vignette",
      "aria-hidden": "true"
    }), tag && /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-tag"
    }, /*#__PURE__*/React.createElement("div", {
      className: "chip"
    }, /*#__PURE__*/React.createElement("span", {
      className: "chip-dot"
    }), tag)), /*#__PURE__*/React.createElement("button", {
      className: "home-featured-card-wishlist",
      "aria-label": "Guardar",
      onClick: e => {
        e.stopPropagation();
        toggleWish(p.id);
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: wished ? 'currentColor' : 'none',
      stroke: "currentColor",
      strokeWidth: "1.8"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-cat"
    }, col?.name || p.collection), /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-name"
    }, p.name), /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-meta"
    }, [stones, metal].filter(Boolean).join(' · ')), /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-foot"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mono home-featured-card-price"
    }, fmt$(p.price)), /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-arrow"
    }, "Ver pieza", /*#__PURE__*/React.createElement("svg", {
      width: "10",
      height: "10",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M5 12h14M13 5l7 7-7 7"
    }))))));
  })))), /*#__PURE__*/React.createElement("section", {
    className: "home-editorial"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-editorial-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent home-editorial-image"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-editorial-image-bg"
  }), /*#__PURE__*/React.createElement("div", {
    className: "home-editorial-image-shade"
  }), /*#__PURE__*/React.createElement("div", {
    className: "home-editorial-image-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chip home-editorial-chip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip-dot"
  }), "Editorial"), /*#__PURE__*/React.createElement("h3", {
    className: "home-editorial-image-title"
  }, "La Verde, 2026"), /*#__PURE__*/React.createElement("p", {
    className: "home-editorial-image-sub"
  }, "Seis piezas esculpidas alrededor de la luz esmeralda colombiana."))), /*#__PURE__*/React.createElement("div", {
    className: "glass home-editorial-text"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Nuestra filosof\xEDa"), /*#__PURE__*/React.createElement("h2", {
    className: "home-editorial-title"
  }, "El arte de la orfebrer\xEDa pausada:", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "m\xE1s que una joya, un legado familiar.")), /*#__PURE__*/React.createElement("p", {
    className: "home-editorial-lead"
  }, "Entendemos la esmeralda y el oro de 18 quilates como portadores de la memoria humana. Nos convertimos en c\xF3mplices silenciosos de los instantes que definen una vida: promesas que trascienden el tiempo, hitos de amor incondicional y el recuerdo indeleble de quienes somos."), /*#__PURE__*/React.createElement("blockquote", {
    className: "home-editorial-quote"
  }, "\"Nuestras esmeraldas colombianas de Muzo y Chivor no son meras pertenencias; son fragmentos de tierra viva custodiados por almas sensibles para ser entregados a la siguiente generaci\xF3n.\""), /*#__PURE__*/React.createElement("div", {
    className: "home-editorial-stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-editorial-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "display home-editorial-stat-num"
  }, /*#__PURE__*/React.createElement(CountUp, {
    to: 12,
    suffix: "+"
  })), /*#__PURE__*/React.createElement("div", {
    className: "eyebrow home-editorial-stat-lab"
  }, "A\xF1os")), /*#__PURE__*/React.createElement("div", {
    className: "home-editorial-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "display home-editorial-stat-num"
  }, /*#__PURE__*/React.createElement(CountUp, {
    to: 800,
    suffix: "+"
  })), /*#__PURE__*/React.createElement("div", {
    className: "eyebrow home-editorial-stat-lab"
  }, "Piezas \xFAnicas")), /*#__PURE__*/React.createElement("div", {
    className: "home-editorial-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "display home-editorial-stat-num"
  }, "JA"), /*#__PURE__*/React.createElement("div", {
    className: "eyebrow home-editorial-stat-lab"
  }, "Certificado"))))))), /*#__PURE__*/React.createElement("section", {
    className: "home-services"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-services-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "El valor de lo excepcional"), /*#__PURE__*/React.createElement("h2", {
    className: "home-services-title"
  }, "Una experiencia a la altura", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "de tu propia historia"))), /*#__PURE__*/React.createElement("div", {
    className: "home-services-grid"
  }, HOME_SERVICES.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.t,
    className: "glass home-service-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-service-icon"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    "aria-hidden": "true"
  }, s.icon)), /*#__PURE__*/React.createElement("div", {
    className: "home-service-name"
  }, s.t), /*#__PURE__*/React.createElement("p", {
    className: "home-service-desc"
  }, s.d)))))), /*#__PURE__*/React.createElement("section", {
    className: "home-atelier"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-atelier-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip-dot"
  }), "Atelier Bersaglio"), /*#__PURE__*/React.createElement("h2", {
    className: "home-atelier-title"
  }, "El viaje de creaci\xF3n de ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "una pieza de culto")), /*#__PURE__*/React.createElement("p", {
    className: "home-atelier-lead"
  }, "Un recorrido artesanal meticuloso que transforma una visi\xF3n en un objeto eterno.")), /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent at-stage"
  }, /*#__PURE__*/React.createElement("svg", {
    className: "at-flow",
    viewBox: "0 0 1000 560",
    preserveAspectRatio: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "at-flow-g",
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "oklch(80% 0.13 85)",
    stopOpacity: "0.05"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "oklch(68% 0.15 155)",
    stopOpacity: "0.65"
  }))), /*#__PURE__*/React.createElement("g", {
    fill: "none",
    stroke: "url(#at-flow-g)",
    strokeWidth: "1.5",
    strokeDasharray: "2 9",
    strokeLinecap: "round",
    vectorEffect: "non-scaling-stroke"
  }, /*#__PURE__*/React.createElement("path", {
    className: "at-flow-1",
    d: "M180 150 Q 370 268 470 278"
  }), /*#__PURE__*/React.createElement("path", {
    className: "at-flow-2",
    d: "M820 150 Q 630 268 530 278"
  }), /*#__PURE__*/React.createElement("path", {
    className: "at-flow-3",
    d: "M180 410 Q 370 292 470 282"
  }), /*#__PURE__*/React.createElement("path", {
    className: "at-flow-4",
    d: "M820 410 Q 630 292 530 282"
  }))), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    className: "at-halo"
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    className: "at-ring"
  }), /*#__PURE__*/React.createElement("div", {
    className: "at-jewel"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/gema.png",
    alt: "Esmeralda Bersaglio engastada en oro",
    className: "at-jewel-img",
    loading: "lazy",
    decoding: "async"
  })), HOME_ATELIER_STEPS.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.n,
    className: 'at-card at-card--corner-' + s.corner
  }, /*#__PURE__*/React.createElement("div", {
    className: "at-card-title"
  }, /*#__PURE__*/React.createElement("span", {
    className: "at-card-dot",
    "aria-hidden": "true"
  }), s.t), /*#__PURE__*/React.createElement("p", {
    className: "at-card-desc"
  }, s.d))), /*#__PURE__*/React.createElement("div", {
    className: "at-cta"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => navigate('contacto')
  }, "Iniciar mi pieza", /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  }))))))), /*#__PURE__*/React.createElement("section", {
    className: "home-journal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hj-masthead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hj-masthead-brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono hj-est"
  }, "EST. 2014"), /*#__PURE__*/React.createElement("div", {
    className: "hj-est-divider"
  }), /*#__PURE__*/React.createElement("h2", {
    className: "hj-masthead-title"
  }, "The ", /*#__PURE__*/React.createElement("span", {
    className: "italic"
  }, "Bersaglio"), " Journal")), /*#__PURE__*/React.createElement("div", {
    className: "hj-masthead-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono hj-issue"
  }, JOURNAL_ISSUE.number, " \xB7 ", cover.dateLong), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua hj-archive-btn",
    onClick: () => navigate('journal')
  }, "Archivo completo", /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "hj-masthead-line"
  }), /*#__PURE__*/React.createElement("div", {
    className: "glass hj-ticker"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono hj-ticker-tag"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hj-ticker-pulse"
  }), "EN VIVO"), /*#__PURE__*/React.createElement("div", {
    className: "hj-ticker-clip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hj-ticker-track"
  }, tickerDoubled.map((t, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "hj-ticker-item"
  }, t, /*#__PURE__*/React.createElement("span", {
    className: "hj-ticker-diamond"
  }, "\u25C6")))))), /*#__PURE__*/React.createElement("div", {
    className: "journal-fold hj-fold"
  }, /*#__PURE__*/React.createElement("article", {
    className: "hj-cover"
  }, /*#__PURE__*/React.createElement("a", {
    className: "hj-cover-link",
    onClick: () => openEntrada ? openEntrada(cover.slug) : navigate('journal')
  }, /*#__PURE__*/React.createElement("div", {
    className: "hj-cover-imgwrap"
  }, /*#__PURE__*/React.createElement("img", {
    src: cover.img,
    alt: cover.title,
    className: "hj-cover-img",
    loading: "lazy",
    decoding: "async"
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    className: "hj-cover-vignette"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hj-cover-flag-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono hj-cover-flag"
  }, cover.section.toUpperCase()), /*#__PURE__*/React.createElement("span", {
    className: "mono hj-cover-read"
  }, cover.read, " de lectura")), /*#__PURE__*/React.createElement("div", {
    className: "hj-cover-caption"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono hj-cover-kicker"
  }, cover.kicker))), /*#__PURE__*/React.createElement("h3", {
    className: "hj-cover-title"
  }, cover.title), /*#__PURE__*/React.createElement("p", {
    className: "hj-cover-excerpt cover-excerpt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hj-cover-dropcap"
  }, cover.excerpt.charAt(0)), cover.excerpt.slice(1)), /*#__PURE__*/React.createElement("div", {
    className: "hj-cover-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hj-cover-author-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hj-cover-avatar"
  }, "MB"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hj-cover-author"
  }, cover.author), /*#__PURE__*/React.createElement("div", {
    className: "mono hj-cover-date"
  }, (cover.dateLong || '').toUpperCase()))), /*#__PURE__*/React.createElement("div", {
    className: "hj-cover-continue"
  }, "Continuar leyendo", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))))), /*#__PURE__*/React.createElement("aside", {
    className: "hj-side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hj-side-header"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "hj-side-title"
  }, "M\xE1s le\xEDdos"), /*#__PURE__*/React.createElement("div", {
    className: "mono hj-side-week"
  }, "ESTA SEMANA")), journalSide.map((s, i) => /*#__PURE__*/React.createElement("article", {
    key: s.slug,
    className: "hj-side-row"
  }, /*#__PURE__*/React.createElement("a", {
    className: "hj-side-link",
    onClick: () => openEntrada ? openEntrada(s.slug) : navigate('journal')
  }, /*#__PURE__*/React.createElement("div", {
    className: "hj-side-num"
  }, "0", i + 1), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mono hj-side-meta"
  }, /*#__PURE__*/React.createElement("span", null, s.sec), /*#__PURE__*/React.createElement("span", {
    className: "hj-side-meta-dot"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    className: "hj-side-meta-date"
  }, s.date)), /*#__PURE__*/React.createElement("h5", {
    className: "hj-side-headline"
  }, s.title), /*#__PURE__*/React.createElement("div", {
    className: "mono hj-side-read"
  }, s.read, " de lectura"))))), /*#__PURE__*/React.createElement("div", {
    className: "glass glass-emerald hj-newsletter"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono hj-newsletter-tag"
  }, "NEWSLETTER"), /*#__PURE__*/React.createElement("div", {
    className: "hj-newsletter-title"
  }, "Una nota cada", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "italic hj-newsletter-italic"
  }, "luna llena")), /*#__PURE__*/React.createElement("form", {
    className: "hj-newsletter-form",
    onSubmit: e => e.preventDefault()
  }, /*#__PURE__*/React.createElement("input", {
    type: "email",
    name: "email",
    placeholder: "tu@correo.com",
    className: "hj-newsletter-input",
    autoComplete: "email",
    required: true
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "hj-newsletter-btn"
  }, "Suscribir"))))), journalTrio.length >= 3 && /*#__PURE__*/React.createElement("div", {
    className: "journal-trio hj-trio"
  }, journalTrio.map(t => /*#__PURE__*/React.createElement("article", {
    key: t.slug,
    className: "hj-trio-item"
  }, /*#__PURE__*/React.createElement("a", {
    className: "hj-trio-link",
    onClick: () => openEntrada ? openEntrada(t.slug) : navigate('journal')
  }, /*#__PURE__*/React.createElement("div", {
    className: "hj-trio-imgwrap"
  }, /*#__PURE__*/React.createElement("img", {
    src: t.img,
    alt: t.title,
    className: "hj-trio-img",
    loading: "lazy",
    decoding: "async"
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    className: "hj-trio-vignette"
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono hj-trio-flag"
  }, t.sec)), /*#__PURE__*/React.createElement("h4", {
    className: "hj-trio-title"
  }, t.title), /*#__PURE__*/React.createElement("div", {
    className: "mono hj-trio-who"
  }, t.who))))))), /*#__PURE__*/React.createElement(FilmsSection, null), /*#__PURE__*/React.createElement(SocialSection, null), /*#__PURE__*/React.createElement("section", {
    className: "home-cta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent home-cta-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-cta-glow",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "home-cta-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Visita nuestro Atelier privado"), /*#__PURE__*/React.createElement("h2", {
    className: "home-cta-title"
  }, "Nuestra Maison", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "Cartagena de Indias")), /*#__PURE__*/React.createElement("p", {
    className: "home-cta-lead"
  }, "Te invitamos a cruzar el umbral de nuestro atelier en el coraz\xF3n del Centro Hist\xF3rico. A puerta cerrada y con la calma de un buen caf\xE9, conversaremos sin prisa sobre la pieza que habitar\xE1 en tu linaje familiar."), /*#__PURE__*/React.createElement("p", {
    className: "mono home-cta-addr"
  }, "Calle 36 # 6-32 \xB7 San Agust\xEDn Chiquita", /*#__PURE__*/React.createElement("br", null), "Centro Hist\xF3rico \xB7 Bol\xEDvar, Colombia"), /*#__PURE__*/React.createElement("div", {
    className: "home-cta-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => navigate('contacto')
  }, "Agendar cita privada"), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua",
    onClick: () => navigate('catalogo')
  }, "Explorar colecciones")))))));
}

// ════════════════════════════════════════════════════════════════════
// PRODUCT CARD (shared)
// ════════════════════════════════════════════════════════════════════
function ProductCard({
  p,
  onOpen,
  wished,
  toggleWish,
  idx = 0,
  openQuickView
}) {
  const [ref, cls, st] = useReveal(idx % 4 * 80);
  return /*#__PURE__*/React.createElement("a", {
    ref: ref,
    className: 'glass glass-iridescent k-card ' + cls,
    style: st,
    onClick: () => onOpen(p.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-card-img"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundImage: `url(${p.img})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "k-card-vig"
  }), p.tag && /*#__PURE__*/React.createElement("div", {
    className: "k-card-tag"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip-dot"
  }), p.tag)), openQuickView && /*#__PURE__*/React.createElement("button", {
    className: "k-card-qv",
    title: "Vista r\xE1pida",
    onClick: e => {
      e.stopPropagation();
      openQuickView(p.id);
    }
  }, /*#__PURE__*/React.createElement(IconEye, {
    size: 15,
    sw: 1.7
  })), /*#__PURE__*/React.createElement("button", {
    className: 'k-card-wish' + (wished ? ' on' : ''),
    onClick: e => {
      e.stopPropagation();
      toggleWish(p.id);
    }
  }, /*#__PURE__*/React.createElement(IconHeart, {
    size: 14,
    sw: 1.8,
    fill: wished ? 'currentColor' : 'none'
  }))), /*#__PURE__*/React.createElement("div", {
    className: "k-card-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-card-cat"
  }, p.cat), /*#__PURE__*/React.createElement("div", {
    className: "k-card-name"
  }, p.name), /*#__PURE__*/React.createElement("div", {
    className: "k-card-meta"
  }, [p.stones, p.gold].filter(Boolean).join(' · ')), /*#__PURE__*/React.createElement("div", {
    className: "k-card-foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k-card-price"
  }, fmt$(p.price)), /*#__PURE__*/React.createElement("span", {
    className: "k-card-arrow"
  }, "Ver pieza ", /*#__PURE__*/React.createElement(IconArrow, {
    size: 10
  })))));
}

// ════════════════════════════════════════════════════════════════════
// CATALOG — mirror of js/pages/catalogo.js (cat-page · cat-pills · cat-grid)
// ════════════════════════════════════════════════════════════════════
const CATALOG_SORTS = [{
  key: 'destacados',
  label: 'Destacados'
}, {
  key: 'menor',
  label: 'Precio · menor'
}, {
  key: 'mayor',
  label: 'Precio · mayor'
}, {
  key: 'nombre',
  label: 'Nombre A-Z'
}];
function CatalogScreen({
  openPieza
}) {
  const [cat, setCat] = React.useState('all');
  const [sort, setSort] = React.useState('destacados');
  const collections = [{
    slug: 'all',
    name: 'Todo'
  }, ...COLLECTIONS];
  const activeCol = cat !== 'all' ? COLLECTIONS.find(c => c.slug === cat) : null;
  const title = activeCol ? /*#__PURE__*/React.createElement(React.Fragment, null, activeCol.name, " ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "en cristal")) : /*#__PURE__*/React.createElement(React.Fragment, null, "Todas las ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "piezas"));
  const lead = activeCol?.description || 'Explora nuestra colección completa. Cada pieza es única, con certificación de origen y oro de ley 750.';
  let list = cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.collection === cat);
  if (sort === 'menor') list = [...list].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));else if (sort === 'mayor') list = [...list].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));else if (sort === 'nombre') list = [...list].sort((a, b) => String(a.name).localeCompare(String(b.name)));else list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  return /*#__PURE__*/React.createElement("div", {
    className: "container cat-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cat-page-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow cat-page-eyebrow"
  }, "Cat\xE1logo \xB7 2026"), /*#__PURE__*/React.createElement("h1", {
    className: "cat-page-title"
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "cat-page-lead"
  }, lead)), /*#__PURE__*/React.createElement("div", {
    className: "cat-controls"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass cat-pills",
    role: "tablist",
    "aria-label": "Filtrar por colecci\xF3n"
  }, collections.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.slug,
    type: "button",
    className: 'cat-pill' + (cat === c.slug ? ' is-active' : ''),
    role: "tab",
    "aria-selected": cat === c.slug,
    onClick: () => setCat(c.slug)
  }, c.name))), /*#__PURE__*/React.createElement("div", {
    className: "glass cat-sort"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cat-sort-label"
  }, "Orden"), /*#__PURE__*/React.createElement("select", {
    className: "cat-sort-select",
    "aria-label": "Ordenar resultados",
    value: sort,
    onChange: e => setSort(e.target.value)
  }, CATALOG_SORTS.map(s => /*#__PURE__*/React.createElement("option", {
    key: s.key,
    value: s.key
  }, s.label))))), /*#__PURE__*/React.createElement("div", {
    className: "cat-grid"
  }, list.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "cat-empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cat-empty-icon",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.2"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "20",
    y1: "20",
    x2: "16.5",
    y2: "16.5"
  }))), /*#__PURE__*/React.createElement("p", {
    className: "cat-empty-title"
  }, "No hay piezas en esta colecci\xF3n \u2014 todav\xEDa."), /*#__PURE__*/React.createElement("p", {
    className: "cat-empty-sub"
  }, "Estamos curando el pr\xF3ximo lote. Mientras tanto, explora otras categor\xEDas."), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => setCat('all')
  }, "Ver todo el cat\xE1logo")) : list.map(p => /*#__PURE__*/React.createElement(CatCard, {
    key: p.id,
    p: p,
    onOpen: openPieza
  }))));
}
function CatCard({
  p,
  onOpen
}) {
  const img = p.images?.[0] || p.image || '';
  const tag = p.tag || (p.featured ? 'Destacada' : null);
  const stones = p.specs?.stones || p.specs?.stone || '';
  const col = COLLECTIONS.find(c => c.slug === p.collection);
  const catLabel = col?.name || p.collection;
  const price = Number(p.price || 0);
  return /*#__PURE__*/React.createElement("a", {
    className: "glass glass-iridescent cat-card",
    onClick: () => onOpen(p.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "cat-card-imgwrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cat-card-img",
    style: {
      background: `url('${img}') center/cover`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "cat-card-vignette",
    "aria-hidden": "true"
  }), tag && /*#__PURE__*/React.createElement("div", {
    className: "cat-card-tag"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip-dot"
  }), tag))), /*#__PURE__*/React.createElement("div", {
    className: "cat-card-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cat-card-cat"
  }, catLabel), /*#__PURE__*/React.createElement("div", {
    className: "cat-card-name"
  }, p.name || 'Pieza'), /*#__PURE__*/React.createElement("div", {
    className: "cat-card-meta"
  }, stones), /*#__PURE__*/React.createElement("div", {
    className: "cat-card-foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono cat-card-price"
  }, price ? fmt$(price) : '— Editorial —'), /*#__PURE__*/React.createElement("div", {
    className: "cat-card-arrow"
  }, "Ver", /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  }))))));
}

// ════════════════════════════════════════════════════════════════════
// PIEZA — mirror of js/pages/pieza.js (breadcrumb · gallery · info · related)
// ════════════════════════════════════════════════════════════════════
const PZ_TALLAS_COLLECTIONS = new Set(['anillos', 'argollas']);
function PiezaScreen({
  product,
  navigate,
  addToCart,
  wishlist,
  toggleWish,
  openPieza
}) {
  const [viewIdx, setViewIdx] = React.useState(0);
  const [size, setSize] = React.useState(null);
  React.useEffect(() => {
    setViewIdx(0);
    setSize(null);
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, [product && product.id]);
  if (!product) {
    return /*#__PURE__*/React.createElement("div", {
      className: "container pz-page"
    }, /*#__PURE__*/React.createElement("div", {
      className: "glass pz-notfound"
    }, /*#__PURE__*/React.createElement("div", {
      className: "pz-notfound-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "56",
      height: "56",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.2"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "8",
      x2: "12",
      y2: "13"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "16",
      x2: "12.01",
      y2: "16"
    }))), /*#__PURE__*/React.createElement("h1", {
      className: "pz-notfound-title"
    }, "Esta pieza descansa en otro lugar"), /*#__PURE__*/React.createElement("p", {
      className: "pz-notfound-sub"
    }, "La pieza solicitada no se encuentra disponible actualmente en nuestro atelier."), /*#__PURE__*/React.createElement("div", {
      className: "pz-notfound-actions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn-aqua btn-aqua-emerald",
      onClick: () => navigate('catalogo')
    }, "Ver el cat\xE1logo"), /*#__PURE__*/React.createElement("button", {
      className: "btn-aqua",
      onClick: () => navigate('contacto')
    }, "Hablar con un asesor"))));
  }
  const collection = COLLECTIONS.find(c => c.slug === product.collection);
  const catLabel = collection?.name || product.collection || 'Pieza';
  const images = (product.images || []).filter(Boolean);
  if (images.length === 0 && product.image) images.push(product.image);
  const main = images[Math.min(viewIdx, images.length - 1)];
  const price = Number(product.price || 0);
  const inWishlist = wishlist.includes(product.id);
  const showTalla = PZ_TALLAS_COLLECTIONS.has(product.collection);
  const showCert = product.specs?.certificate || product.specs?.gia || (product.stones || '').includes('Diamante');
  const stones = product.specs?.stones || product.specs?.stone || '';
  const primaryGem = stones.includes('·') ? stones.split('·')[0].trim() : stones || 'Esmeralda';
  const specs = [{
    key: 'Gema principal',
    val: primaryGem
  }, {
    key: 'Metal',
    val: product.specs?.metal || product.specs?.gold || 'Oro 18K'
  }, {
    key: 'Origen',
    val: product.specs?.origin || 'Muzo, Colombia'
  }, {
    key: 'Entrega',
    val: product.specs?.delivery || '2-3 semanas'
  }];
  const description = product.description || product.desc || `Una pieza de alta joyería esculpida a mano en oro de 18 quilates, concebida alrededor del fuego interior de una ${(stones || 'esmeralda colombiana').toLowerCase()}. Acabado pulido y perfeccionado pacientemente por los maestros orfebres de nuestro atelier en Cartagena de Indias.`;
  const slug = product.slug || product.id;
  const related = PRODUCTS.filter(p => p.id !== product.id && p.collection === product.collection).slice(0, 4);
  while (related.length < 4) {
    const filler = PRODUCTS.find(p => p.id !== product.id && !related.includes(p));
    if (!filler) break;
    related.push(filler);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "container pz-page"
  }, /*#__PURE__*/React.createElement("nav", {
    className: "pz-breadcrumb",
    "aria-label": "Migas de pan"
  }, /*#__PURE__*/React.createElement("a", {
    className: "pz-crumb",
    onClick: () => navigate('home')
  }, "Inicio"), /*#__PURE__*/React.createElement("span", {
    className: "pz-crumb-sep",
    "aria-hidden": "true"
  }, "\u2192"), /*#__PURE__*/React.createElement("a", {
    className: "pz-crumb",
    onClick: () => navigate('catalogo')
  }, catLabel), /*#__PURE__*/React.createElement("span", {
    className: "pz-crumb-sep",
    "aria-hidden": "true"
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    className: "pz-crumb pz-crumb-current"
  }, product.name)), /*#__PURE__*/React.createElement("article", {
    className: "pz-layout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pz-gallery"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent pz-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pz-main-img",
    style: {
      background: `url('${main}') center/cover`
    }
  }), showCert && /*#__PURE__*/React.createElement("div", {
    className: "pz-main-chips"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chip pz-cert-chip"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "12,2 22,8.5 12,22 2,8.5"
  })), "GIA Certificado"))), images.length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "pz-thumbs"
  }, images.slice(0, 6).map((src, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    type: "button",
    className: 'glass pz-thumb' + (i === viewIdx ? ' is-active' : ''),
    onClick: () => setViewIdx(i),
    "aria-label": `Ver imagen ${i + 1}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "pz-thumb-img",
    style: {
      background: `url('${src}') center/cover`
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "pz-info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow pz-info-eyebrow"
  }, catLabel, " \xB7 Bersaglio 2026"), /*#__PURE__*/React.createElement("h1", {
    className: "pz-info-name"
  }, product.name), /*#__PURE__*/React.createElement("div", {
    className: "pz-price-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono pz-price"
  }, price ? fmt$(price) : 'Bajo consulta'), price ? /*#__PURE__*/React.createElement("div", {
    className: "pz-iva"
  }, "IVA incluido") : null), /*#__PURE__*/React.createElement("p", {
    className: "pz-info-desc"
  }, description), /*#__PURE__*/React.createElement("div", {
    className: "pz-specs"
  }, specs.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.key,
    className: "glass pz-spec"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pz-spec-key"
  }, s.key), /*#__PURE__*/React.createElement("div", {
    className: "pz-spec-val"
  }, s.val)))), showTalla && /*#__PURE__*/React.createElement("div", {
    className: "pz-talla"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow pz-talla-label"
  }, "Talla"), /*#__PURE__*/React.createElement("div", {
    className: "pz-talla-pills"
  }, [5, 6, 7, 8, 9].map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    type: "button",
    className: 'glass pz-talla-pill' + (size === s ? ' is-active' : ''),
    onClick: () => setSize(size === s ? null : s)
  }, s)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: 'glass pz-talla-pill pz-talla-custom' + (size === 'custom' ? ' is-active' : ''),
    onClick: () => setSize(size === 'custom' ? null : 'custom')
  }, "A medida"))), /*#__PURE__*/React.createElement("div", {
    className: "pz-actions"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-aqua btn-aqua-emerald pz-cart-btn",
    onClick: () => addToCart(product)
  }, "Agregar al carrito"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: 'btn-aqua pz-wish-btn' + (inWishlist ? ' is-saved' : ''),
    "aria-pressed": inWishlist,
    "aria-label": inWishlist ? 'Quitar de favoritos' : 'Guardar en favoritos',
    onClick: () => toggleWish(product.id)
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: inWishlist ? 'currentColor' : 'none',
    stroke: "currentColor",
    strokeWidth: "1.6",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
  })))), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-gold pz-asesor-btn",
    onClick: () => navigate('contacto')
  }, "Consultar con un asesor"))), related.length > 0 && /*#__PURE__*/React.createElement("section", {
    className: "pz-related"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pz-related-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Tambi\xE9n podr\xEDa gustarte"), /*#__PURE__*/React.createElement("h2", {
    className: "pz-related-title"
  }, "M\xE1s de ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, catLabel))), /*#__PURE__*/React.createElement("div", {
    className: "pz-related-grid"
  }, related.map(p => /*#__PURE__*/React.createElement("a", {
    key: p.id,
    className: "glass glass-iridescent pz-related-card",
    onClick: () => openPieza(p.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "pz-related-imgwrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pz-related-img",
    style: {
      background: `url('${p.images?.[0] || p.img}') center/cover`
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "pz-related-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pz-related-name"
  }, p.name), /*#__PURE__*/React.createElement("div", {
    className: "mono pz-related-price"
  }, fmt$(p.price))))))));
}
Object.assign(window, {
  HomeScreen,
  CatalogScreen,
  PiezaScreen,
  ProductCard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_bersaglio_redesign/components/Screens.jsx", error: String((e && e.message) || e) }); }

// design_handoff_bersaglio_redesign/components/Sections.jsx
try { (() => {
/* global React, ATELIER, JOURNAL, JOURNAL_TICKER, useReveal, IconArrow */
// Bersaglio storefront — Fase 2 sections: Atelier, The Journal, Share moment.

const IconWhatsapp = ({
  size = 15
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M20.5 3.5A11 11 0 0 0 3.4 17l-1.4 5.1 5.2-1.4A11 11 0 1 0 20.5 3.5z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M8 10.5c.3 2 2 3.7 4 4.2 1 .3 1.9.1 2.5-.5.2-.2.3-.6.2-.9l-.3-.9c-.1-.3-.4-.4-.7-.4l-1 .2c-.2 0-.4 0-.6-.2-.5-.4-1-.9-1.3-1.5-.1-.2-.1-.4 0-.5l.4-.6c.2-.2.2-.5.1-.7l-.5-1c-.1-.3-.4-.4-.7-.4l-.9.2c-.4.1-.6.4-.6.8 0 .5 0 1 .2 1.4z"
}));
const IconLink = ({
  size = 15
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"
}));
const IconInstagram = ({
  size = 15
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("rect", {
  x: "3",
  y: "3",
  width: "18",
  height: "18",
  rx: "5"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "4"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "17.5",
  cy: "6.5",
  r: "1",
  fill: "currentColor",
  stroke: "none"
}));
const initials = name => name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('');

// ════════════════════════════════════════════════════════════════════
// ATELIER — process scene with central jewel
// ════════════════════════════════════════════════════════════════════
function AtelierSection({
  navigate
}) {
  const [ref, cls, st] = useReveal(0);
  return /*#__PURE__*/React.createElement("section", {
    className: "k-section",
    style: {
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip-dot",
    style: {
      background: 'var(--bj-gold-500)'
    }
  }), "Atelier Bersaglio"), /*#__PURE__*/React.createElement("h2", null, "El viaje de creaci\xF3n de ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "una pieza de culto")), /*#__PURE__*/React.createElement("p", null, "Un recorrido artesanal meticuloso que transforma una visi\xF3n en un objeto eterno.")), /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: 'glass glass-iridescent k-at-stage ' + cls,
    style: st
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-at-halo",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "k-at-ring",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "k-at-jewel"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/ring-sapphire.webp",
    alt: "Pieza Bersaglio en proceso de orfebrer\xEDa",
    loading: "lazy"
  })), ATELIER.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: s.n,
    className: 'k-at-card c' + i
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-at-num"
  }, s.n), /*#__PURE__*/React.createElement("div", {
    className: "k-at-card-t"
  }, s.t), /*#__PURE__*/React.createElement("p", {
    className: "k-at-card-d"
  }, s.d))), /*#__PURE__*/React.createElement("div", {
    className: "k-at-cta"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => navigate('contacto')
  }, "Iniciar mi pieza ", /*#__PURE__*/React.createElement(IconArrow, {
    size: 13
  }))))));
}

// ════════════════════════════════════════════════════════════════════
// THE BERSAGLIO JOURNAL — NYT-style masthead
// ════════════════════════════════════════════════════════════════════
function JournalSection({
  navigate
}) {
  const [ref, cls, st] = useReveal(0);
  const cover = JOURNAL.find(e => e.featured) || JOURNAL[0];
  const rest = JOURNAL.filter(e => e !== cover).slice(0, 4);
  const ticker = [...JOURNAL_TICKER, ...JOURNAL_TICKER];
  const open = () => navigate('nosotros');
  return /*#__PURE__*/React.createElement("section", {
    className: "k-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-masthead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-est"
  }, "EST. 2014"), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-divider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-title"
  }, "The ", /*#__PURE__*/React.createElement("span", {
    className: "italic"
  }, "Bersaglio"), " Journal")), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-issue"
  }, "Issue N\xBA 14 \xB7 Marzo 2026"), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua",
    style: {
      padding: '10px 16px',
      fontSize: 12
    },
    onClick: open
  }, "Archivo completo ", /*#__PURE__*/React.createElement(IconArrow, {
    size: 12
  })))), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-rule"
  }), /*#__PURE__*/React.createElement("div", {
    className: "glass k-jr-ticker"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k-jr-ticker-tag"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k-jr-pulse"
  }), "EN VIVO"), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-ticker-clip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-ticker-track"
  }, ticker.map((t, i) => /*#__PURE__*/React.createElement("span", {
    className: "k-jr-ticker-item",
    key: i
  }, t))))), /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: 'k-jr-fold ' + cls,
    style: st
  }, /*#__PURE__*/React.createElement("a", {
    className: "k-jr-cover",
    onClick: open
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-cover-img"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundImage: `url(${cover.img})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-cover-vig"
  }), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-cover-flag"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k-jr-flag"
  }, cover.section), /*#__PURE__*/React.createElement("span", {
    className: "k-jr-flag"
  }, cover.read, " de lectura"))), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-kicker"
  }, cover.kicker), /*#__PURE__*/React.createElement("h3", {
    className: "k-jr-cover-title"
  }, cover.title), /*#__PURE__*/React.createElement("p", {
    className: "k-jr-cover-excerpt"
  }, cover.excerpt), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-cover-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-avatar"
  }, initials(cover.author)), /*#__PURE__*/React.createElement("span", null, "Por ", cover.author, " \xB7 ", cover.date))), /*#__PURE__*/React.createElement("aside", {
    className: "k-jr-side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-side-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-side-title"
  }, "M\xE1s le\xEDdos"), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-side-week"
  }, "ESTA SEMANA")), rest.map((e, i) => /*#__PURE__*/React.createElement("a", {
    className: "k-jr-row",
    key: e.slug,
    onClick: open
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-row-num"
  }, "0", i + 1), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-row-sec"
  }, e.section, " \xB7 ", e.date), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-row-title"
  }, e.title), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-row-read"
  }, e.read, " de lectura"))))))));
}

// ════════════════════════════════════════════════════════════════════
// SHARE moment
// ════════════════════════════════════════════════════════════════════
function ShareSection({
  showToast
}) {
  const [ref, cls, st] = useReveal(0);
  const share = kind => {
    if (kind === 'link' && navigator.clipboard) {
      navigator.clipboard.writeText('https://bersagliojewelry.co/pieza/collar-la-verde').catch(() => {});
      showToast('Enlace copiado al portapapeles');
    } else if (kind === 'wa') {
      showToast('Abriendo WhatsApp…');
    } else {
      showToast('Compartiendo en Instagram…');
    }
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "k-section",
    style: {
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-container"
  }, /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: 'glass glass-iridescent k-share ' + cls,
    style: st
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-share-visual"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundImage: 'url(../../assets/model-emerald.webp)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "k-share-visual-shade"
  })), /*#__PURE__*/React.createElement("div", {
    className: "k-share-body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Comparte el deseo"), /*#__PURE__*/React.createElement("h2", null, "Una pieza que ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "merece ser contada")), /*#__PURE__*/React.createElement("p", {
    className: "k-share-lead"
  }, "\xBFEncontraste la joya que habla por ti? Comp\xE1rtela con quien debe verla \u2014 o gu\xE1rdala para esa conversaci\xF3n pendiente frente a un caf\xE9 en Cartagena."), /*#__PURE__*/React.createElement("div", {
    className: "k-share-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "k-share-btn wa",
    onClick: () => share('wa')
  }, /*#__PURE__*/React.createElement(IconWhatsapp, null), " WhatsApp"), /*#__PURE__*/React.createElement("button", {
    className: "k-share-btn",
    onClick: () => share('link')
  }, /*#__PURE__*/React.createElement(IconLink, null), " Copiar enlace"), /*#__PURE__*/React.createElement("button", {
    className: "k-share-btn",
    onClick: () => share('ig')
  }, /*#__PURE__*/React.createElement(IconInstagram, null), " Instagram"))))));
}

// ════════════════════════════════════════════════════════════════════
// BERSAGLIO FILMS — multimedia / video gallery + lightbox
// ════════════════════════════════════════════════════════════════════
function PlatformIcon({
  name,
  size = 15
}) {
  if (name === 'Instagram') return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.4-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z"
  }));
  if (name === 'Facebook') return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M24 12a12 12 0 1 0-13.88 11.86v-8.39H7.08V12h3.04V9.36c0-3 1.79-4.66 4.53-4.66 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.39A12 12 0 0 0 24 12z"
  }));
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"
  }));
}
function FilmsSection() {
  const [filter, setFilter] = React.useState('Todos');
  const [active, setActive] = React.useState(null);
  const featured = VIDEOS.find(v => v.featured) || VIDEOS[0];
  const list = (filter === 'Todos' ? VIDEOS : VIDEOS.filter(v => v.cat === filter)).filter(v => v !== featured);
  const playIcon = s => /*#__PURE__*/React.createElement("svg", {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 5v14l11-7z"
  }));
  return /*#__PURE__*/React.createElement("section", {
    className: "home-films"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "films-header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Bersaglio Films"), /*#__PURE__*/React.createElement("h2", {
    className: "films-title"
  }, "Mira el ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "oficio"), " en movimiento")), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua",
    onClick: () => setActive(featured)
  }, "Ver el \xFAltimo estreno", /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "films-filters"
  }, VIDEO_CATEGORIES.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    className: 'films-pill' + (filter === c ? ' on' : ''),
    onClick: () => setFilter(c)
  }, c))), /*#__PURE__*/React.createElement("div", {
    className: "films-layout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent film-feature",
    onClick: () => setActive(featured)
  }, /*#__PURE__*/React.createElement("div", {
    className: "film-feature-img",
    style: {
      backgroundImage: `url(${featured.thumb})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "film-feature-shade"
  }), /*#__PURE__*/React.createElement("div", {
    className: "film-play",
    "aria-hidden": "true"
  }, playIcon(26)), /*#__PURE__*/React.createElement("div", {
    className: "film-feature-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "film-feature-chips"
  }, /*#__PURE__*/React.createElement("span", {
    className: "film-flag"
  }, featured.cat), /*#__PURE__*/React.createElement("span", {
    className: "film-flag"
  }, featured.dur)), /*#__PURE__*/React.createElement("h3", {
    className: "film-feature-title"
  }, featured.title), /*#__PURE__*/React.createElement("p", {
    className: "film-feature-desc"
  }, featured.desc))), /*#__PURE__*/React.createElement("div", {
    className: "films-side"
  }, list.slice(0, 4).map(v => /*#__PURE__*/React.createElement("div", {
    key: v.id,
    className: "glass film-card",
    onClick: () => setActive(v)
  }, /*#__PURE__*/React.createElement("div", {
    className: "film-thumb",
    style: {
      backgroundImage: `url(${v.thumb})`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "film-thumb-play"
  }, playIcon(22)), /*#__PURE__*/React.createElement("span", {
    className: "film-dur"
  }, v.dur)), /*#__PURE__*/React.createElement("div", {
    className: "film-card-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "film-card-cat"
  }, v.cat), /*#__PURE__*/React.createElement("div", {
    className: "film-card-title"
  }, v.title, v.badge && /*#__PURE__*/React.createElement("span", {
    className: "film-badge"
  }, v.badge))))), /*#__PURE__*/React.createElement("div", {
    className: "films-upload"
  }, /*#__PURE__*/React.createElement("div", {
    className: "films-upload-icon"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "films-upload-text"
  }, /*#__PURE__*/React.createElement("b", null, "Panel de administraci\xF3n:"), " sube videos a Firebase Storage o pega un enlace de YouTube/Vimeo; aparecen aqu\xED al instante."))))), /*#__PURE__*/React.createElement("div", {
    className: 'film-lightbox' + (active ? ' is-open' : ''),
    onClick: () => setActive(null)
  }, active && /*#__PURE__*/React.createElement("div", {
    className: "film-lightbox-inner",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "film-screen"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundImage: `url(${active.thumb})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "film-screen-shade"
  }), /*#__PURE__*/React.createElement("div", {
    className: "film-play",
    "aria-hidden": "true"
  }, playIcon(28)), /*#__PURE__*/React.createElement("div", {
    className: "film-screen-note"
  }, "\u25B6 Demo \xB7 aqu\xED se reproduce el video real (Firebase Storage / YouTube / Vimeo)")), /*#__PURE__*/React.createElement("div", {
    className: "film-lightbox-bar"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      letterSpacing: '0.12em',
      color: 'oklch(85% 0.1 90)',
      marginBottom: 4
    }
  }, active.cat.toUpperCase(), " \xB7 ", active.dur), /*#__PURE__*/React.createElement("div", {
    className: "film-lightbox-title"
  }, active.title)), /*#__PURE__*/React.createElement("button", {
    className: "film-lightbox-close",
    onClick: () => setActive(null),
    "aria-label": "Cerrar"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "6",
    x2: "18",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "18",
    y1: "6",
    x2: "6",
    y2: "18"
  })))))));
}

// ════════════════════════════════════════════════════════════════════
// SOCIAL FEED — latest from Instagram / Facebook / TikTok
// ════════════════════════════════════════════════════════════════════
function SocialSection() {
  const [tab, setTab] = React.useState('Todas');
  const list = tab === 'Todas' ? SOCIAL : SOCIAL.filter(p => p.platform === tab);
  const statIcon = kind => kind === 'views' ? /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 21s-8-4.5-8-10a4.5 4.5 0 0 1 8-2.9A4.5 4.5 0 0 1 20 11c0 5.5-8 10-8 10z"
  }));
  return /*#__PURE__*/React.createElement("section", {
    className: "home-social"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "social-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "S\xEDguenos de cerca"), /*#__PURE__*/React.createElement("h2", {
    className: "social-title"
  }, "Lo \xFAltimo en ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "nuestras redes")), /*#__PURE__*/React.createElement("p", {
    className: "social-lead"
  }, "Cada pieza tiene vida fuera de la vitrina. Esto es lo m\xE1s reciente que hemos publicado en Instagram, Facebook y TikTok \u2014 actualizado autom\xE1ticamente.")), /*#__PURE__*/React.createElement("div", {
    className: "social-tabs"
  }, SOCIAL_PLATFORMS.map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    className: 'social-tab' + (tab === p ? ' on' : ''),
    onClick: () => setTab(p)
  }, p !== 'Todas' && /*#__PURE__*/React.createElement(PlatformIcon, {
    name: p,
    size: 14
  }), p))), /*#__PURE__*/React.createElement("div", {
    className: "social-grid"
  }, list.slice(0, 8).map((p, i) => /*#__PURE__*/React.createElement("a", {
    key: i,
    className: "social-card",
    target: "_blank",
    rel: "noopener"
  }, /*#__PURE__*/React.createElement("div", {
    className: "social-card-img",
    style: {
      backgroundImage: `url(${p.thumb})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "social-card-grad"
  }), /*#__PURE__*/React.createElement("span", {
    className: 'social-badge social-badge--' + p.platform.toLowerCase()
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    name: p.platform,
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "social-type"
  }, p.type), /*#__PURE__*/React.createElement("div", {
    className: "social-card-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "social-card-caption"
  }, p.caption), /*#__PURE__*/React.createElement("div", {
    className: "social-card-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "social-card-stat"
  }, statIcon(p.kind), p.stat), /*#__PURE__*/React.createElement("span", null, p.date)))))), /*#__PURE__*/React.createElement("div", {
    className: "social-follow"
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn-aqua",
    href: "https://instagram.com/bersagliojewelry",
    target: "_blank",
    rel: "noopener"
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    name: "Instagram",
    size: 15
  }), " @bersagliojewelry"), /*#__PURE__*/React.createElement("a", {
    className: "btn-aqua",
    href: "https://tiktok.com/@bersagliojewelry",
    target: "_blank",
    rel: "noopener"
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    name: "TikTok",
    size: 14
  }), " TikTok"), /*#__PURE__*/React.createElement("a", {
    className: "btn-aqua",
    href: "https://facebook.com/bersagliojewelry",
    target: "_blank",
    rel: "noopener"
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    name: "Facebook",
    size: 15
  }), " Facebook"))));
}
Object.assign(window, {
  AtelierSection,
  JournalSection,
  ShareSection,
  FilmsSection,
  SocialSection
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_bersaglio_redesign/components/Sections.jsx", error: String((e && e.message) || e) }); }

// design_handoff_bersaglio_redesign/components/Shell.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React, fmt$ */
// Bersaglio storefront shell — logo, icons, header pill, footer, cart drawer.

// ── Inline line-icon set (stroke-only, the house style) ─────────────
const Icon = ({
  d,
  size = 18,
  sw = 1.8,
  fill = 'none',
  children
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: fill,
  stroke: "currentColor",
  strokeWidth: sw,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, d ? /*#__PURE__*/React.createElement("path", {
  d: d
}) : children);
const IconCart = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "9",
  cy: "21",
  r: "1"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "20",
  cy: "21",
  r: "1"
}), /*#__PURE__*/React.createElement("path", {
  d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
}));
const IconSearch = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "11",
  cy: "11",
  r: "7"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 21l-4.3-4.3"
}));
const IconHeart = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
}));
const IconArrow = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  sw: 2,
  d: "M5 12h14M13 5l7 7-7 7"
}));
const IconClose = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  sw: 2
}), /*#__PURE__*/React.createElement("line", {
  x1: "6",
  y1: "6",
  x2: "18",
  y2: "18"
}), /*#__PURE__*/React.createElement("line", {
  x1: "18",
  y1: "6",
  x2: "6",
  y2: "18"
}));
const IconPin = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "10",
  r: "2.5"
}));
const IconShield = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
}));
const IconCheck = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: "M20 6L9 17l-5-5"
}));
const IconPen = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: "M12 20h9M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
}));
const IconUser = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "7",
  r: "4"
}));
const IconEye = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "3"
}));
const ServiceIcon = ({
  name,
  ...p
}) => ({
  pen: IconPen,
  user: IconUser,
  check: IconCheck,
  shield: IconShield
}[name] || IconCheck)(p);

// ── Brand mark (serif B in circle with construction axis) ───────────
const BersaglioLogo = ({
  size = 28
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size * 1.05,
  viewBox: "0 0 80 84",
  fill: "none",
  style: {
    display: 'block'
  }
}, /*#__PURE__*/React.createElement("circle", {
  cx: "40",
  cy: "42",
  r: "28",
  stroke: "#0f5132",
  strokeWidth: "1.2",
  opacity: "0.85"
}), /*#__PURE__*/React.createElement("line", {
  x1: "40",
  y1: "4",
  x2: "40",
  y2: "80",
  stroke: "#0f5132",
  strokeWidth: "0.8",
  opacity: "0.5"
}), /*#__PURE__*/React.createElement("text", {
  x: "40",
  y: "54",
  textAnchor: "middle",
  fontFamily: "Fraunces, serif",
  fontWeight: "600",
  fontSize: "32",
  fill: "#0f5132"
}, "B"));

// ── Header — floating Dynamic Island pill ───────────────────────────
function Header({
  route,
  navigate,
  cartCount,
  onCart,
  onSearch,
  wishlistCount
}) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const nav = [{
    k: 'home',
    label: 'Inicio'
  }, {
    k: 'catalogo',
    label: 'Colecciones'
  }, {
    k: 'nosotros',
    label: 'Nosotros'
  }, {
    k: 'contacto',
    label: 'Contacto'
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "bj-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: 'bj-header-pill glass glass-iridescent' + (scrolled ? ' is-scrolled' : '')
  }, /*#__PURE__*/React.createElement("button", {
    className: "bj-header-logo",
    onClick: () => navigate('home')
  }, /*#__PURE__*/React.createElement(BersaglioLogo, {
    size: 28
  }), /*#__PURE__*/React.createElement("div", {
    className: "bj-header-logo-text"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-header-brand"
  }, "BERSAGLIO"), /*#__PURE__*/React.createElement("div", {
    className: "bj-header-sub"
  }, "Jewelry"))), /*#__PURE__*/React.createElement("nav", {
    className: "bj-header-nav"
  }, nav.map(n => {
    const active = route === n.k || n.k === 'catalogo' && route === 'pieza';
    return /*#__PURE__*/React.createElement("button", {
      key: n.k,
      className: 'bj-nav-pill' + (active ? ' is-active' : ''),
      onClick: () => navigate(n.k)
    }, n.label);
  })), /*#__PURE__*/React.createElement("button", {
    className: "bj-header-cart",
    onClick: onSearch,
    title: "Buscar (Ctrl K)",
    style: {
      marginRight: 2
    }
  }, /*#__PURE__*/React.createElement(IconSearch, {
    size: 16
  })), /*#__PURE__*/React.createElement("button", {
    className: "bj-header-cart",
    onClick: () => navigate('lista-deseos'),
    title: "Favoritos",
    style: {
      marginRight: 2
    }
  }, /*#__PURE__*/React.createElement(IconHeart, {
    size: 16
  }), wishlistCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "bj-header-badge"
  }, wishlistCount)), /*#__PURE__*/React.createElement("button", {
    className: "bj-header-cart",
    onClick: onCart,
    title: "Carrito"
  }, /*#__PURE__*/React.createElement(IconCart, {
    size: 16
  }), cartCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "bj-header-badge"
  }, cartCount))));
}

// ── Cart drawer ─────────────────────────────────────────────────────
function CartDrawer({
  open,
  items,
  onClose,
  onQty,
  onRemove,
  onCheckout
}) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: 'bj-drawer-backdrop' + (open ? ' is-open' : ''),
    onClick: onClose
  }), /*#__PURE__*/React.createElement("aside", {
    className: 'bj-cart-drawer' + (open ? ' is-open' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Carrito"), /*#__PURE__*/React.createElement("h3", {
    className: "bj-cart-title"
  }, "Tus joyas")), /*#__PURE__*/React.createElement("button", {
    className: "bj-cart-close",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(IconClose, {
    size: 14
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-body"
  }, items.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-empty-icon",
    style: {
      width: 140,
      height: 140,
      background: 'none',
      borderRadius: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/cart-gems.png",
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      filter: 'drop-shadow(0 10px 24px oklch(42% 0.14 155 / 0.3))'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-empty-title"
  }, "A\xFAn sin piezas"), /*#__PURE__*/React.createElement("p", {
    className: "bj-cart-empty-sub"
  }, "Tu colecci\xF3n comienza con una historia. Explora el atelier.")), items.map(i => /*#__PURE__*/React.createElement("div", {
    key: i.id,
    className: "bj-cart-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-row-img",
    style: {
      backgroundImage: `url(${i.img})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-row-body"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-row-name"
  }, i.name), /*#__PURE__*/React.createElement("div", {
    className: "mono bj-cart-row-meta"
  }, fmt$(i.price))), /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-row-controls"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-qty"
  }, /*#__PURE__*/React.createElement("button", {
    className: "bj-cart-qty-btn",
    onClick: () => onQty(i.id, i.qty - 1)
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    className: "mono bj-cart-qty-val"
  }, i.qty), /*#__PURE__*/React.createElement("button", {
    className: "bj-cart-qty-btn",
    onClick: () => onQty(i.id, i.qty + 1)
  }, "+")), /*#__PURE__*/React.createElement("button", {
    className: "bj-cart-row-remove",
    onClick: () => onRemove(i.id)
  }, "Quitar")))))), items.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-subtotal-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Subtotal"), /*#__PURE__*/React.createElement("span", {
    className: "mono bj-cart-subtotal"
  }, fmt$(subtotal))), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald bj-cart-checkout-btn",
    onClick: onCheckout
  }, "Ir al checkout ", /*#__PURE__*/React.createElement(IconArrow, {
    size: 14
  })), /*#__PURE__*/React.createElement("p", {
    className: "bj-cart-note"
  }, "Asesor\xEDa personalizada antes de cada compra \xB7 Env\xEDo asegurado mundial"))));
}

// ── Footer ──────────────────────────────────────────────────────────
function Footer({
  navigate
}) {
  const cols = [{
    t: 'Colecciones',
    l: [['Anillos', 'catalogo'], ['Topos & Aretes', 'catalogo'], ['Argollas', 'catalogo'], ['Dijes', 'catalogo']]
  }, {
    t: 'Casa',
    l: [['Nuestra historia', 'nosotros'], ['Diseño a medida', 'contacto'], ['Certificaciones', 'nosotros'], ['The Journal', 'journal']]
  }, {
    t: 'Servicio',
    l: [['Contacto', 'contacto'], ['Asesoría', 'contacto'], ['Envíos', 'terminos'], ['Garantía', 'terminos']]
  }];
  return /*#__PURE__*/React.createElement("footer", {
    className: "bj-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-footer-grid glass glass-iridescent"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-footer-brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-footer-logo-row"
  }, /*#__PURE__*/React.createElement(BersaglioLogo, {
    size: 34
  }), /*#__PURE__*/React.createElement("div", {
    className: "bj-footer-brand-name"
  }, "BERSAGLIO")), /*#__PURE__*/React.createElement("p", {
    className: "bj-footer-tagline"
  }, "Alta joyer\xEDa con esmeraldas colombianas, diamantes certificados y oro 18K. Piezas dise\xF1adas para trascender generaciones.")), cols.map(col => /*#__PURE__*/React.createElement("div", {
    key: col.t
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow bj-footer-col-title"
  }, col.t), /*#__PURE__*/React.createElement("ul", {
    className: "bj-footer-col-list"
  }, col.l.map(([lab, r]) => /*#__PURE__*/React.createElement("li", {
    key: lab
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => navigate(r),
    style: {
      cursor: 'pointer'
    }
  }, lab))))))), /*#__PURE__*/React.createElement("div", {
    className: "bj-footer-meta"
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Bersaglio Jewelry \xB7 Cartagena de Indias, Colombia"), /*#__PURE__*/React.createElement("span", {
    className: "bj-footer-legal"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bj-footer-legal-links"
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => navigate('terminos')
  }, "T\xE9rminos"), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "\xB7"), /*#__PURE__*/React.createElement("a", {
    onClick: () => navigate('privacidad')
  }, "Cookies"), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "\xB7"), /*#__PURE__*/React.createElement("a", {
    onClick: () => navigate('privacidad')
  }, "Privacidad"))))));
}
Object.assign(window, {
  BersaglioLogo,
  Header,
  CartDrawer,
  Footer,
  ServiceIcon,
  IconCart,
  IconSearch,
  IconHeart,
  IconArrow,
  IconClose,
  IconPin,
  IconShield,
  IconCheck,
  IconPen,
  IconUser,
  IconEye
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_bersaglio_redesign/components/Shell.jsx", error: String((e && e.message) || e) }); }

// design_handoff_bersaglio_redesign/components/data.jsx
try { (() => {
/* global window */
// Bersaglio storefront — data layer. Shape mirrors the production
// Firestore schema (see js/pages/catalogo.js, js/pages/pieza.js).

const ASSET = '../../assets';

// Collections — slug, display name, description (used in catalogo header).
const COLLECTIONS = [{
  slug: 'anillos',
  name: 'Anillos',
  description: 'Solitarios, halos y aros de compromiso esculpidos en oro 18K, con esmeraldas colombianas y diamantes certificados.'
}, {
  slug: 'topos-aretes',
  name: 'Topos & Aretes',
  description: 'La piedra en su gesto más íntimo. Topos solitarios, briolettes y halos para todos los días.'
}, {
  slug: 'argollas',
  name: 'Argollas',
  description: 'Alianzas y argollas en oro 18K — pulido espejo o satinado. La pieza que se hereda.'
}, {
  slug: 'dijes-colgantes',
  name: 'Dijes & Colgantes',
  description: 'Dijes con esmeraldas briolette y gotas de oro sobre cadenas venecianas y rolós.'
}, {
  slug: 'pulseras',
  name: 'Pulseras',
  description: 'Pulseras tenis, riveras y eslabones — todas en oro de 18 quilates.'
}, {
  slug: 'editorial',
  name: 'Editorial',
  description: 'Piezas únicas de campaña. Cada una existe una sola vez en el mundo.'
}];

// Catalog — mirror of Firestore /pieces.
// Required fields (used by catalogo.js + pieza.js): id, slug, name, collection, price,
// images[], tag?, featured?, specs.{stones, metal, ...}, description, story (paragraphs).
const PRODUCTS = [{
  id: 'halo-emerald',
  slug: 'topos-halo-esmeralda',
  name: 'Topos Halo Esmeralda',
  collection: 'topos-aretes',
  price: 12400000,
  images: [`${ASSET}/earrings-emerald.webp`, `${ASSET}/earrings-travertino.webp`, `${ASSET}/model-emerald.webp`],
  tag: 'Best Seller',
  featured: true,
  specs: {
    stones: 'Esmeralda · Diamante',
    stone: 'Esmeralda Muzo',
    metal: 'Oro amarillo 18K',
    origin: 'Muzo, Boyacá',
    guarantee: 'Vitalicia'
  },
  description: 'Un halo de diamantes que orbita una esmeralda colombiana de talla cojín. Engaste a microscopio, 40x de aumento, para que cada uña sostenga el fuego sin tocar la luz.',
  story: ['Cada topo es engastado a mano por Eliécer Patiño en nuestro atelier de Cartagena. La esmeralda central viaja desde la mina de Muzo, en Boyacá, donde es seleccionada por color y "jardín".', 'El halo está construido con 22 diamantes redondos de 1.2mm, clarity VS, color G. Tomamos cuatro horas en engastarlos uno a uno.']
}, {
  id: 'emerald-classic',
  slug: 'topos-esmeralda-classic',
  name: 'Topos Esmeralda Classic',
  collection: 'topos-aretes',
  price: 9800000,
  images: [`${ASSET}/earrings-travertino.webp`, `${ASSET}/earrings-emerald.webp`],
  specs: {
    stones: 'Esmeralda colombiana',
    stone: 'Esmeralda Coscuez',
    metal: 'Oro amarillo 18K',
    cut: 'Cojín',
    guarantee: 'Vitalicia'
  },
  description: 'La esmeralda en su gesto más puro: solitaria, sobre cuatro uñas de oro 18K. La pieza que se hereda sin pedir permiso a ninguna época.',
  story: ['Esmeraldas de Coscuez con verde profundo y "jardín" controlado. Talla cojín ovalada, 5x4mm cada una. Aceitadas con resina natural, certificado GIA opcional.']
}, {
  id: 'trinity-sapphire',
  slug: 'anillo-trinity-zafiro',
  name: 'Anillo Trinity Zafiro',
  collection: 'anillos',
  price: 14800000,
  images: [`${ASSET}/ring-sapphire.webp`, `${ASSET}/model-emerald.webp`, `${ASSET}/earrings-emerald.webp`],
  tag: 'Edición limitada',
  featured: true,
  specs: {
    stones: 'Zafiro · Diamantes',
    stone: 'Zafiro azul',
    metal: 'Oro 18K paladiado',
    edition: '12 piezas',
    size: 'Hecho a medida'
  },
  description: 'Tres aros entrelazados, tres significados que tú eliges. Una reinterpretación del gesto Trinity en oro 18K paladiado, coronada por un zafiro de corte real.',
  story: ['Inspirado en el Trinity de Cartier (1924), pero con tres aros del mismo tono de oro y un único zafiro central. Edición limitada a 12 piezas numeradas.']
}, {
  id: 'editorial-emerald',
  slug: 'collar-la-verde',
  name: 'Collar La Verde',
  collection: 'editorial',
  price: 38600000,
  images: [`${ASSET}/model-emerald.webp`, `${ASSET}/banner-hero.webp`, `${ASSET}/ring-sapphire.webp`],
  tag: 'Pieza única',
  featured: true,
  specs: {
    stones: '11 esmeraldas Muzo',
    accent: 'Diamantes GIA',
    metal: 'Oro amarillo 18K',
    piece: 'Única'
  },
  description: 'La pieza central de la campaña La Verde 2026: una cascada de esmeraldas briolette engarzadas en hilos de oro, diseñada para un único cuello en el mundo.',
  story: ['Diseñada por Kary Mendoza durante dos meses de bocetos antes de tocar el oro. Las once esmeraldas briolette fueron seleccionadas en Muzo a lo largo de medio año.', 'Cada hilo está tejido a mano. La pieza tomó 380 horas de orfebrería.']
}, {
  id: 'argolla-aurora',
  slug: 'argollas-aurora',
  name: 'Argollas Aurora',
  collection: 'argollas',
  price: 6200000,
  images: [`${ASSET}/banner.webp`, `${ASSET}/earrings-travertino.webp`],
  specs: {
    stones: 'Oro pulido',
    metal: 'Oro 18K · Ley 750',
    finish: 'Pulido espejo',
    section: 'Confort',
    engraving: 'Incluido'
  },
  description: 'La alianza no se elige para impresionar; se elige para durar. Oro 18K liso, sección confort, pensado para los 50 años que vienen.',
  story: ['Aleación europea estándar (oro 75%, plata 12.5%, paladio 12.5%) para resistencia estructural. Grabado interior incluido — fecha, iniciales o un verso.']
}, {
  id: 'dije-muzo',
  slug: 'dije-gota-muzo',
  name: 'Dije Gota de Muzo',
  collection: 'dijes-colgantes',
  price: 8900000,
  images: [`${ASSET}/gema.webp`, `${ASSET}/earrings-emerald.webp`],
  specs: {
    stones: 'Esmeralda briolette',
    stone: 'Esmeralda Muzo Vieja',
    chain: 'Veneciana 45cm',
    metal: 'Oro amarillo 18K'
  },
  description: 'Una sola gota de esmeralda briolette, suspendida de una cadena veneciana de oro 18K. La piedra gira con la luz; nunca se queda quieta.',
  story: ['Esmeralda briolette de 1.8 quilates, extraída de Muzo antes de 1990 ("Muzo Vieja"). Su transparencia es notablemente superior a las de mina contemporánea.']
}, {
  id: 'pulsera-tenis',
  slug: 'pulsera-tenis-diamante',
  name: 'Pulsera Tenis Diamante',
  collection: 'pulseras',
  price: 18600000,
  images: [`${ASSET}/ring-sapphire.webp`, `${ASSET}/banner.webp`],
  tag: 'Best Seller',
  specs: {
    stones: '54 diamantes',
    cut: 'Brillante 2.2mm',
    metal: 'Oro blanco 18K',
    clarity: 'VS · color G'
  },
  description: 'La pulsera tenis clásica, reinterpretada en proporciones más íntimas. 54 diamantes brillante en línea sobre oro blanco 18K.',
  story: ['Engaste tipo carril con doble seguro de mariposa. Pesa apenas 8.4 gramos pero refracta como una pieza tres veces más grande.']
}, {
  id: 'anillo-jardin',
  slug: 'anillo-jardin-esmeralda',
  name: 'Anillo Jardín Esmeralda',
  collection: 'anillos',
  price: 16400000,
  images: [`${ASSET}/earrings-emerald.webp`, `${ASSET}/model-emerald.webp`],
  featured: true,
  specs: {
    stones: 'Esmeralda · 8 diamantes',
    stone: 'Esmeralda Chivor',
    metal: 'Oro amarillo 18K',
    size: 'Hecho a medida'
  },
  description: 'Una esmeralda esmeralda-cut central enmarcada por ocho diamantes baguette que dibujan un jardín cuadrado.',
  story: ['Esmeralda de 1.6 quilates, talla esmeralda 7x5mm. Los diamantes baguette están engastados a presión sin uñas — un acabado que solo se logra en oro 18K bien aleado.']
}];

// Decorate products with back-compat shortcuts used by simpler components
PRODUCTS.forEach(p => {
  p.img = p.images && p.images[0];
  const col = COLLECTIONS.find(c => c.slug === p.collection);
  p.cat = col ? col.name : p.collection;
  p.stones = p.specs && p.specs.stones;
  p.gold = p.specs && p.specs.metal;
  p.gallery = p.images;
  p.desc = p.description;
});

// Catalog helpers (mirror of data.js API)
function getCollections() {
  return COLLECTIONS;
}
function getAll() {
  return PRODUCTS;
}
function getFeatured(n = 8) {
  return [...PRODUCTS].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).slice(0, n);
}
function countByCollection(slug) {
  return PRODUCTS.filter(p => p.collection === slug).length;
}
function getBySlug(slug) {
  return PRODUCTS.find(p => p.slug === slug || p.id === slug);
}
function getRelated(p, n = 3) {
  return PRODUCTS.filter(x => x.id !== p.id && x.collection === p.collection).slice(0, n);
}

// Marquee + services (used by home)
const MARQUEE = ['Oro 18K · Ley 750', 'Esmeraldas Colombianas', 'Asesoría Personalizada', 'Garantía Vitalicia', 'Atelier en Cartagena', 'Envío Asegurado Mundial', 'Una pieza, una historia'];
const SERVICES = [{
  t: 'Diseño a medida',
  d: 'Crea la pieza de tus sueños con nuestro atelier. Desde boceto hasta entrega.',
  icon: 'pen'
}, {
  t: 'Asesoría privada',
  d: 'Consulta 1:1 con nuestros gemólogos. Virtual o en nuestra casa en Cartagena.',
  icon: 'user'
}, {
  t: 'Certificación GIA',
  d: 'Cada pieza con diamante incluye certificado del Gemological Institute.',
  icon: 'check'
}, {
  t: 'Garantía vitalicia',
  d: 'Mantenimiento, pulido y verificación de piedras de por vida.',
  icon: 'shield'
}];

// Atelier — 4-step process
const ATELIER = [{
  n: '01',
  t: 'El Diseño y Concepto',
  d: 'Concebimos la joya desde el boceto inicial sobre papel, seleccionando metales nobles y gemas con carácter propio.'
}, {
  n: '02',
  t: 'Asesoría Confidencial',
  d: 'Un diálogo íntimo y pausado para dar con la pieza exacta que refleje tu legado.'
}, {
  n: '03',
  t: 'Garantía y Certificación',
  d: 'Respaldamos cada piedra con reportes internacionales de la GIA y origen de mina.'
}, {
  n: '04',
  t: 'Custodia de por vida',
  d: 'Mantenimiento, pulido y restauración vitalicia. Nuestras piezas nacen con vocación de eternidad.'
}];

// The Bersaglio Journal — subset of production js/data/journal.js
const JOURNAL_TICKER = ['Nuevo: Colección Atrato 2026 disponible', 'Live · Subasta privada Casa Bersaglio 14·04', 'Guía: 7 mitos sobre las esmeraldas colombianas', 'Atelier abierto · Cartagena · Cita previa'];
const JOURNAL = [{
  slug: 'esmeraldas-historia-oculta',
  section: 'Reportaje',
  kicker: 'Las gemas que cambiaron Cartagena',
  title: 'Esmeraldas: la historia oculta detrás del verde colombiano',
  excerpt: 'Un viaje al corazón de Muzo y Coscuez, donde la geología, la herencia indígena y el oficio artesanal convergen para producir las esmeraldas más codiciadas del planeta.',
  date: '14·03·26',
  dateLong: 'Marzo 2026',
  read: '8 min',
  author: 'María Camila Bersaglio',
  authorRole: 'Directora editorial',
  img: `${ASSET}/earrings-emerald.webp`,
  featured: true
}, {
  slug: 'seis-pulsos-anillo',
  section: 'Atelier',
  kicker: 'Detrás del taller',
  title: 'Los seis pulsos de un anillo a medida',
  excerpt: 'Desde el boceto hasta la entrega, así viaja una pieza por las manos de cuatro oficios.',
  date: '12·03·26',
  dateLong: 'Marzo 2026',
  read: '5 min',
  author: 'Andrés Beltrán',
  authorRole: 'Diseñador atelier',
  img: `${ASSET}/ring-sapphire.webp`
}, {
  slug: 'oro-18k-vs-14k',
  section: 'Mercado',
  kicker: 'Patrimonio',
  title: 'Por qué el oro 18K supera al 14K en patrimonio',
  excerpt: 'Una diferencia de 4 quilates parece menor — pero a treinta años, la prima del 18K se nota en color, estructura y valor.',
  date: '06·03·26',
  dateLong: 'Marzo 2026',
  read: '4 min',
  author: 'Kary Mendoza',
  authorRole: 'Directora',
  img: `${ASSET}/banner-hero.webp`
}, {
  slug: 'trinity-cartier',
  section: 'Diseño',
  kicker: 'Historia del diseño',
  title: 'Trinity: la geometría que enamoró a Cartier',
  excerpt: 'Tres anillos entrelazados, tres metales, tres significados.',
  date: '28·02·26',
  dateLong: 'Febrero 2026',
  read: '6 min',
  author: 'María Camila Bersaglio',
  authorRole: 'Directora editorial',
  img: `${ASSET}/model-emerald.webp`
}, {
  slug: 'rituales-diamante',
  section: 'Cuidado',
  kicker: 'Mantenimiento',
  title: 'Rituales caseros para conservar el fuego de tu diamante',
  excerpt: 'Una rutina mensual de tres pasos para que tu diamante mantenga el brillo del primer día.',
  date: '19·02·26',
  dateLong: 'Febrero 2026',
  read: '3 min',
  author: 'Lucía Restrepo',
  authorRole: 'Gemóloga GIA',
  img: `${ASSET}/earrings-travertino.webp`
}, {
  slug: 'paciencia-geologica',
  section: 'Entrevista',
  kicker: 'Conversaciones del atelier',
  title: '"La esmeralda es paciencia geológica"',
  excerpt: 'Andrés Forero, gemólogo GIA con 18 años de oficio, sobre cómo leer una piedra.',
  date: '14·02·26',
  dateLong: 'Febrero 2026',
  read: '9 min',
  author: 'María Camila Bersaglio',
  authorRole: 'Directora editorial',
  img: `${ASSET}/gema.webp`
}];
const JOURNAL_ISSUE = {
  number: 'Issue Nº 14',
  date: 'Marzo 2026',
  est: 'EST. 2014'
};

// ── Bersaglio Films · multimedia (videos) ──────────────────────────
const VIDEO_CATEGORIES = ['Todos', 'Atelier', 'Educativo', 'Colección', 'Ofertas', 'Inventario'];
const VIDEOS = [{
  id: 'v-laverde',
  title: 'El nacimiento de La Verde',
  cat: 'Atelier',
  dur: '4:12',
  thumb: `${ASSET}/model-emerald.webp`,
  featured: true,
  desc: '380 horas de orfebrería condensadas en un cortometraje. La pieza central de la campaña 2026, de la mina al cuello.'
}, {
  id: 'v-leer',
  title: 'Cómo leer una esmeralda',
  cat: 'Educativo',
  dur: '6:30',
  thumb: `${ASSET}/gema.webp`
}, {
  id: 'v-atrato',
  title: 'Colección Atrato · 2026',
  cat: 'Colección',
  dur: '1:45',
  thumb: `${ASSET}/earrings-emerald.webp`
}, {
  id: 'v-argollas',
  title: '−15% en argollas de boda',
  cat: 'Ofertas',
  dur: '0:30',
  thumb: `${ASSET}/banner.webp`,
  badge: 'Oferta'
}, {
  id: 'v-pave',
  title: 'Detrás del engaste pavé',
  cat: 'Atelier',
  dur: '3:20',
  thumb: `${ASSET}/ring-sapphire.webp`
}, {
  id: 'v-muzo',
  title: 'Muzo vs Coscuez: el verde decide',
  cat: 'Educativo',
  dur: '5:10',
  thumb: `${ASSET}/earrings-travertino.webp`
}, {
  id: 'v-inventario',
  title: 'Esmeraldas disponibles esta semana',
  cat: 'Inventario',
  dur: '2:00',
  thumb: `${ASSET}/collage.webp`,
  badge: 'En vivo'
}, {
  id: 'v-historia',
  title: 'Una pieza, una historia',
  cat: 'Atelier',
  dur: '2:48',
  thumb: `${ASSET}/banner-hero.webp`
}];

// ── Social feed (latest posts; in production fed from Meta/TikTok APIs → Firestore) ──
const SOCIAL_PLATFORMS = ['Todas', 'Instagram', 'Facebook', 'TikTok'];
const SOCIAL = [{
  platform: 'Instagram',
  thumb: `${ASSET}/earrings-emerald.webp`,
  caption: 'Topos Halo recién salidos del atelier ✨',
  stat: '2.4k',
  kind: 'likes',
  date: 'hace 2 h',
  type: 'reel'
}, {
  platform: 'TikTok',
  thumb: `${ASSET}/gema.webp`,
  caption: 'POV: ves una Muzo Vieja por primera vez',
  stat: '38.1k',
  kind: 'views',
  date: 'hace 5 h',
  type: 'video'
}, {
  platform: 'Instagram',
  thumb: `${ASSET}/ring-sapphire.webp`,
  caption: 'El zafiro Trinity, edición de 12 piezas',
  stat: '1.9k',
  kind: 'likes',
  date: 'ayer',
  type: 'photo'
}, {
  platform: 'Facebook',
  thumb: `${ASSET}/model-emerald.webp`,
  caption: 'Nuestro atelier te espera con un café',
  stat: '512',
  kind: 'likes',
  date: 'ayer',
  type: 'photo'
}, {
  platform: 'TikTok',
  thumb: `${ASSET}/banner-hero.webp`,
  caption: 'Cartagena al atardecer desde el atelier',
  stat: '64.7k',
  kind: 'views',
  date: 'hace 2 d',
  type: 'video'
}, {
  platform: 'Instagram',
  thumb: `${ASSET}/earrings-travertino.webp`,
  caption: 'Detalle: engaste pavé a 40x de aumento',
  stat: '3.1k',
  kind: 'likes',
  date: 'hace 3 d',
  type: 'reel'
}, {
  platform: 'Facebook',
  thumb: `${ASSET}/collage.webp`,
  caption: 'Colección Atrato 2026 · ya disponible',
  stat: '847',
  kind: 'likes',
  date: 'hace 4 d',
  type: 'photo'
}, {
  platform: 'TikTok',
  thumb: `${ASSET}/banner.webp`,
  caption: 'Cómo limpiar tu esmeralda en casa',
  stat: '22.5k',
  kind: 'views',
  date: 'hace 5 d',
  type: 'video'
}];
const fmt$ = n => '$ ' + Number(n).toLocaleString('es-CO') + ' COP';
const fmtShort = n => '$ ' + (n / 1000000).toFixed(1).replace('.0', '') + 'M';

// Legacy alias used by simplified Home/Catalog screens
const CATEGORIES = COLLECTIONS.map(c => ({
  name: c.name,
  slug: c.slug,
  img: PRODUCTS.find(p => p.collection === c.slug)?.img || `${ASSET}/banner.webp`
}));
Object.assign(window, {
  COLLECTIONS,
  CATEGORIES,
  PRODUCTS,
  MARQUEE,
  SERVICES,
  ATELIER,
  JOURNAL,
  JOURNAL_TICKER,
  JOURNAL_ISSUE,
  VIDEOS,
  VIDEO_CATEGORIES,
  SOCIAL,
  SOCIAL_PLATFORMS,
  getCollections,
  getAll,
  getFeatured,
  countByCollection,
  getBySlug,
  getRelated,
  fmt$,
  fmtShort
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_bersaglio_redesign/components/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/Overlays.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React, PRODUCTS, fmt$, IconSearch, IconClose, IconArrow, IconHeart, IconShield, IconCheck, IconPin */
// Bersaglio storefront — Fase 3 overlays: ⌘K command palette + quick-view modal.

// ════════════════════════════════════════════════════════════════════
// SEARCH PALETTE (⌘K) — reuses production .bj-search-* classes
// ════════════════════════════════════════════════════════════════════
function SearchPalette({
  open,
  onClose,
  onOpen
}) {
  const [q, setQ] = React.useState('');
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef(null);
  const results = React.useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return PRODUCTS.slice(0, 5);
    return PRODUCTS.filter(p => (p.name + ' ' + p.cat + ' ' + p.stones).toLowerCase().includes(t)).slice(0, 6);
  }, [q]);
  React.useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      setTimeout(() => inputRef.current && inputRef.current.focus(), 60);
    }
  }, [open]);
  React.useEffect(() => {
    setActive(0);
  }, [q]);
  const onKey = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(a => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      onOpen(results[active].id);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: 'bj-search-backdrop' + (open ? ' is-open' : ''),
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-search-panel glass",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-search-input-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bj-search-icon"
  }, /*#__PURE__*/React.createElement(IconSearch, {
    size: 18
  })), /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    className: "bj-search-input",
    placeholder: "Buscar piezas, colecciones, gemas\u2026",
    value: q,
    onChange: e => setQ(e.target.value),
    onKeyDown: onKey
  }), /*#__PURE__*/React.createElement("span", {
    className: "bj-search-kbd"
  }, "ESC")), /*#__PURE__*/React.createElement("div", {
    className: "bj-search-results"
  }, results.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "bj-search-empty"
  }, "Sin resultados para \"", q, "\". Prueba con \"esmeralda\" o \"anillo\"."), results.map((p, i) => /*#__PURE__*/React.createElement("a", {
    key: p.id,
    className: 'bj-search-result' + (i === active ? ' is-active' : ''),
    onMouseEnter: () => setActive(i),
    onClick: () => onOpen(p.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-search-result-img",
    style: {
      backgroundImage: `url(${p.img})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "bj-search-result-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-search-result-name"
  }, p.name), /*#__PURE__*/React.createElement("div", {
    className: "bj-search-result-meta"
  }, p.cat, " \xB7 ", p.stones)), /*#__PURE__*/React.createElement("div", {
    className: "bj-search-result-price mono"
  }, fmt$(p.price))))), /*#__PURE__*/React.createElement("div", {
    className: "bj-search-hint"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("kbd", null, "\u2191"), /*#__PURE__*/React.createElement("kbd", null, "\u2193"), " navegar"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("kbd", null, "\u21B5"), " abrir"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("kbd", null, "esc"), " cerrar"))));
}

// ════════════════════════════════════════════════════════════════════
// QUICK-VIEW MODAL
// ════════════════════════════════════════════════════════════════════
function QuickView({
  product,
  onClose,
  addToCart,
  toggleWish,
  wished,
  onFull
}) {
  const [active, setActive] = React.useState(0);
  React.useEffect(() => {
    setActive(0);
  }, [product && product.id]);
  const open = !!product;
  const gallery = product ? product.gallery || [product.img] : [];
  return /*#__PURE__*/React.createElement("div", {
    className: 'k-qv-backdrop' + (open ? ' is-open' : ''),
    onClick: onClose
  }, product && /*#__PURE__*/React.createElement("div", {
    className: "k-qv glass-iridescent",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "k-qv-close",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(IconClose, {
    size: 14
  })), /*#__PURE__*/React.createElement("div", {
    className: "k-qv-visual"
  }, gallery.map((g, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      backgroundImage: `url(${g})`,
      opacity: i === active ? 1 : 0
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "k-qv-thumbs"
  }, gallery.map((g, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: 'k-qv-thumb' + (i === active ? ' on' : ''),
    style: {
      backgroundImage: `url(${g})`
    },
    onClick: () => setActive(i)
  })))), /*#__PURE__*/React.createElement("div", {
    className: "k-qv-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-qv-cat"
  }, product.cat), /*#__PURE__*/React.createElement("div", {
    className: "k-qv-name"
  }, product.name), /*#__PURE__*/React.createElement("div", {
    className: "k-qv-price"
  }, fmt$(product.price)), /*#__PURE__*/React.createElement("p", {
    className: "k-qv-desc"
  }, product.desc), /*#__PURE__*/React.createElement("div", {
    className: "k-qv-specs"
  }, Object.entries(product.specs).map(([k, v]) => /*#__PURE__*/React.createElement("span", {
    className: "k-qv-spec",
    key: k
  }, k, ": ", /*#__PURE__*/React.createElement("b", null, v)))), /*#__PURE__*/React.createElement("div", {
    className: "k-qv-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => addToCart(product)
  }, "A\xF1adir al carrito"), /*#__PURE__*/React.createElement("button", {
    className: 'btn-aqua' + (wished ? ' btn-aqua-gold' : ''),
    onClick: () => toggleWish(product.id)
  }, /*#__PURE__*/React.createElement(IconHeart, {
    size: 14,
    fill: wished ? 'currentColor' : 'none'
  }), " ", wished ? 'Guardada' : 'Guardar'), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua",
    onClick: () => onFull(product.id)
  }, "Ver pieza completa ", /*#__PURE__*/React.createElement(IconArrow, {
    size: 12
  }))))));
}

// ════════════════════════════════════════════════════════════════════
// QUICK DOCK — fixed water droplet; hover tilts its top toward the cursor;
// click opens a small irregular water-glass strip of concierge tools
// ════════════════════════════════════════════════════════════════════
function QuickDock({
  navigate,
  onSearch
}) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState(null);
  const anchorRef = React.useRef(null);
  const dragRef = React.useRef(null);
  const islandRef = React.useRef(null);
  const peakRef = React.useRef(null);
  const liquidRef = React.useRef(null);
  const close = () => setOpen(false);
  const run = fn => {
    close();
    setTimeout(fn, 150);
  };
  const onMove = e => {
    const d = dragRef.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 4) d.moved = true;
    if (d.moved) {
      const x = Math.max(8, Math.min(window.innerWidth - d.w - 8, e.clientX - d.offX));
      const y = Math.max(8, Math.min(window.innerHeight - d.h - 8, e.clientY - d.offY));
      setPos({
        x,
        y
      });
    }
  };
  const onUp = () => {
    const d = dragRef.current;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    if (d && !d.moved) setOpen(v => !v);
    dragRef.current = null;
  };
  const onDown = e => {
    const a = anchorRef.current;
    if (!a) return;
    const r = a.getBoundingClientRect();
    dragRef.current = {
      sx: e.clientX,
      sy: e.clientY,
      offX: e.clientX - r.left,
      offY: e.clientY - r.top,
      w: r.width,
      h: r.height,
      moved: false
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    e.preventDefault();
  };
  const poke = e => {
    if (open || dragRef.current) return;
    const isl = islandRef.current;
    if (!isl) return;
    const dx = Math.max(-1, Math.min(1, (e.clientX - (isl.getBoundingClientRect().left + isl.offsetWidth / 2)) / (isl.offsetWidth / 2)));
    isl.style.setProperty('--gx', 50 + dx * 30 + '%');
  };
  const unpoke = () => {
    const isl = islandRef.current;
    if (isl) isl.style.removeProperty('--gx');
  };
  const ic = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  };
  const tools = [{
    label: 'Buscar',
    icon: /*#__PURE__*/React.createElement("svg", _extends({
      width: "19",
      height: "19",
      viewBox: "0 0 24 24"
    }, ic), /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m21 21-4.3-4.3"
    })),
    onClick: () => run(onSearch)
  }, {
    label: 'WhatsApp',
    cls: 'qd-tool--wa',
    href: 'https://wa.me/573013752592',
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "19",
      viewBox: "0 0 24 24",
      fill: "currentColor"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.515 5.26l-.999 3.648 3.973-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"
    }))
  }, {
    label: 'Cita',
    cls: 'qd-tool--gold',
    icon: /*#__PURE__*/React.createElement("svg", _extends({
      width: "19",
      height: "19",
      viewBox: "0 0 24 24"
    }, ic), /*#__PURE__*/React.createElement("path", {
      d: "M8 2v4M16 2v4"
    }), /*#__PURE__*/React.createElement("rect", {
      width: "18",
      height: "18",
      x: "3",
      y: "4",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 10h18"
    })),
    onClick: () => run(() => navigate('contacto'))
  }, {
    label: 'Favoritos',
    icon: /*#__PURE__*/React.createElement("svg", _extends({
      width: "19",
      height: "19",
      viewBox: "0 0 24 24"
    }, ic), /*#__PURE__*/React.createElement("path", {
      d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
    })),
    onClick: () => run(() => navigate('lista-deseos'))
  }, {
    label: 'Arriba',
    icon: /*#__PURE__*/React.createElement("svg", _extends({
      width: "19",
      height: "19",
      viewBox: "0 0 24 24"
    }, ic), /*#__PURE__*/React.createElement("path", {
      d: "m5 12 7-7 7 7"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 19V5"
    })),
    onClick: () => run(() => window.scrollTo({
      top: 0,
      behavior: 'smooth'
    }))
  }];
  const anchorStyle = pos ? {
    position: 'fixed',
    left: pos.x + 'px',
    top: pos.y + 'px',
    bottom: 'auto',
    transform: 'none'
  } : undefined;
  return /*#__PURE__*/React.createElement("div", {
    className: 'qd' + (open ? ' open' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "qd-backdrop",
    onClick: close
  }), /*#__PURE__*/React.createElement("div", {
    className: 'qd-anchor' + (pos ? ' dragged' : ''),
    ref: anchorRef,
    style: anchorStyle
  }, /*#__PURE__*/React.createElement("div", {
    className: "qd-strip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "qd-tools"
  }, tools.map((t, i) => t.href ? /*#__PURE__*/React.createElement("a", {
    key: i,
    className: 'qd-tool ' + (t.cls || ''),
    href: t.href,
    target: "_blank",
    rel: "noopener",
    onClick: close
  }, /*#__PURE__*/React.createElement("span", {
    className: "qd-tool-ic"
  }, t.icon), /*#__PURE__*/React.createElement("span", {
    className: "qd-tool-label"
  }, t.label)) : /*#__PURE__*/React.createElement("button", {
    key: i,
    className: 'qd-tool ' + (t.cls || ''),
    onClick: t.onClick
  }, /*#__PURE__*/React.createElement("span", {
    className: "qd-tool-ic"
  }, t.icon), /*#__PURE__*/React.createElement("span", {
    className: "qd-tool-label"
  }, t.label))))), /*#__PURE__*/React.createElement("button", {
    ref: islandRef,
    className: "qd-island",
    onPointerDown: onDown,
    onPointerMove: poke,
    onPointerLeave: unpoke,
    "aria-label": "Atajos \xB7 arrastra para mover, clic para abrir",
    "aria-expanded": open
  }, /*#__PURE__*/React.createElement("span", {
    className: "qd-island-liquid",
    ref: liquidRef,
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 82 30",
    preserveAspectRatio: "none"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
    id: "qd-wclip"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "0",
    width: "82",
    height: "30",
    rx: "15"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "qd-air",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "rgba(248,224,138,0.92)"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "0.55",
    stopColor: "rgba(248,224,138,0)"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "qd-wgrad",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "rgba(126,222,168,0.96)"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "rgba(30,138,91,1)"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "qd-gold",
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "0"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "rgba(244,214,122,0)"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "0.5",
    stopColor: "rgba(248,222,142,0.95)"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "rgba(244,214,122,0)"
  }))), /*#__PURE__*/React.createElement("g", {
    clipPath: "url(#qd-wclip)"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "0",
    width: "82",
    height: "30",
    fill: "url(#qd-air)"
  }), /*#__PURE__*/React.createElement("path", {
    className: "qd-wave qd-wave-back",
    fill: "rgba(28,116,82,0.85)",
    d: "M0 14 C 16 10, 25 10, 41 14 S 66 18, 82 14 S 107 10, 123 14 S 148 18, 164 14 V30 H0 Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: "qd-wave qd-wave-front",
    fill: "url(#qd-wgrad)",
    d: "M0 15 C 16 19, 25 19, 41 15 S 66 11, 82 15 S 107 19, 123 15 S 148 11, 164 15 V30 H0 Z"
  }), /*#__PURE__*/React.createElement("path", {
    className: "qd-wave qd-wave-gold",
    fill: "none",
    stroke: "url(#qd-gold)",
    strokeWidth: "2.2",
    d: "M0 14 C 16 10, 25 10, 41 14 S 66 18, 82 14 S 107 10, 123 14 S 148 18, 164 14"
  }), /*#__PURE__*/React.createElement("path", {
    className: "qd-wave qd-wave-gold2",
    fill: "none",
    stroke: "url(#qd-gold)",
    strokeWidth: "1.4",
    d: "M0 17 C 16 14, 25 14, 41 17 S 66 20, 82 17 S 107 14, 123 17 S 148 20, 164 17"
  })))), /*#__PURE__*/React.createElement("span", {
    className: "qd-island-sheen",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: "qd-island-label",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/emerald-gem.png",
    alt: ""
  }))), /*#__PURE__*/React.createElement("span", {
    className: "qd-caption",
    "aria-hidden": "true"
  }, "atajos")), /*#__PURE__*/React.createElement("svg", {
    className: "qd-goo",
    width: "0",
    height: "0",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("filter", {
    id: "qd-goo"
  }, /*#__PURE__*/React.createElement("feGaussianBlur", {
    in: "SourceGraphic",
    stdDeviation: "6",
    result: "b"
  }), /*#__PURE__*/React.createElement("feColorMatrix", {
    in: "b",
    mode: "matrix",
    values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 12 -5"
  })))));
}
Object.assign(window, {
  SearchPalette,
  QuickView,
  QuickDock
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/Overlays.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/Pages.jsx
try { (() => {
/* global React, IconArrow */
// Bersaglio storefront — Pages.jsx · faithful mirrors of production pages.
// Loaded after Shell.jsx, Screens.jsx, Sections.jsx, Overlays.jsx.

// ════════════════════════════════════════════════════════════════════
// NOSOTROS — mirror of js/pages/nosotros.js (11 sections)
// ════════════════════════════════════════════════════════════════════
const NOS_CHAPTERS = [{
  y: '2013',
  t: 'El Diálogo Inicial',
  d: 'El taller comenzó con un sueño, dedicación y visitas personalizadas directamente en los hogares de nuestros clientes. Este contacto íntimo nos enseñó que antes que una joya, el huésped busca sentirse seguro, asesorado y acompañado en su elección.'
}, {
  y: '2016',
  t: 'La Consagración del Espacio',
  d: 'Gracias a esta filosofía de servicio y cercanía, crecimos paso a paso. Abrimos las puertas de nuestro primer atelier privado en el centro histórico de Cartagena, un refugio para mantener esa atención pausada e individual.'
}, {
  y: '2020',
  t: 'Estándares y Confianza',
  d: 'Consolidamos nuestra reputación basándonos en la transparencia absoluta de cada gema. Cada esmeralda y diamante se entrega con trazabilidad total y certificación ética, reforzando la credibilidad y el valor real de cada inversión.'
}, {
  y: '2023',
  t: 'Una Década de Relaciones',
  d: 'Cumplimos diez años de trayectoria construyendo vínculos duraderos. El acompañamiento y asesoramiento personalizado se consolidan formalmente como el corazón absoluto de Bersaglio.'
}, {
  y: '2026',
  t: 'La Verde y la Esencia',
  d: 'Hoy, seguimos conservando intacta la misma esencia con la que iniciamos: ofrecer una experiencia cercana, elegante y completamente personalizada, donde cada cliente se siente especial y cada joya tiene un significado real.'
}];
const NOS_VALORES = [{
  n: '01',
  t: 'La Elegancia como Silencio',
  d: 'Entendemos la sofisticación no como un destello ruidoso, sino como un susurro de distinción. Una joya Bersaglio es la expresión poética de tu estilo y de tu esencia.'
}, {
  n: '02',
  t: 'El Pacto de Credibilidad',
  d: 'Construimos relaciones duraderas basadas en la transparencia, la credibilidad y una confianza inquebrantable que custodia tu tranquilidad.'
}, {
  n: '03',
  t: 'La Asesoría antes del Oficio',
  d: 'Antes que vender, nos dedicamos a guiarte y asesorarte con paciencia, asegurando que cada cliente encuentre o co-cree la pieza idónea.'
}, {
  n: '04',
  t: 'Devoción en cada Detalle',
  d: 'Cada milímetro esculpido y cada interacción con nosotros está cuidada con devoción, buscando hacer de tu experiencia un recuerdo memorable.'
}, {
  n: '05',
  t: 'Cómplices de tu Felicidad',
  d: 'Nos apasiona ser parte de tus momentos más significativos. Diseñamos con el orgullo de dar forma física a tus emociones y celebraciones sagradas.'
}, {
  n: '06',
  t: 'Valor e Inversión Eterna',
  d: 'Transmitimos a nuestros clientes que una joya no es un gasto efímero, sino una inversión duradera que conserva e incrementa su significado y valor en el tiempo.'
}];
const NOS_EQUIPO = [{
  n: 'Kary Mendoza',
  r: 'Fundadora & Directora',
  b: 'Diez años dedicada a escuchar con empatía las historias de nuestros clientes para traducirlas en obras de arte eternas. Su mirada sensible guía la selección de cada gema y supervisa el detalle final de cada pieza.'
}, {
  n: 'Maestro Eliécer Patiño',
  r: 'Orfebre principal',
  b: 'Treinta y dos años de maestría y devoción orfebre. Formado bajo la tradición de la filigrana en Mompox y perfeccionado en Cartagena, domina la fundición a cera perdida y el engaste pavé de alta precisión.'
}, {
  n: 'Lucía Restrepo',
  r: 'Gemóloga GIA',
  b: 'Certificada por el prestigioso Gemological Institute of America (GIA). Es la guardiana de la excelencia gemológica de la Maison, analizando la pureza, color y procedencia de cada esmeralda y diamante.'
}, {
  n: 'Andrés Beltrán',
  r: 'Diseño & dibujo técnico',
  b: 'Traduce las conversaciones íntimas del atelier en bocetos poéticos a mano alzada, planos técnicos y modelados 3D meticulosos, sirviendo de puente entre el deseo del cliente y el crisol del orfebre.'
}];
const NOS_RESENAS = [{
  n: 'Valentina Restrepo',
  t: 'Llegué sin saber muy bien qué quería y salí con la pieza de mis sueños. Kary entendió mi historia mejor que yo. El trato es de otro nivel.',
  loc: 'Reseña en Google Maps'
}, {
  n: 'Andrés Mejía',
  t: 'Mandé hacer el anillo de compromiso y superó todo lo que imaginaba. Se siente el amor por el oficio en cada detalle. Mil gracias.',
  loc: 'Reseña en Google Maps'
}, {
  n: 'Camila Tordecilla',
  t: 'Un lugar precioso en el Centro Histórico. Te reciben con un café y una paciencia que ya no se ve. La esmeralda quedó espectacular.',
  loc: 'Reseña en Google Maps'
}, {
  n: 'Juan Pablo Vergara',
  t: 'Calidad real y honestidad. Me explicaron cada piedra con su certificado. Volveré sin duda para la próxima ocasión especial.',
  loc: 'Reseña en Google Maps'
}];
const NOS_FAQS = [{
  q: '¿Cuánto tarda una pieza a medida?',
  a: 'Entre cuatro y seis semanas desde la aprobación del boceto. La primera conversación, los renders y los ajustes pueden sumar dos semanas adicionales. No aceleramos plazos: el oficio paciente no admite atajos.'
}, {
  q: '¿Trabajan con piedras del cliente?',
  a: 'Sí. Recibimos gemas heredadas, las evaluamos con nuestra gemóloga, y las integramos en una pieza nueva. Si la talla original tiene daños, ofrecemos retalle previo en taller especializado.'
}, {
  q: '¿Hacen envíos internacionales?',
  a: 'Sí, con seguro pleno declarado y entrega registrada por DHL Express o FedEx Priority. Despachamos a más de cuarenta países. Los aranceles del país destino corren por cuenta del cliente.'
}, {
  q: '¿Aceptan financiación?',
  a: 'Hasta tres cuotas sin interés con tarjetas locales. Para piezas sobre $50.000.000 COP estructuramos planes a seis o doce meses con entidades aliadas.'
}, {
  q: '¿Puedo visitar el atelier sin comprar?',
  a: 'Por supuesto. La cita previa es solo para garantizar que tengamos tiempo para ti. Recibirás un café, te mostraremos el taller, conocerás al maestro orfebre. Sin compromiso de compra.'
}, {
  q: '¿Qué garantía tienen las piezas?',
  a: 'Garantía de por vida en estructura y engaste. Si una piedra se afloja, la reparamos sin costo. Si una soldadura cede, la rehacemos. Mientras Bersaglio exista, tu pieza tiene casa.'
}];
const NOS_STATS = [{
  n: '13',
  l: 'años de oficio',
  s: 'desde 2013'
}, {
  n: '+1.200',
  l: 'piezas entregadas',
  s: 'con libreta de origen'
}, {
  n: '40',
  l: 'países alcanzados',
  s: 'envíos asegurados'
}, {
  n: '100%',
  l: 'trazabilidad',
  s: 'gema · oro · orfebre'
}];
const NOS_CERTS = [{
  t: 'Jewelers of America',
  d: 'Miembro acreditado desde 2020'
}, {
  t: 'GIA',
  d: 'Reportes gemológicos en cada diamante'
}, {
  t: 'Muzo Origin',
  d: 'Certificación de mina en cada esmeralda'
}, {
  t: 'Responsible Jewellery Council',
  d: 'Trazabilidad de oro y prácticas éticas'
}];
const avatarInitials = name => {
  const parts = name.trim().split(/\s+/);
  return (parts[0] && parts[0][0] || '') + (parts[parts.length - 1] && parts[parts.length - 1][0] || '');
};
function NosotrosScreen({
  navigate
}) {
  const [activeChapter, setActiveChapter] = React.useState(0);
  const [openFaq, setOpenFaq] = React.useState(0);
  const c = NOS_CHAPTERS[activeChapter];
  return /*#__PURE__*/React.createElement("div", {
    className: "container abt-page"
  }, /*#__PURE__*/React.createElement("section", {
    className: "abt-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-hero-text"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono abt-eyebrow"
  }, "CAP\xCDTULO 00 \xB7 NUESTRA ALMA"), /*#__PURE__*/React.createElement("h1", {
    className: "abt-hero-title"
  }, "Un legado", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text abt-hero-title-em"
  }, "se susurra,"), /*#__PURE__*/React.createElement("br", null), "no se compra."), /*#__PURE__*/React.createElement("p", {
    className: "abt-hero-lead"
  }, "Nacimos con una visi\xF3n clara: acercar piezas \xFAnicas a quienes aprecian la elegancia y el valor de una joya aut\xE9ntica. Nuestro viaje comenz\xF3 desde cero, visitando a nuestros clientes en la calidez de sus hogares, construyendo relaciones basadas en la confianza y en una cercan\xEDa que hoy se mantiene como el alma del atelier."), /*#__PURE__*/React.createElement("p", {
    className: "abt-hero-italic"
  }, "M\xE1s que vender joyas, nos apasiona asesorar. Dise\xF1amos con la convicci\xF3n de que una pieza no es un simple accesorio, sino un reflejo de tu esencia, una emoci\xF3n duradera y una inversi\xF3n que trasciende en el tiempo."), /*#__PURE__*/React.createElement("div", {
    className: "abt-hero-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => navigate('contacto')
  }, "Agendar una visita ", /*#__PURE__*/React.createElement(IconArrow, {
    size: 14
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua",
    onClick: () => navigate('catalogo')
  }, "Ver colecciones"))), /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent abt-hero-image"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-hero-image-bg"
  }), /*#__PURE__*/React.createElement("div", {
    className: "abt-hero-image-shade"
  }), /*#__PURE__*/React.createElement("div", {
    className: "abt-hero-image-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono abt-hero-image-eyebrow"
  }, "ATELIER \xB7 CARTAGENA DE INDIAS"), /*#__PURE__*/React.createElement("div", {
    className: "abt-hero-quote"
  }, "\"Nuestra casa es tu casa.\""), /*#__PURE__*/React.createElement("div", {
    className: "mono abt-hero-quote-author"
  }, "\u2014 KARY MENDOZA")))), /*#__PURE__*/React.createElement("section", {
    className: "glass abt-stats"
  }, NOS_STATS.map((k, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: 'abt-stat' + (i > 0 ? ' abt-stat--bordered' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "display abt-stat-num"
  }, k.n), /*#__PURE__*/React.createElement("div", {
    className: "abt-stat-label"
  }, k.l), /*#__PURE__*/React.createElement("div", {
    className: "mono abt-stat-sub"
  }, k.s)))), /*#__PURE__*/React.createElement("section", {
    className: "abt-manifiesto"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "abt-manifiesto-title"
  }, "Sostenemos que el lujo aut\xE9ntico carece de estridencias.", ' ', /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "Es un secreto compartido entre dos personas"), ", esbozado en la calidez de nuestro atelier, donde el tiempo se detiene para dar vida a una creaci\xF3n que trascender\xE1 nuestra propia existencia."), /*#__PURE__*/React.createElement("div", {
    className: "abt-manifiesto-divider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "mono abt-manifiesto-foot"
  }, "MAISON BERSAGLIO \xB7 CARTAGENA DE INDIAS")), /*#__PURE__*/React.createElement("section", {
    className: "abt-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "filosofia-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent val-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono val-card-num"
  }, "MISI\xD3N"), /*#__PURE__*/React.createElement("h3", {
    className: "val-card-title"
  }, "Nuestra Promesa"), /*#__PURE__*/React.createElement("p", {
    className: "val-card-desc"
  }, "Concebir piezas exclusivas mediante una asesor\xEDa \xEDntima y cercana. Acompa\xF1amos a nuestros clientes en la elecci\xF3n de joyas que representen su distinci\xF3n y los instantes m\xE1s valiosos de su vida, asegurando siempre una experiencia de confianza, calidad y emotividad perdurable.")), /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent val-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono val-card-num"
  }, "VISI\xD3N"), /*#__PURE__*/React.createElement("h3", {
    className: "val-card-title"
  }, "El Horizonte"), /*#__PURE__*/React.createElement("p", {
    className: "val-card-desc"
  }, "Ser el atelier de alta joyer\xEDa personalizada de referencia en excelencia y discreci\xF3n, consolidando un acompa\xF1amiento generacional que perpet\xFAa el legado emocional de nuestros clientes a trav\xE9s de piezas de autor \xFAnicas que vencen al tiempo.")))), /*#__PURE__*/React.createElement("section", {
    className: "abt-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-section-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono abt-eyebrow"
  }, "NUESTROS PRINCIPIOS"), /*#__PURE__*/React.createElement("h2", {
    className: "abt-section-title"
  }, "Seis cosas en las que ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "no negociamos"))), /*#__PURE__*/React.createElement("div", {
    className: "val-grid"
  }, NOS_VALORES.map(v => /*#__PURE__*/React.createElement("div", {
    key: v.n,
    className: "glass glass-iridescent val-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "val-card-num-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono val-card-num"
  }, v.n), /*#__PURE__*/React.createElement("div", {
    className: "val-card-line"
  })), /*#__PURE__*/React.createElement("div", {
    className: "val-card-title"
  }, v.t), /*#__PURE__*/React.createElement("p", {
    className: "val-card-desc"
  }, v.d))))), /*#__PURE__*/React.createElement("section", {
    className: "abt-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-section-header"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "abt-section-title"
  }, "Trece a\xF1os en ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "cinco cap\xEDtulos"))), /*#__PURE__*/React.createElement("div", {
    className: "glass abt-timeline"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-timeline-tabs"
  }, NOS_CHAPTERS.map((ch, i) => /*#__PURE__*/React.createElement("button", {
    key: ch.y,
    type: "button",
    className: 'abt-timeline-tab' + (i === activeChapter ? ' is-active' : ''),
    onClick: () => setActiveChapter(i)
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono abt-timeline-tab-year"
  }, ch.y), ch.t))), /*#__PURE__*/React.createElement("div", {
    className: "abt-timeline-content tl-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-timeline-side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "display abt-timeline-year"
  }, c.y), /*#__PURE__*/React.createElement("div", {
    className: "abt-timeline-divider"
  })), /*#__PURE__*/React.createElement("div", {
    className: "abt-timeline-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-timeline-title"
  }, c.t), /*#__PURE__*/React.createElement("p", {
    className: "abt-timeline-desc"
  }, c.d))))), /*#__PURE__*/React.createElement("section", {
    className: "atl-split"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent atl-image"
  }, /*#__PURE__*/React.createElement("div", {
    className: "atl-image-bg"
  }), /*#__PURE__*/React.createElement("div", {
    className: "chip glass-pill atl-chip"
  }, "El Atelier")), /*#__PURE__*/React.createElement("div", {
    className: "glass atl-text"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "atl-text-title"
  }, "Donde el oficio", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "toma forma")), /*#__PURE__*/React.createElement("p", {
    className: "atl-text-p"
  }, "En el coraz\xF3n del Centro Hist\xF3rico de Cartagena tenemos nuestra casa: un espacio abierto al p\xFAblico donde te recibimos con calma y una atenci\xF3n c\xE1lida y personalizada. Aqu\xED se conversa, se dise\xF1a y se crea \u2014 porque en Bersaglio no revendemos: fabricamos cada pieza."), /*#__PURE__*/React.createElement("p", {
    className: "atl-text-p"
  }, "Kary y su equipo acompa\xF1an cada paso: desde la primera conversaci\xF3n y el boceto a mano, hasta dar vida a la joya y entregarla firmada. Un proceso cercano, sin prisas y hecho a la medida de tu historia."), /*#__PURE__*/React.createElement("div", {
    className: "atl-stats"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mono atl-stat-key"
  }, "UBICACI\xD3N"), /*#__PURE__*/React.createElement("div", {
    className: "atl-stat-val"
  }, "Cartagena de Indias", /*#__PURE__*/React.createElement("br", null), "Calle 36 # 6-32", /*#__PURE__*/React.createElement("br", null), "San Agust\xEDn Chiquita \xB7 Centro Hist\xF3rico", /*#__PURE__*/React.createElement("br", null), "Bol\xEDvar, Colombia")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mono atl-stat-key"
  }, "VISITAS"), /*#__PURE__*/React.createElement("div", {
    className: "atl-stat-val"
  }, "Con o sin cita previa", /*#__PURE__*/React.createElement("br", null), "Lun\u2013S\xE1b \xB7 10:00\u201319:00"))))), /*#__PURE__*/React.createElement("section", {
    className: "abt-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-section-header"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "abt-section-title"
  }, "El equipo ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "detr\xE1s del atelier"))), /*#__PURE__*/React.createElement("div", {
    className: "team-grid"
  }, NOS_EQUIPO.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: p.n,
    className: "glass glass-iridescent team-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "team-avatar",
    style: {
      '--ti': i
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "team-avatar-letter"
  }, avatarInitials(p.n))), /*#__PURE__*/React.createElement("div", {
    className: "team-name"
  }, p.n), /*#__PURE__*/React.createElement("div", {
    className: "mono team-role"
  }, p.r), /*#__PURE__*/React.createElement("p", {
    className: "team-bio"
  }, p.b))))), /*#__PURE__*/React.createElement("section", {
    className: "glass glass-emerald cert-section",
    id: "certificaciones"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cert-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cert-side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono cert-eyebrow"
  }, "RESPALDOS Y CERTIFICACIONES"), /*#__PURE__*/React.createElement("h3", {
    className: "cert-title"
  }, "Cada pieza viene con ", /*#__PURE__*/React.createElement("span", {
    className: "italic cert-title-em"
  }, "papel y palabra"))), /*#__PURE__*/React.createElement("div", {
    className: "cert-list"
  }, NOS_CERTS.map(c2 => /*#__PURE__*/React.createElement("div", {
    key: c2.t,
    className: "cert-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cert-card-title"
  }, c2.t), /*#__PURE__*/React.createElement("div", {
    className: "cert-card-desc"
  }, c2.d)))))), /*#__PURE__*/React.createElement("section", {
    className: "abt-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-section-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono abt-eyebrow"
  }, "EN SUS PALABRAS"), /*#__PURE__*/React.createElement("h2", {
    className: "abt-section-title"
  }, "Historias que ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "nos confiaron"))), /*#__PURE__*/React.createElement("div", {
    className: "resena-grid"
  }, NOS_RESENAS.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.n,
    className: "glass glass-iridescent resena-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "resena-stars",
    "aria-label": "5 de 5 estrellas"
  }, [0, 1, 2, 3, 4].map(i => /*#__PURE__*/React.createElement("svg", {
    key: i,
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z"
  })))), /*#__PURE__*/React.createElement("p", {
    className: "resena-quote"
  }, p.t), /*#__PURE__*/React.createElement("div", {
    className: "resena-foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "resena-name"
  }, p.n), /*#__PURE__*/React.createElement("span", {
    className: "mono resena-src"
  }, p.loc)))))), /*#__PURE__*/React.createElement("section", {
    className: "abt-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-section-header"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "abt-section-title"
  }, "Lo que ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "suelen preguntarnos"))), /*#__PURE__*/React.createElement("div", {
    className: "glass faq-wrap"
  }, NOS_FAQS.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: 'faq-item' + (i < NOS_FAQS.length - 1 ? ' faq-item--bordered' : '')
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "faq-trigger",
    "aria-expanded": openFaq === i,
    onClick: () => setOpenFaq(openFaq === i ? -1 : i)
  }, /*#__PURE__*/React.createElement("span", {
    className: "faq-q"
  }, f.q), /*#__PURE__*/React.createElement("span", {
    className: 'faq-toggle' + (openFaq === i ? ' is-open' : ''),
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  })))), openFaq === i && /*#__PURE__*/React.createElement("div", {
    className: "faq-answer"
  }, /*#__PURE__*/React.createElement("p", null, f.a)))))), /*#__PURE__*/React.createElement("section", {
    className: "glass glass-iridescent abt-cta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "abt-cta-glow",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "abt-cta-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono abt-eyebrow"
  }, "EMPEZAMOS POR UNA CONVERSACI\xD3N"), /*#__PURE__*/React.createElement("h3", {
    className: "abt-cta-title"
  }, "Tu pr\xF3xima joya", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "comienza con un caf\xE9")), /*#__PURE__*/React.createElement("p", {
    className: "abt-cta-lead"
  }, "Agenda una visita al atelier o escr\xEDbenos. Sin compromiso, sin guion, sin prisas. Solo una conversaci\xF3n."), /*#__PURE__*/React.createElement("div", {
    className: "abt-cta-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => navigate('contacto')
  }, "Hablemos ", /*#__PURE__*/React.createElement(IconArrow, {
    size: 14
  }))))));
}

// ════════════════════════════════════════════════════════════════════
// CONTACTO — mirror of js/pages/contacto.js (3-tab form + sidebar)
// ════════════════════════════════════════════════════════════════════
const CT_CANALES = [{
  k: 'whatsapp',
  t: 'WhatsApp',
  v: '+57 301 375 2592',
  d: 'Respuesta inmediata · 09:00–20:00',
  href: 'https://wa.me/573013752592'
}, {
  k: 'email',
  t: 'Correo',
  v: 'info@bersagliojewelry.co',
  d: 'Respondemos en < 24h',
  href: 'mailto:info@bersagliojewelry.co'
}, {
  k: 'instagram',
  t: 'Instagram',
  v: '@bersagliojewelry',
  d: 'Mensaje directo',
  href: 'https://instagram.com/bersagliojewelry'
}];
const CT_CANAL_ICON = {
  whatsapp: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.737-.979zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
  })),
  telefono: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
  })),
  email: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "22,6 12,13 2,6"
  })),
  instagram: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.4-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z"
  }))
};
const CT_HORAS = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const CT_HORARIOS = [{
  d: 'Lunes',
  h: '10:00 – 19:00',
  abierto: true
}, {
  d: 'Martes',
  h: '10:00 – 19:00',
  abierto: true
}, {
  d: 'Miércoles',
  h: '10:00 – 19:00',
  abierto: true
}, {
  d: 'Jueves',
  h: '10:00 – 19:00',
  abierto: true
}, {
  d: 'Viernes',
  h: '10:00 – 20:00',
  abierto: true
}, {
  d: 'Sábado',
  h: '10:00 – 18:00',
  abierto: true
}, {
  d: 'Domingo',
  h: 'Solo con cita previa',
  abierto: false
}];
const CT_FAQS = [{
  q: '¿Necesito cita previa?',
  a: 'No es obligatoria: puedes acercarte directamente o reservar una cita para una atención más dedicada. Ambas son bienvenidas.'
}, {
  q: '¿Hay parqueadero?',
  a: 'En el Centro Histórico encuentras varios parqueaderos privados y seguros a pocos pasos del atelier.'
}, {
  q: '¿Puedo llevar acompañantes?',
  a: 'Hasta tres personas. Indícalo al agendar para preparar el espacio.'
}, {
  q: '¿Atienden en otro idioma?',
  a: 'Español e inglés. Francés e italiano con cita previa, informándolo al agendar.'
}];
const CT_MOTIVOS = [{
  k: 'asesoria',
  t: 'Asesoría general',
  d: 'Quiero conocer las colecciones'
}, {
  k: 'pieza',
  t: 'Pieza a medida',
  d: 'Tengo una idea o una historia'
}, {
  k: 'compromiso',
  t: 'Anillo de compromiso',
  d: 'Asesoría privada y discreta'
}, {
  k: 'herencia',
  t: 'Pieza heredada',
  d: 'Restauración o reinterpretación'
}, {
  k: 'prensa',
  t: 'Prensa & medios',
  d: 'Editoriales y entrevistas'
}, {
  k: 'otro',
  t: 'Otro motivo',
  d: 'Cuéntame en el mensaje'
}];
const CT_PRESUPS = ['Definiendo', '< $5M', '$5M–$15M', '$15M–$50M', '> $50M'];
const CT_VISITA_MOTIVOS = [['asesoria', 'Asesoría general'], ['pieza', 'Pieza a medida'], ['compromiso', 'Anillo de compromiso'], ['evento', 'Evento especial'], ['otro', 'Otro']];
const CT_FRANJAS = [{
  k: 'manana',
  t: 'Mañana',
  h: '09:00–12:00'
}, {
  k: 'tarde',
  t: 'Tarde',
  h: '14:00–17:00'
}, {
  k: 'noche',
  t: 'Final de tarde',
  h: '17:00–19:00'
}];
const CT_URGENCIAS = [['normal', 'Sin prisa'], ['semana', 'Esta semana'], ['urgente', 'Hoy mismo']];
const CT_PROCESO = [{
  n: '01',
  t: 'Lectura Personal',
  d: 'Tu mensaje es leído directamente por Kary Mendoza y su equipo. Prescindimos de respuestas automáticas o chatbots; valoramos el contacto humano desde el primer segundo.',
  tiempo: 'En el día'
}, {
  n: '02',
  t: 'Primer Diálogo',
  d: 'Nos pondremos en contacto para entender mejor el contexto de tu joya: la historia detrás del encargo, el tipo de gema preferida y las expectativas de entrega.',
  tiempo: '< 24 horas'
}, {
  n: '03',
  t: 'Encuentro Pausado',
  d: 'Agendamos una llamada de voz, chat directo o un café en nuestra Maison en el centro histórico de Cartagena. Una conversación íntima, sin presiones comerciales.',
  tiempo: 'A tu ritmo'
}, {
  n: '04',
  t: 'Manos a la Obra',
  d: 'Si decides que Bersaglio sea el custodio de tu legado, damos vida a tu pieza paso a paso: del primer boceto a mano alzada hasta la creación final en nuestro taller, siempre con tu aprobación.',
  tiempo: 'A medida'
}];
const minDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split('T')[0];
};
const todayIdx = () => (new Date().getDay() + 6) % 7;
function ContactoScreen() {
  const [tab, setTab] = React.useState('mensaje');
  const [sent, setSent] = React.useState(false);
  const [form, setForm] = React.useState({
    n: '',
    e: '',
    tel: '',
    t: 'asesoria',
    presup: '',
    m: ''
  });
  const [visit, setVisit] = React.useState({
    n: '',
    e: '',
    tel: '',
    fecha: '',
    hora: '10:00',
    personas: '1',
    motivo: 'asesoria',
    notas: ''
  });
  const [call, setCall] = React.useState({
    n: '',
    tel: '',
    franja: 'manana',
    urgencia: 'normal'
  });
  const updF = (k, v) => setForm(p => ({
    ...p,
    [k]: v
  }));
  const updV = (k, v) => setVisit(p => ({
    ...p,
    [k]: v
  }));
  const updC = (k, v) => setCall(p => ({
    ...p,
    [k]: v
  }));
  const onSubmit = e => {
    e.preventDefault();
    setSent(true);
  };
  const today = CT_HORARIOS[todayIdx()];
  const TABS = [{
    k: 'mensaje',
    t: 'Enviar mensaje'
  }, {
    k: 'visita',
    t: 'Agendar visita'
  }, {
    k: 'llamada',
    t: 'Pedir llamada'
  }];
  const successName = (tab === 'mensaje' ? form.n : tab === 'visita' ? visit.n : call.n) || 'distinguido huésped';
  const successMsg = tab === 'visita' ? `Confirmaremos los detalles de tu cita privada por canales directos para el ${visit.fecha || 'día solicitado'} a las ${visit.hora}. El atelier estará reservado exclusivamente para ti.` : tab === 'llamada' ? 'Nos comunicaremos contigo telefónicamente en la franja horaria establecida. Esperamos conversar pronto.' : 'Agradecemos tu confidencia. Kary Mendoza o un gemólogo del atelier se pondrá en contacto contigo en las próximas horas.';
  return /*#__PURE__*/React.createElement("div", {
    className: "container ct-page"
  }, /*#__PURE__*/React.createElement("section", {
    className: "ct-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono ct-hero-eyebrow"
  }, "CONSERJER\xCDA PRIVADA"), /*#__PURE__*/React.createElement("h1", {
    className: "ct-hero-title"
  }, "Un encuentro pausado,", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text ct-hero-title-em"
  }, "una esmeralda \xFAnica,"), " un legado eterno."), /*#__PURE__*/React.createElement("p", {
    className: "ct-hero-lead"
  }, "Te invitamos a dar el primer paso. Elige la v\xEDa de comunicaci\xF3n que te resulte m\xE1s c\xF3moda; cada mensaje es atendido de manera directa y confidencial por Kary Mendoza y su equipo.")), /*#__PURE__*/React.createElement("section", {
    className: "ct-canales canales-grid"
  }, CT_CANALES.map(c => /*#__PURE__*/React.createElement("a", {
    key: c.k,
    className: "glass glass-iridescent canal-card",
    href: c.href,
    target: c.k === 'instagram' || c.k === 'whatsapp' ? '_blank' : undefined,
    rel: c.k === 'instagram' || c.k === 'whatsapp' ? 'noopener' : undefined
  }, /*#__PURE__*/React.createElement("div", {
    className: 'canal-icon canal-icon--' + c.k
  }, CT_CANAL_ICON[c.k]), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "canal-title"
  }, c.t), /*#__PURE__*/React.createElement("div", {
    className: "mono canal-value"
  }, c.v), /*#__PURE__*/React.createElement("div", {
    className: "canal-desc"
  }, c.d))))), /*#__PURE__*/React.createElement("section", {
    className: "contact-grid ct-mainrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent ct-form-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-tabbar",
    role: "tablist"
  }, TABS.map(opt => /*#__PURE__*/React.createElement("button", {
    key: opt.k,
    type: "button",
    className: 'ct-tab' + (tab === opt.k ? ' is-active' : ''),
    role: "tab",
    "aria-selected": tab === opt.k,
    onClick: () => {
      setTab(opt.k);
      setSent(false);
    }
  }, opt.t))), sent ? /*#__PURE__*/React.createElement("div", {
    className: "ct-success"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-success-check",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "36",
    height: "36",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "2.5"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6L9 17l-5-5"
  }))), /*#__PURE__*/React.createElement("h3", {
    className: "ct-success-title"
  }, "Recibido, ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, successName)), /*#__PURE__*/React.createElement("p", {
    className: "ct-success-msg"
  }, successMsg), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-aqua ct-success-again",
    onClick: () => setSent(false)
  }, "Enviar otro")) : tab === 'mensaje' ? /*#__PURE__*/React.createElement("form", {
    className: "ct-form",
    onSubmit: onSubmit,
    noValidate: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-form-row ct-form-row--2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Nombre completo", /*#__PURE__*/React.createElement("span", {
    className: "ct-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "ct-field-input",
    value: form.n,
    onChange: e => updF('n', e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Email", /*#__PURE__*/React.createElement("span", {
    className: "ct-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "email",
    className: "ct-field-input",
    value: form.e,
    onChange: e => updF('e', e.target.value),
    required: true
  }))), /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Tel\xE9fono / WhatsApp (opcional)"), /*#__PURE__*/React.createElement("input", {
    type: "tel",
    className: "ct-field-input",
    value: form.tel,
    onChange: e => updF('tel', e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow ct-section-label"
  }, "\xBFSobre qu\xE9 quieres hablar?"), /*#__PURE__*/React.createElement("div", {
    className: "motivo-grid"
  }, CT_MOTIVOS.map(mt => /*#__PURE__*/React.createElement("button", {
    key: mt.k,
    type: "button",
    className: 'ct-motivo-card' + (form.t === mt.k ? ' is-active' : ''),
    onClick: () => updF('t', mt.k)
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-motivo-title"
  }, mt.t), /*#__PURE__*/React.createElement("div", {
    className: "ct-motivo-desc"
  }, mt.d))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow ct-section-label"
  }, "Rango de presupuesto (opcional)"), /*#__PURE__*/React.createElement("div", {
    className: "ct-presup-row"
  }, CT_PRESUPS.map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    type: "button",
    className: 'ct-presup-pill' + (form.presup === p ? ' is-active' : ''),
    onClick: () => updF('presup', p)
  }, p)))), /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Describe el motivo de tu inspiraci\xF3n"), /*#__PURE__*/React.createElement("textarea", {
    className: "ct-field-input",
    rows: 5,
    value: form.m,
    placeholder: "\xBFQu\xE9 historia o momento desea conmemorar? \xBFTiene alguna preferencia por una gema en particular?",
    onChange: e => updF('m', e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "ct-form-foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-discreto"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
  })), "Tus datos se tratan con discreci\xF3n absoluta."), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn-aqua btn-aqua-emerald ct-submit"
  }, "Enviar mensaje", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  }))))) : tab === 'visita' ? /*#__PURE__*/React.createElement("form", {
    className: "ct-form",
    onSubmit: onSubmit,
    noValidate: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-banner ct-banner--visit"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-banner-icon",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "26",
    height: "26",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M17 8h1a4 4 0 1 1 0 8h-1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 1v3M10 1v3M14 1v3"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ct-banner-title"
  }, "Cita Privada en la Maison"), /*#__PURE__*/React.createElement("div", {
    className: "ct-banner-desc"
  }, "Centro Hist\xF3rico, Cartagena \xB7 60\u201390 min \xB7 Un espacio consagrado a tus ideas"))), /*#__PURE__*/React.createElement("div", {
    className: "ct-form-row ct-form-row--2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Nombre completo", /*#__PURE__*/React.createElement("span", {
    className: "ct-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "ct-field-input",
    value: visit.n,
    onChange: e => updV('n', e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Email", /*#__PURE__*/React.createElement("span", {
    className: "ct-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "email",
    className: "ct-field-input",
    value: visit.e,
    onChange: e => updV('e', e.target.value),
    required: true
  }))), /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Tel\xE9fono / WhatsApp", /*#__PURE__*/React.createElement("span", {
    className: "ct-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "tel",
    className: "ct-field-input",
    value: visit.tel,
    onChange: e => updV('tel', e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "ct-form-row visit-row"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Fecha preferida", /*#__PURE__*/React.createElement("span", {
    className: "ct-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "ct-field-input",
    min: minDate(),
    value: visit.fecha,
    onChange: e => updV('fecha', e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Hora"), /*#__PURE__*/React.createElement("select", {
    className: "ct-field-input",
    value: visit.hora,
    onChange: e => updV('hora', e.target.value)
  }, CT_HORAS.map(h => /*#__PURE__*/React.createElement("option", {
    key: h,
    value: h
  }, h)))), /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Personas"), /*#__PURE__*/React.createElement("select", {
    className: "ct-field-input",
    value: visit.personas,
    onChange: e => updV('personas', e.target.value)
  }, ['1', '2', '3', '4'].map(n => /*#__PURE__*/React.createElement("option", {
    key: n,
    value: n
  }, n))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow ct-section-label"
  }, "Motivo de la visita"), /*#__PURE__*/React.createElement("div", {
    className: "ct-pills"
  }, CT_VISITA_MOTIVOS.map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    type: "button",
    className: 'ct-pill' + (visit.motivo === k ? ' is-active' : ''),
    onClick: () => updV('motivo', k)
  }, l)))), /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Notas (alergias, idioma preferido, accesibilidad...)"), /*#__PURE__*/React.createElement("textarea", {
    className: "ct-field-input",
    rows: 5,
    value: visit.notas,
    placeholder: "Cualquier detalle que nos ayude a recibirte mejor.",
    onChange: e => updV('notas', e.target.value)
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn-aqua btn-aqua-emerald ct-submit ct-submit--start"
  }, "Reservar mi visita", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))) : /*#__PURE__*/React.createElement("form", {
    className: "ct-form",
    onSubmit: onSubmit,
    noValidate: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-banner ct-banner--call"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-banner-icon",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ct-banner-title"
  }, "Llamada Confidencial"), /*#__PURE__*/React.createElement("div", {
    className: "ct-banner-desc"
  }, "Establezcamos una conversaci\xF3n telef\xF3nica en el horario de tu preferencia."))), /*#__PURE__*/React.createElement("div", {
    className: "ct-form-row ct-form-row--2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Nombre", /*#__PURE__*/React.createElement("span", {
    className: "ct-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "ct-field-input",
    value: call.n,
    onChange: e => updC('n', e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement("label", {
    className: "ct-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Tel\xE9fono", /*#__PURE__*/React.createElement("span", {
    className: "ct-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "tel",
    className: "ct-field-input",
    value: call.tel,
    onChange: e => updC('tel', e.target.value),
    required: true
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow ct-section-label"
  }, "Mejor franja horaria"), /*#__PURE__*/React.createElement("div", {
    className: "ct-franja-grid"
  }, CT_FRANJAS.map(f => /*#__PURE__*/React.createElement("button", {
    key: f.k,
    type: "button",
    className: 'ct-franja-card' + (call.franja === f.k ? ' is-active' : ''),
    onClick: () => updC('franja', f.k)
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-franja-title"
  }, f.t), /*#__PURE__*/React.createElement("div", {
    className: "mono ct-franja-hour"
  }, f.h))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow ct-section-label"
  }, "Urgencia"), /*#__PURE__*/React.createElement("div", {
    className: "ct-pills"
  }, CT_URGENCIAS.map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    type: "button",
    className: 'ct-pill' + (call.urgencia === k ? ' is-active' : ''),
    onClick: () => updC('urgencia', k)
  }, l)))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn-aqua btn-aqua-emerald ct-submit ct-submit--start"
  }, "Pedir llamada", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  }))))), /*#__PURE__*/React.createElement("aside", {
    className: "ct-sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass glass-emerald ct-atelier"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-map"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    height: "100%",
    viewBox: "0 0 400 200",
    preserveAspectRatio: "xMidYMid slice",
    className: "ct-map-svg"
  }, /*#__PURE__*/React.createElement("g", {
    stroke: "oklch(85% 0.14 90)",
    strokeWidth: "0.7",
    fill: "none",
    opacity: "0.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M-10 52 H410"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M-10 96 H410"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M-10 140 H410"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M60 -10 V210"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M150 -10 V210"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M250 -10 V210"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M330 -10 V210"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M-10 74 L410 124",
    opacity: "0.35"
  })), /*#__PURE__*/React.createElement("path", {
    d: "M-10 176 Q120 160 240 178 T410 168",
    stroke: "oklch(72% 0.09 220)",
    strokeWidth: "3",
    fill: "none",
    opacity: "0.4",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("g", {
    fill: "oklch(85% 0.14 90)",
    opacity: "0.16"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "70",
    y: "104",
    width: "68",
    height: "30",
    rx: "2"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "160",
    y: "58",
    width: "78",
    height: "32",
    rx: "2"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "260",
    y: "104",
    width: "58",
    height: "30",
    rx: "2"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ct-map-pin",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-map-pin-bubble"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-map-pin-dot"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ct-map-pin-label"
  }, "Atelier")), /*#__PURE__*/React.createElement("div", {
    className: "ct-map-flag"
  }, "CENTRO HIST\xD3RICO")), /*#__PURE__*/React.createElement("div", {
    className: "ct-atelier-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono ct-atelier-eyebrow"
  }, "CASA BERSAGLIO"), /*#__PURE__*/React.createElement("div", {
    className: "ct-atelier-title"
  }, "Cartagena de Indias"), /*#__PURE__*/React.createElement("p", {
    className: "ct-atelier-addr"
  }, "Calle 36 # 6-32", /*#__PURE__*/React.createElement("br", null), "San Agust\xEDn Chiquita \xB7 Centro Hist\xF3rico", /*#__PURE__*/React.createElement("br", null), "Bol\xEDvar, Colombia"), /*#__PURE__*/React.createElement("a", {
    href: "https://maps.google.com/?q=Cartagena+Centro+Hist%C3%B3rico",
    target: "_blank",
    rel: "noopener",
    className: "ct-atelier-mapbtn"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "10",
    r: "3"
  })), "Abrir en mapas"))), /*#__PURE__*/React.createElement("div", {
    className: "glass ct-horarios"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono ct-horarios-eyebrow"
  }, "HORARIOS DE ATENCI\xD3N"), /*#__PURE__*/React.createElement("ul", {
    className: "ct-horarios-list"
  }, CT_HORARIOS.map((h, i) => /*#__PURE__*/React.createElement("li", {
    key: h.d,
    className: 'ct-horario-row' + (i < CT_HORARIOS.length - 1 ? ' ct-horario-row--bordered' : '') + (h.abierto ? '' : ' ct-horario-row--closed')
  }, /*#__PURE__*/React.createElement("span", {
    className: "ct-horario-day"
  }, h.d), /*#__PURE__*/React.createElement("span", {
    className: "mono ct-horario-hour"
  }, h.h)))), today.abierto && /*#__PURE__*/React.createElement("div", {
    className: "ct-horarios-status"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ct-status-dot"
  }), /*#__PURE__*/React.createElement("span", null, "Abierto hoy \xB7 ", today.h))), /*#__PURE__*/React.createElement("div", {
    className: "glass ct-respuesta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono ct-respuesta-eyebrow"
  }, "RESPUESTA GARANTIZADA"), /*#__PURE__*/React.createElement("div", {
    className: "ct-respuesta-num"
  }, "< 24h"), /*#__PURE__*/React.createElement("div", {
    className: "ct-respuesta-sub"
  }, "en d\xEDas h\xE1biles")))), /*#__PURE__*/React.createElement("section", {
    className: "glass ct-proceso"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-proceso-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono ct-proceso-eyebrow"
  }, "QU\xC9 ESPERAR DE NOSOTROS"), /*#__PURE__*/React.createElement("h2", {
    className: "ct-proceso-title"
  }, "Despu\xE9s de que ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "nos escribes"))), /*#__PURE__*/React.createElement("div", {
    className: "ct-proceso-grid proc-grid"
  }, CT_PROCESO.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.n,
    className: "ct-proceso-step"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-proceso-num"
  }, p.n), /*#__PURE__*/React.createElement("div", {
    className: "ct-proceso-stepname"
  }, p.t), /*#__PURE__*/React.createElement("p", {
    className: "ct-proceso-stepdesc"
  }, p.d), /*#__PURE__*/React.createElement("div", {
    className: "mono ct-proceso-time"
  }, p.tiempo))))), /*#__PURE__*/React.createElement("section", {
    className: "ct-faq-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-faq-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono ct-faq-eyebrow"
  }, "ANTES DE TU VISITA"), /*#__PURE__*/React.createElement("h3", {
    className: "ct-faq-title"
  }, "Lo que necesitas ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "saber")), /*#__PURE__*/React.createElement("p", {
    className: "ct-faq-lead"
  }, "Cuatro respuestas r\xE1pidas para que llegues con todo claro. Si te queda alguna duda, escr\xEDbenos por WhatsApp."), /*#__PURE__*/React.createElement("a", {
    href: "https://wa.me/573013752592",
    target: "_blank",
    rel: "noopener",
    className: "btn-aqua btn-aqua-emerald ct-faq-cta"
  }, "Preguntar por WhatsApp", /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "ct-faq-grid"
  }, CT_FAQS.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "glass glass-iridescent ct-faq-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ct-faq-q"
  }, f.q), /*#__PURE__*/React.createElement("p", {
    className: "ct-faq-a"
  }, f.a))))));
}

// ════════════════════════════════════════════════════════════════════
// CARRITO — mirror of js/pages/carrito.js (3-step checkout stepper)
// ════════════════════════════════════════════════════════════════════
const CK_STEPS = ['Carrito', 'Envío', 'Pago'];
const CK_PAYMENT_OPTIONS = [{
  k: 'whatsapp',
  t: 'Coordinar por WhatsApp',
  d: 'Hablas directo con Kary, eliges el método de pago y los plazos.',
  icon: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M20.5 3.5A11 11 0 0 0 3.4 17l-1.4 5.1 5.2-1.4A11 11 0 1 0 20.5 3.5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 10.5c.3 2 2 3.7 4 4.2 1 .3 1.9.1 2.5-.5"
  }))
}, {
  k: 'transferencia',
  t: 'Transferencia bancaria',
  d: 'Bancolombia o Davivienda. Te enviamos los datos por correo.',
  icon: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M3 9h18v11H3z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 9l9-6 9 6"
  }))
}, {
  k: 'asesor',
  t: 'Que un asesor me llame',
  d: 'Preferimos hablar antes de avanzar. Te llamamos en menos de 4 horas hábiles.',
  icon: /*#__PURE__*/React.createElement("path", {
    d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
  })
}];
function CarritoScreen({
  items,
  onQty,
  onRemove,
  navigate
}) {
  const [step, setStep] = React.useState(1);
  const [payment, setPayment] = React.useState('whatsapp');
  const [ship, setShip] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Colombia',
    zip: ''
  });
  const updS = (k, v) => setShip(p => ({
    ...p,
    [k]: v
  }));
  const subtotal = items.reduce((s, i) => s + Number(i.price || 0) * (i.qty || 1), 0);
  const totalQty = items.reduce((s, i) => s + (i.qty || 1), 0);
  const empty = items.length === 0;
  const go = n => {
    if (empty && n > 1) return;
    setStep(Math.max(1, Math.min(3, n)));
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  };
  const onShipSubmit = e => {
    e.preventDefault();
    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }
    go(3);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "container ck-page"
  }, /*#__PURE__*/React.createElement("header", {
    className: "ck-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Checkout"), /*#__PURE__*/React.createElement("h1", {
    className: "ck-title"
  }, "Finalizar ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "compra"))), /*#__PURE__*/React.createElement("nav", {
    className: "glass ck-stepper",
    role: "tablist",
    "aria-label": "Pasos del checkout"
  }, CK_STEPS.map((s, i) => {
    const idx = i + 1;
    const disabled = empty && idx > 1;
    return /*#__PURE__*/React.createElement("button", {
      key: s,
      type: "button",
      className: 'ck-step' + (step === idx ? ' is-active' : '') + (disabled ? ' is-disabled' : ''),
      role: "tab",
      "aria-selected": step === idx,
      disabled: disabled,
      onClick: () => go(idx)
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono ck-step-num"
    }, "0", idx), s);
  })), /*#__PURE__*/React.createElement("div", {
    className: "ck-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass ck-card"
  }, step === 1 && (empty ? /*#__PURE__*/React.createElement("div", {
    className: "ck-empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-empty-icon",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "64",
    height: "64",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 2l-2 5v15h16V7l-2-5H6z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 7h16M10 11a2 2 0 0 0 4 0"
  }))), /*#__PURE__*/React.createElement("h3", {
    className: "ck-empty-title"
  }, "Tu carrito espera la primera pieza"), /*#__PURE__*/React.createElement("p", {
    className: "ck-empty-sub"
  }, "Explora la colecci\xF3n. Cada pieza Bersaglio se elige con tiempo, con calma y con un caf\xE9."), /*#__PURE__*/React.createElement("div", {
    className: "ck-empty-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => navigate('catalogo')
  }, "Ver el cat\xE1logo"), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua",
    onClick: () => navigate('contacto')
  }, "Hablar con un asesor"))) : /*#__PURE__*/React.createElement("div", {
    className: "ck-step-body"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ck-step-title"
  }, "Tus piezas"), /*#__PURE__*/React.createElement("div", {
    className: "ck-items"
  }, items.map(i => /*#__PURE__*/React.createElement("article", {
    key: i.id,
    className: "ck-item"
  }, /*#__PURE__*/React.createElement("a", {
    className: "ck-item-img",
    style: {
      background: `url('${i.img}') center/cover`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "ck-item-body"
  }, /*#__PURE__*/React.createElement("a", {
    className: "ck-item-name"
  }, i.name), /*#__PURE__*/React.createElement("div", {
    className: "mono ck-item-price"
  }, fmt$(i.price)), /*#__PURE__*/React.createElement("div", {
    className: "ck-item-controls"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-qty"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ck-qty-btn",
    onClick: () => onQty(i.id, i.qty - 1),
    "aria-label": "Restar uno"
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    className: "mono ck-qty-val"
  }, i.qty), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ck-qty-btn",
    onClick: () => onQty(i.id, i.qty + 1),
    "aria-label": "Sumar uno"
  }, "+")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ck-item-remove",
    onClick: () => onRemove(i.id)
  }, "Quitar")))))), /*#__PURE__*/React.createElement("div", {
    className: "ck-step-footer"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-aqua btn-aqua-emerald ck-cta",
    onClick: () => go(2)
  }, "Continuar al env\xEDo", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))))), step === 2 && /*#__PURE__*/React.createElement("div", {
    className: "ck-step-body"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ck-step-title"
  }, "Informaci\xF3n de env\xEDo"), /*#__PURE__*/React.createElement("form", {
    className: "ck-shipping",
    onSubmit: onShipSubmit,
    noValidate: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-field-row ck-field-row--2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Nombre", /*#__PURE__*/React.createElement("span", {
    className: "ck-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "ck-field-input",
    value: ship.firstName,
    autoComplete: "given-name",
    required: true,
    onChange: e => updS('firstName', e.target.value)
  })), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Apellido", /*#__PURE__*/React.createElement("span", {
    className: "ck-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "ck-field-input",
    value: ship.lastName,
    autoComplete: "family-name",
    required: true,
    onChange: e => updS('lastName', e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ck-field-row ck-field-row--2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Email", /*#__PURE__*/React.createElement("span", {
    className: "ck-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "email",
    className: "ck-field-input",
    value: ship.email,
    autoComplete: "email",
    required: true,
    onChange: e => updS('email', e.target.value)
  })), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Tel\xE9fono / WhatsApp", /*#__PURE__*/React.createElement("span", {
    className: "ck-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "tel",
    className: "ck-field-input",
    value: ship.phone,
    autoComplete: "tel",
    required: true,
    onChange: e => updS('phone', e.target.value)
  }))), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Direcci\xF3n", /*#__PURE__*/React.createElement("span", {
    className: "ck-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "ck-field-input",
    value: ship.address,
    autoComplete: "street-address",
    required: true,
    onChange: e => updS('address', e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "ck-field-row ck-field-row--3"
  }, /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Ciudad", /*#__PURE__*/React.createElement("span", {
    className: "ck-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "ck-field-input",
    value: ship.city,
    autoComplete: "address-level2",
    required: true,
    onChange: e => updS('city', e.target.value)
  })), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Pa\xEDs", /*#__PURE__*/React.createElement("span", {
    className: "ck-field-required"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "ck-field-input",
    value: ship.country,
    autoComplete: "country-name",
    required: true,
    onChange: e => updS('country', e.target.value)
  })), /*#__PURE__*/React.createElement("label", {
    className: "ck-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "C\xF3digo postal"), /*#__PURE__*/React.createElement("input", {
    className: "ck-field-input",
    value: ship.zip,
    autoComplete: "postal-code",
    onChange: e => updS('zip', e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ck-step-footer"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-aqua ck-back",
    onClick: () => go(1)
  }, "\u2190 Volver"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn-aqua btn-aqua-emerald ck-cta"
  }, "Continuar al pago", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))))), step === 3 && /*#__PURE__*/React.createElement("div", {
    className: "ck-step-body"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ck-step-title"
  }, "C\xF3mo quieres avanzar"), /*#__PURE__*/React.createElement("p", {
    className: "ck-step-lead"
  }, "Las piezas Bersaglio son \xFAnicas y de alto valor: cerramos cada compra en conversaci\xF3n. Elige c\xF3mo prefieres coordinar."), /*#__PURE__*/React.createElement("div", {
    className: "ck-payment-list"
  }, CK_PAYMENT_OPTIONS.map(opt => /*#__PURE__*/React.createElement("label", {
    key: opt.k,
    className: 'glass ck-payment' + (payment === opt.k ? ' is-active' : ''),
    onClick: () => setPayment(opt.k)
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "payment",
    value: opt.k,
    checked: payment === opt.k,
    readOnly: true,
    className: "ck-payment-radio"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ck-payment-icon"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    "aria-hidden": "true"
  }, opt.icon)), /*#__PURE__*/React.createElement("div", {
    className: "ck-payment-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-payment-title"
  }, opt.t), /*#__PURE__*/React.createElement("div", {
    className: "ck-payment-desc"
  }, opt.d))))), /*#__PURE__*/React.createElement("div", {
    className: "ck-step-footer"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-aqua ck-back",
    onClick: () => go(2)
  }, "\u2190 Volver"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-aqua btn-aqua-emerald ck-cta ck-confirm",
    onClick: () => navigate('gracias')
  }, "Confirmar \xB7 ", fmt$(subtotal), /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))))), !empty && /*#__PURE__*/React.createElement("aside", {
    className: "glass glass-emerald ck-summary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow ck-summary-eyebrow"
  }, "Resumen"), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary-lines"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ck-summary-row"
  }, /*#__PURE__*/React.createElement("span", null, "Subtotal \xB7 ", totalQty, " ", totalQty === 1 ? 'pieza' : 'piezas'), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, fmt$(subtotal))), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary-row"
  }, /*#__PURE__*/React.createElement("span", null, "Env\xEDo asegurado"), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "Cotizar")), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary-row"
  }, /*#__PURE__*/React.createElement("span", null, "IVA"), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "incluido"))), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary-divider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary-total"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ck-summary-total-label"
  }, "Total"), /*#__PURE__*/React.createElement("span", {
    className: "mono ck-summary-total-val"
  }, fmt$(subtotal))), /*#__PURE__*/React.createElement("div", {
    className: "ck-summary-note"
  }, "Los precios se confirman al cierre con Kary. El env\xEDo internacional se cotiza por DHL Express o FedEx Priority."))));
}

// ════════════════════════════════════════════════════════════════════
// JOURNAL — mirror of js/pages/journal.js (masthead · ticker · cover · archive)
// ════════════════════════════════════════════════════════════════════
const jrAuthorInitials = author => {
  const clean = String(author || '').replace(/^Por\s+/i, '').trim();
  const parts = clean.split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase();
};
const jrTruncate = (t, n) => {
  t = String(t || '');
  return t.length <= n ? t : t.slice(0, n).replace(/\s+\S*$/, '') + '…';
};
function JournalScreen({
  navigate,
  openEntrada
}) {
  const feat = JOURNAL.find(e => e.featured) || JOURNAL[0];
  const rest = JOURNAL.filter(e => e !== feat);
  const side = rest.slice(0, 4);
  const ticker = [...JOURNAL_TICKER, ...JOURNAL_TICKER];
  const [subscribed, setSubscribed] = React.useState(false);
  const openE = slug => openEntrada ? openEntrada(slug) : navigate('entrada');
  return /*#__PURE__*/React.createElement("div", {
    className: "container jr-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-masthead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-masthead-brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono jr-est"
  }, JOURNAL_ISSUE.est), /*#__PURE__*/React.createElement("div", {
    className: "jr-est-divider"
  }), /*#__PURE__*/React.createElement("h1", {
    className: "jr-masthead-title"
  }, "The ", /*#__PURE__*/React.createElement("span", {
    className: "italic"
  }, "Bersaglio"), " Journal")), /*#__PURE__*/React.createElement("div", {
    className: "jr-masthead-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono jr-issue"
  }, JOURNAL_ISSUE.number, " \xB7 ", feat.dateLong))), /*#__PURE__*/React.createElement("div", {
    className: "jr-masthead-line"
  }), /*#__PURE__*/React.createElement("div", {
    className: "glass jr-ticker"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono jr-ticker-tag"
  }, /*#__PURE__*/React.createElement("span", {
    className: "jr-ticker-pulse"
  }), "EN VIVO"), /*#__PURE__*/React.createElement("div", {
    className: "jr-ticker-clip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-ticker-track"
  }, ticker.map((t, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "jr-ticker-item"
  }, t, /*#__PURE__*/React.createElement("span", {
    className: "jr-ticker-diamond"
  }, "\u25C6")))))), /*#__PURE__*/React.createElement("div", {
    className: "jr-fold"
  }, /*#__PURE__*/React.createElement("article", {
    className: "jr-cover"
  }, /*#__PURE__*/React.createElement("a", {
    className: "jr-cover-link",
    onClick: () => openE(feat.slug)
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-cover-imgwrap"
  }, /*#__PURE__*/React.createElement("img", {
    src: feat.img,
    alt: feat.title,
    className: "jr-cover-img",
    loading: "eager",
    decoding: "async"
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    className: "jr-cover-vignette"
  }), /*#__PURE__*/React.createElement("div", {
    className: "jr-cover-flag-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono jr-cover-flag"
  }, feat.section.toUpperCase()), /*#__PURE__*/React.createElement("span", {
    className: "mono jr-cover-read"
  }, feat.read, " de lectura")), /*#__PURE__*/React.createElement("div", {
    className: "jr-cover-caption"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono jr-cover-kicker"
  }, feat.kicker))), /*#__PURE__*/React.createElement("h2", {
    className: "jr-cover-title"
  }, feat.title), /*#__PURE__*/React.createElement("p", {
    className: "jr-cover-excerpt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "jr-cover-dropcap"
  }, feat.excerpt.charAt(0)), feat.excerpt.slice(1)), /*#__PURE__*/React.createElement("div", {
    className: "jr-cover-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-cover-author-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-cover-avatar"
  }, jrAuthorInitials(feat.author)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "jr-cover-author"
  }, feat.author), /*#__PURE__*/React.createElement("div", {
    className: "mono jr-cover-date"
  }, (feat.dateLong || '').toUpperCase()))), /*#__PURE__*/React.createElement("div", {
    className: "jr-cover-continue"
  }, "Continuar leyendo", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))))), /*#__PURE__*/React.createElement("aside", {
    className: "jr-side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-side-header"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "jr-side-title"
  }, "M\xE1s le\xEDdos"), /*#__PURE__*/React.createElement("div", {
    className: "mono jr-side-week"
  }, "ESTA SEMANA")), side.map((s, i) => /*#__PURE__*/React.createElement("article", {
    key: s.slug,
    className: "jr-side-row"
  }, /*#__PURE__*/React.createElement("a", {
    className: "jr-side-link",
    onClick: () => openE(s.slug)
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-side-num"
  }, "0", i + 1), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mono jr-side-meta"
  }, /*#__PURE__*/React.createElement("span", null, s.section), /*#__PURE__*/React.createElement("span", {
    className: "jr-side-meta-dot"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    className: "jr-side-meta-date"
  }, s.date)), /*#__PURE__*/React.createElement("h4", {
    className: "jr-side-headline"
  }, s.title), /*#__PURE__*/React.createElement("div", {
    className: "mono jr-side-read"
  }, s.read, " de lectura"))))), /*#__PURE__*/React.createElement("div", {
    className: "glass glass-emerald jr-newsletter"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono jr-newsletter-tag"
  }, "NEWSLETTER"), /*#__PURE__*/React.createElement("div", {
    className: "jr-newsletter-title"
  }, "Una nota cada", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "italic jr-newsletter-italic"
  }, "luna llena")), subscribed ? /*#__PURE__*/React.createElement("div", {
    className: "hj-newsletter-thanks"
  }, "Gracias. Te escribiremos pronto.") : /*#__PURE__*/React.createElement("form", {
    className: "jr-newsletter-form",
    onSubmit: e => {
      e.preventDefault();
      setSubscribed(true);
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "email",
    name: "email",
    placeholder: "tu@correo.com",
    className: "jr-newsletter-input",
    autoComplete: "email",
    required: true
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "jr-newsletter-btn"
  }, "Suscribir"))))), rest.length > 0 && /*#__PURE__*/React.createElement("section", {
    className: "jr-archive"
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-archive-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono jr-archive-eyebrow"
  }, "EL ARCHIVO COMPLETO"), /*#__PURE__*/React.createElement("h2", {
    className: "jr-archive-title"
  }, "Todas las entradas ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "del Journal"))), /*#__PURE__*/React.createElement("div", {
    className: "jr-archive-grid"
  }, rest.map(e => /*#__PURE__*/React.createElement("article", {
    key: e.slug,
    className: "glass jr-archive-card"
  }, /*#__PURE__*/React.createElement("a", {
    className: "jr-archive-link",
    onClick: () => openE(e.slug)
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-archive-imgwrap"
  }, /*#__PURE__*/React.createElement("img", {
    src: e.img,
    alt: e.title,
    className: "jr-archive-img",
    loading: "lazy",
    decoding: "async"
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    className: "jr-archive-vignette"
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono jr-archive-flag"
  }, e.section.toUpperCase())), /*#__PURE__*/React.createElement("div", {
    className: "jr-archive-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono jr-archive-meta"
  }, /*#__PURE__*/React.createElement("span", null, e.date), /*#__PURE__*/React.createElement("span", {
    className: "jr-archive-meta-dot"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, e.read, " de lectura")), /*#__PURE__*/React.createElement("h3", {
    className: "jr-archive-headline"
  }, e.title), /*#__PURE__*/React.createElement("p", {
    className: "jr-archive-excerpt"
  }, jrTruncate(e.excerpt, 140)), /*#__PURE__*/React.createElement("div", {
    className: "jr-archive-foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono jr-archive-author"
  }, e.author), /*#__PURE__*/React.createElement("span", {
    className: "jr-archive-arrow"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))))))))), /*#__PURE__*/React.createElement("section", {
    className: "glass glass-iridescent jr-cta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "jr-cta-glow",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "jr-cta-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono jr-cta-eyebrow"
  }, "DETR\xC1S DE CADA TEXTO HAY UNA PIEZA"), /*#__PURE__*/React.createElement("h3", {
    className: "jr-cta-title"
  }, "Cu\xE9ntanos qu\xE9 te ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "inspira")), /*#__PURE__*/React.createElement("p", {
    className: "jr-cta-lead"
  }, "Si una entrada te movi\xF3, escr\xEDbenos. Nuestras mejores piezas nacen de conversaciones que empiezan as\xED."), /*#__PURE__*/React.createElement("div", {
    className: "jr-cta-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => navigate('contacto')
  }, "Hablemos"), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua",
    onClick: () => navigate('catalogo')
  }, "Ver colecciones")))));
}

// ════════════════════════════════════════════════════════════════════
// ENTRADA — mirror of js/pages/entrada.js (single journal post)
// ════════════════════════════════════════════════════════════════════
function EntradaScreen({
  entrySlug,
  navigate,
  openEntrada
}) {
  const entry = JOURNAL.find(e => e.slug === entrySlug);
  const [copied, setCopied] = React.useState(false);
  const openE = slug => openEntrada ? openEntrada(slug) : navigate('journal');
  if (!entry) {
    return /*#__PURE__*/React.createElement("div", {
      className: "container en-page"
    }, /*#__PURE__*/React.createElement("nav", {
      className: "en-breadcrumb"
    }, /*#__PURE__*/React.createElement("a", {
      className: "en-crumb",
      onClick: () => navigate('home')
    }, "Inicio"), /*#__PURE__*/React.createElement("span", {
      className: "en-crumb-sep",
      "aria-hidden": "true"
    }, "\u2192"), /*#__PURE__*/React.createElement("a", {
      className: "en-crumb",
      onClick: () => navigate('journal')
    }, "Journal")), /*#__PURE__*/React.createElement("div", {
      className: "glass en-notfound"
    }, /*#__PURE__*/React.createElement("div", {
      className: "en-notfound-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "56",
      height: "56",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.2"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "8",
      x2: "12",
      y2: "13"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "16",
      x2: "12.01",
      y2: "16"
    }))), /*#__PURE__*/React.createElement("h1", {
      className: "en-notfound-title"
    }, "Esta entrada se mud\xF3 del archivo"), /*#__PURE__*/React.createElement("p", {
      className: "en-notfound-sub"
    }, "Quiz\xE1 la retiramos o el enlace cambi\xF3. Explora el resto del Journal."), /*#__PURE__*/React.createElement("button", {
      className: "btn-aqua btn-aqua-emerald",
      onClick: () => navigate('journal')
    }, "Ver todas las entradas")));
  }
  const body = entry.body || entry.excerpt;
  const paragraphs = String(body).split(/\n\s*\n/).filter(Boolean);
  const related = JOURNAL.filter(e => e.slug !== entry.slug && e.section === entry.section).slice(0, 3);
  while (related.length < 3) {
    const filler = JOURNAL.find(e => e.slug !== entry.slug && !related.includes(e));
    if (!filler) break;
    related.push(filler);
  }
  const copy = () => {
    const url = `https://bersagliojewelry.co/entrada.html?e=${encodeURIComponent(entry.slug)}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "container en-page"
  }, /*#__PURE__*/React.createElement("nav", {
    className: "en-breadcrumb",
    "aria-label": "Migas de pan"
  }, /*#__PURE__*/React.createElement("a", {
    className: "en-crumb",
    onClick: () => navigate('home')
  }, "Inicio"), /*#__PURE__*/React.createElement("span", {
    className: "en-crumb-sep",
    "aria-hidden": "true"
  }, "\u2192"), /*#__PURE__*/React.createElement("a", {
    className: "en-crumb",
    onClick: () => navigate('journal')
  }, "Journal"), /*#__PURE__*/React.createElement("span", {
    className: "en-crumb-sep",
    "aria-hidden": "true"
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    className: "en-crumb en-crumb-current"
  }, entry.section)), /*#__PURE__*/React.createElement("header", {
    className: "en-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "en-hero-flags"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono en-flag-section"
  }, entry.section.toUpperCase()), /*#__PURE__*/React.createElement("span", {
    className: "en-flag-divider"
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono en-flag-kicker"
  }, entry.kicker)), /*#__PURE__*/React.createElement("h1", {
    className: "en-title"
  }, entry.title), /*#__PURE__*/React.createElement("div", {
    className: "en-hero-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "en-hero-author-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "en-hero-avatar"
  }, jrAuthorInitials(entry.author)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "en-hero-author"
  }, entry.author), /*#__PURE__*/React.createElement("div", {
    className: "mono en-hero-role"
  }, entry.authorRole || ''))), /*#__PURE__*/React.createElement("div", {
    className: "en-hero-meta-right"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono en-hero-date"
  }, entry.dateLong || entry.date), /*#__PURE__*/React.createElement("span", {
    className: "en-hero-meta-divider"
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono en-hero-read"
  }, entry.read, " de lectura")))), /*#__PURE__*/React.createElement("figure", {
    className: "glass glass-iridescent en-featured"
  }, /*#__PURE__*/React.createElement("img", {
    src: entry.img,
    alt: entry.title,
    className: "en-featured-img",
    loading: "eager",
    decoding: "async"
  })), /*#__PURE__*/React.createElement("div", {
    className: "en-layout"
  }, /*#__PURE__*/React.createElement("article", {
    className: "en-body"
  }, paragraphs.map((p, i) => i === 0 ? /*#__PURE__*/React.createElement("p", {
    key: i,
    className: "en-body-p en-body-p--lede"
  }, /*#__PURE__*/React.createElement("span", {
    className: "en-dropcap"
  }, p.charAt(0)), p.slice(1)) : /*#__PURE__*/React.createElement("p", {
    key: i,
    className: "en-body-p"
  }, p))), /*#__PURE__*/React.createElement("aside", {
    className: "en-share",
    "aria-label": "Compartir entrada"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono en-share-label"
  }, "COMPARTIR"), /*#__PURE__*/React.createElement("div", {
    className: "en-share-btns"
  }, /*#__PURE__*/React.createElement("a", {
    className: "en-share-btn",
    href: `https://wa.me/?text=${encodeURIComponent(entry.title)}%20${encodeURIComponent('https://bersagliojewelry.co/entrada.html?e=' + entry.slug)}`,
    target: "_blank",
    rel: "noopener",
    "aria-label": "Compartir por WhatsApp"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20.5 3.5A11 11 0 0 0 3.4 17l-1.4 5.1 5.2-1.4A11 11 0 1 0 20.5 3.5zM12 20c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3.1-.2-.3C4.4 14.9 4 13.5 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8z"
  }))), /*#__PURE__*/React.createElement("a", {
    className: "en-share-btn",
    href: `mailto:?subject=${encodeURIComponent(entry.title)}&body=${encodeURIComponent('https://bersagliojewelry.co/entrada.html?e=' + entry.slug)}`,
    "aria-label": "Enviar por correo"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "22,6 12,13 2,6"
  }))), /*#__PURE__*/React.createElement("button", {
    className: "en-share-btn",
    type: "button",
    onClick: copy,
    "aria-label": "Copiar enlace"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "9",
    y: "9",
    width: "13",
    height: "13",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
  }))), /*#__PURE__*/React.createElement("span", {
    className: "en-share-feedback"
  }, copied ? '✓ Enlace copiado' : '')))), related.length > 0 && /*#__PURE__*/React.createElement("section", {
    className: "en-related"
  }, /*#__PURE__*/React.createElement("div", {
    className: "en-related-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono en-related-eyebrow"
  }, "SEGUIR LEYENDO"), /*#__PURE__*/React.createElement("h2", {
    className: "en-related-title"
  }, "M\xE1s de ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, entry.section))), /*#__PURE__*/React.createElement("div", {
    className: "en-related-grid"
  }, related.map(r => /*#__PURE__*/React.createElement("article", {
    key: r.slug,
    className: "glass en-related-card"
  }, /*#__PURE__*/React.createElement("a", {
    className: "en-related-link",
    onClick: () => openE(r.slug)
  }, /*#__PURE__*/React.createElement("div", {
    className: "en-related-imgwrap"
  }, /*#__PURE__*/React.createElement("img", {
    src: r.img,
    alt: r.title,
    className: "en-related-img",
    loading: "lazy",
    decoding: "async"
  })), /*#__PURE__*/React.createElement("div", {
    className: "en-related-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono en-related-meta"
  }, /*#__PURE__*/React.createElement("span", null, r.section), /*#__PURE__*/React.createElement("span", {
    className: "en-related-meta-dot"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, r.read)), /*#__PURE__*/React.createElement("h3", {
    className: "en-related-headline"
  }, r.title))))))), /*#__PURE__*/React.createElement("div", {
    className: "en-back"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua en-back-btn",
    onClick: () => navigate('journal')
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M19 12H5M12 5l-7 7 7 7"
  })), "Volver al Journal")));
}

// ════════════════════════════════════════════════════════════════════
// LISTA DE DESEOS — mirror of js/pages/lista-deseos.js (.wl-* classes)
// ════════════════════════════════════════════════════════════════════
function ListaDeseosScreen({
  wishlist: wl,
  items,
  onToggleWish,
  onAddCart,
  onClear,
  navigate
}) {
  const rows = wl.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  const shareURL = (() => {
    const lines = rows.map(p => `• ${p.name}\n  https://bersagliojewelry.co/pieza.html?p=${p.slug || p.id}`);
    const msg = `Hola Bersaglio, me interesan estas piezas de mi lista:\n\n${lines.join('\n\n')}`;
    return `https://wa.me/573013752592?text=${encodeURIComponent(msg)}`;
  })();
  return /*#__PURE__*/React.createElement("div", {
    className: "container wl-page"
  }, /*#__PURE__*/React.createElement("section", {
    className: "wl-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow wl-hero-eyebrow"
  }, "Tus favoritas \xB7 ", rows.length), /*#__PURE__*/React.createElement("h1", {
    className: "wl-hero-title"
  }, "Lista de ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "deseos")), /*#__PURE__*/React.createElement("p", {
    className: "wl-hero-lead"
  }, "Las piezas que te detuvieron. Vuelve cuando quieras, comparte con quien quieras, agrega al carrito cuando est\xE9s lista.")), rows.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "wl-empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wl-empty-icon",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "64",
    height: "64",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
  }))), /*#__PURE__*/React.createElement("h2", {
    className: "wl-empty-title"
  }, "Tu lista est\xE1 vac\xEDa"), /*#__PURE__*/React.createElement("p", {
    className: "wl-empty-sub"
  }, "Guarda piezas que te inspiren tocando el coraz\xF3n en cualquier ficha."), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => navigate('catalogo')
  }, "Explorar el cat\xE1logo")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "wl-grid"
  }, rows.map(p => {
    const inCart = items.some(i => i.id === p.id);
    return /*#__PURE__*/React.createElement("article", {
      key: p.id,
      className: "glass glass-iridescent wl-card"
    }, /*#__PURE__*/React.createElement("a", {
      className: "wl-card-imglink"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wl-card-img",
      style: {
        background: `url('${p.img}') center/cover`
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "wl-card-vignette",
      "aria-hidden": "true"
    })), /*#__PURE__*/React.createElement("div", {
      className: "wl-card-body"
    }, /*#__PURE__*/React.createElement("a", {
      className: "wl-card-name"
    }, p.name), /*#__PURE__*/React.createElement("div", {
      className: "mono wl-card-price"
    }, fmt$(p.price)), /*#__PURE__*/React.createElement("div", {
      className: "wl-card-actions"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: 'wl-card-cart' + (inCart ? ' is-in-cart' : ''),
      onClick: () => onAddCart(p)
    }, inCart ? 'En carrito' : 'Al carrito'), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "wl-card-remove",
      "aria-label": "Quitar de favoritos",
      onClick: () => onToggleWish(p.id)
    }, "Quitar"))));
  })), /*#__PURE__*/React.createElement("div", {
    className: "wl-actions"
  }, /*#__PURE__*/React.createElement("a", {
    href: shareURL,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "btn-aqua btn-aqua-emerald wl-share-btn"
  }, "Consultar lista por WhatsApp", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  }))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-aqua wl-clear-btn",
    onClick: () => {
      if (confirm('¿Vaciar toda la lista de deseos?')) onClear();
    }
  }, "Vaciar la lista"))));
}

// ════════════════════════════════════════════════════════════════════
// GRACIAS — mirror of js/pages/gracias.js (confirmation, .lg-page--gracias)
// ════════════════════════════════════════════════════════════════════
const GR_MESSAGES = {
  transferencia: {
    eyebrow: 'TRANSFERENCIA BANCARIA',
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Una elecci\xF3n excepcional. Iniciamos la creaci\xF3n de tu ", /*#__PURE__*/React.createElement("span", {
      className: "italic emerald-text"
    }, "pieza"), "."),
    body: 'En las próximas horas te enviaremos el detalle y la confirmación de tu encargo por correo privado. Al confirmarse la transferencia bancaria, nuestro atelier dará inicio a la confección y coordinaremos el envío asegurado.',
    nextLabel: 'Bitácora enviada en menos de 24 horas hábiles'
  },
  asesor: {
    eyebrow: 'ASESOR PRIVADO',
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Un encuentro en la distancia. Te ", /*#__PURE__*/React.createElement("span", {
      className: "italic emerald-text"
    }, "llamamos"), " pronto."),
    body: 'Kary Mendoza o un gemólogo del atelier se comunicará contigo de forma confidencial en menos de cuatro horas. Compartiremos referencias, responderemos tus dudas y agendaremos, si lo deseas, una videollamada o cita presencial.',
    nextLabel: 'Contacto en menos de 4 horas hábiles'
  },
  visita: {
    eyebrow: 'CITA PRIVADA CONCERTADA',
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Cartagena de Indias te espera. El caf\xE9 ", /*#__PURE__*/React.createElement("span", {
      className: "italic emerald-text"
    }, "estar\xE1 listo"), "."),
    body: 'Confirmaremos tu cita privada de forma directa. El atelier estará cerrado exclusivamente para ti; Kary Mendoza te recibirá personalmente en Casa San Agustín.',
    nextLabel: 'Confirmación directa en pocas horas'
  },
  llamada: {
    eyebrow: 'LLAMADA CONFIDENCIAL RESERVADA',
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Conversaci\xF3n de ", /*#__PURE__*/React.createElement("span", {
      className: "italic emerald-text"
    }, "intenci\xF3n"), "."),
    body: 'Nos comunicaremos en el horario solicitado para iniciar un diálogo pausado. Si prefieres reprogramar por WhatsApp o cambiar de vía de contacto, estamos enteramente a tu disposición.',
    nextLabel: 'Te llamamos en el horario solicitado'
  },
  mensaje: {
    eyebrow: 'CONFIDENCIA RECIBIDA',
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Agradecemos tu confianza. Te ", /*#__PURE__*/React.createElement("span", {
      className: "italic emerald-text"
    }, "respondemos"), " en persona."),
    body: 'Tu mensaje es atendido de forma confidencial y directa por Kary Mendoza o un especialista del atelier. Prescindimos de asistentes virtuales; valoramos el tiempo y el trato humano.',
    nextLabel: 'Respuesta en menos de 24 horas hábiles'
  },
  default: {
    eyebrow: 'CORTESÍA BERSAGLIO',
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Te ", /*#__PURE__*/React.createElement("span", {
      className: "italic emerald-text"
    }, "escribimos"), " de manera directa."),
    body: 'Hemos recibido tu solicitud. Un gemólogo de nuestro atelier se pondrá en contacto contigo a la brevedad. Mientras tanto, te invitamos a explorar el catálogo o leer el Journal.',
    nextLabel: 'Contacto en menos de 24 horas hábiles'
  }
};
function GraciasScreen({
  method = 'default',
  navigate
}) {
  const msg = GR_MESSAGES[method] || GR_MESSAGES.default;
  return /*#__PURE__*/React.createElement("div", {
    className: "container lg-page lg-page--gracias"
  }, /*#__PURE__*/React.createElement("section", {
    className: "lg-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg-check",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "40",
    height: "40",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "2.5"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6L9 17l-5-5"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mono lg-eyebrow"
  }, msg.eyebrow), /*#__PURE__*/React.createElement("h1", {
    className: "lg-title"
  }, msg.title), /*#__PURE__*/React.createElement("p", {
    className: "lg-body"
  }, msg.body), /*#__PURE__*/React.createElement("div", {
    className: "lg-pill",
    "aria-label": "Tiempo estimado"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lg-pill-dot"
  }), msg.nextLabel), /*#__PURE__*/React.createElement("div", {
    className: "lg-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => navigate('catalogo')
  }, "Ver colecciones"), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua",
    onClick: () => navigate('journal')
  }, "Leer el Journal"))));
}

// ════════════════════════════════════════════════════════════════════
// LEGAL — shared layout for Términos & Privacidad (mirror of legal.css .lg-*)
// ════════════════════════════════════════════════════════════════════
function LegalScreen({
  eyebrow,
  title,
  sub,
  sections,
  lastUpdate,
  foot,
  navigate
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "container lg-page"
  }, /*#__PURE__*/React.createElement("header", {
    className: "lg-pagehero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono lg-eyebrow"
  }, "DOCUMENTACI\xD3N LEGAL"), /*#__PURE__*/React.createElement("h1", {
    className: "lg-pagehero-title"
  }, eyebrow, " ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, title)), /*#__PURE__*/React.createElement("p", {
    className: "lg-pagehero-sub"
  }, sub), /*#__PURE__*/React.createElement("div", {
    className: "mono lg-update"
  }, "\xDAltima actualizaci\xF3n \xB7 ", lastUpdate)), /*#__PURE__*/React.createElement("div", {
    className: "lg-layout"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "lg-toc",
    "aria-label": "Tabla de contenidos"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono lg-toc-eyebrow"
  }, "EN ESTA P\xC1GINA"), /*#__PURE__*/React.createElement("ol", {
    className: "lg-toc-list"
  }, sections.map(s => /*#__PURE__*/React.createElement("li", {
    key: s.id
  }, /*#__PURE__*/React.createElement("a", {
    className: "lg-toc-link",
    href: `#${s.id}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono lg-toc-num"
  }, s.n), s.title))))), /*#__PURE__*/React.createElement("article", {
    className: "lg-prose"
  }, sections.map(s => {
    const paragraphs = String(s.body).split(/\n\s*\n/).filter(Boolean);
    return /*#__PURE__*/React.createElement("section", {
      key: s.id,
      id: s.id,
      className: "lg-section"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lg-section-head"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono lg-section-num"
    }, s.n), /*#__PURE__*/React.createElement("h2", {
      className: "lg-section-title"
    }, s.title)), /*#__PURE__*/React.createElement("div", {
      className: "lg-section-body"
    }, paragraphs.map((p, i) => /*#__PURE__*/React.createElement("p", {
      key: i
    }, p))));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "lg-foot"
  }, /*#__PURE__*/React.createElement("p", null, foot), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua lg-back-btn",
    onClick: () => navigate('home')
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M19 12H5M12 5l-7 7 7 7"
  })), "Volver al inicio")));
}
const TERMINOS_SECTIONS = [{
  id: 'objeto',
  n: '01',
  title: 'Objeto',
  body: `Estos términos regulan la relación entre Bersaglio Jewelry (en adelante, "el Atelier") y la persona que adquiere productos o servicios a través del sitio web bersagliojewelry.co, del atelier físico en Cartagena de Indias o de cualquier canal directo (WhatsApp, correo electrónico, llamada telefónica).\n\nAl usar el sitio o iniciar una compra, aceptas estos términos en su totalidad. Si no estás de acuerdo, te pedimos cerrar la pestaña y no proceder.`
}, {
  id: 'productos',
  n: '02',
  title: 'Productos y precios',
  body: `Cada pieza Bersaglio es única o producida en series muy limitadas. Las fotografías son fieles; sin embargo, debido a variaciones de luz, calibración de pantalla y la naturaleza misma de las gemas naturales, el color real puede presentar diferencias mínimas respecto a la imagen.\n\nLos precios se expresan en pesos colombianos (COP) y ya incluyen el IVA del 19%. Los envíos internacionales pueden generar aranceles y trámites aduaneros del país destino que corren por cuenta del comprador. Los precios pueden variar sin previo aviso, pero una vez confirmada una compra el precio queda bloqueado.`
}, {
  id: 'cierre-compra',
  n: '03',
  title: 'Cierre de compra',
  body: `Por la naturaleza de alta gama de cada pieza, todas las compras se cierran en conversación con un asesor: WhatsApp, correo, llamada o visita al atelier. No procesamos pagos automáticos directos en el sitio web.\n\nMétodos de pago aceptados: transferencia bancaria (Bancolombia, Davivienda), tarjetas Visa/Mastercard procesadas presencial o vía link de pago, financiación hasta 12 meses con entidades aliadas para piezas superiores a $50.000.000 COP.`
}, {
  id: 'envios',
  n: '04',
  title: 'Envíos',
  body: `Despachos nacionales (Colombia): envío gratuito con seguro pleno por Servientrega Premium, 2-5 días hábiles dependiendo de la ciudad.\n\nDespachos internacionales: DHL Express o FedEx Priority con seguro declarado por el valor total de la pieza, 5-8 días hábiles, entrega registrada con firma. Aranceles e impuestos del país destino son responsabilidad del comprador.\n\nCada pieza viaja en estuche de presentación Bersaglio, con libreta de origen (mina de la gema, oficio del orfebre, certificación GIA si aplica) y certificado de garantía de por vida.`
}, {
  id: 'garantia',
  n: '05',
  title: 'Garantía',
  body: `Toda pieza Bersaglio cuenta con garantía de por vida en estructura y engaste. Esto incluye: reparación gratuita si una piedra se afloja, restauración si una soldadura cede, redimensionado de anillos hasta dos tallas arriba/abajo (un servicio por pieza), limpieza profesional y pulido (un servicio anual sin costo).\n\nLa garantía no cubre: daño por golpe directo (caída sobre piedra), exposición prolongada a químicos abrasivos (cloro, ammonia, blanqueador), modificación realizada por terceros ajenos al Atelier, robo o pérdida.`
}, {
  id: 'devoluciones',
  n: '06',
  title: 'Devoluciones y cambios',
  body: `Piezas a medida: por su naturaleza única, las piezas diseñadas a medida no admiten devolución. Sí admitimos cambios en boceto y prototipo de cera previo a la fundición, sin costo adicional, hasta tres iteraciones.\n\nPiezas de catálogo: aceptamos cambio (no reembolso en efectivo) dentro de los 15 días hábiles siguientes a la entrega, siempre que la pieza llegue en condiciones impecables, con estuche, libreta y certificado. El cliente cubre el costo de envío del cambio.`
}, {
  id: 'propiedad',
  n: '07',
  title: 'Propiedad intelectual',
  body: `Todas las imágenes, textos, diseños y videos publicados en bersagliojewelry.co son propiedad de Bersaglio Jewelry o se usan bajo licencia. Está prohibida su reproducción total o parcial sin autorización expresa por escrito.\n\nLos diseños de joyas Bersaglio están protegidos por derecho de autor. Está prohibida la reproducción industrial o artesanal de las piezas, incluyendo aquellas hechas a medida para clientes específicos.`
}, {
  id: 'modificaciones',
  n: '08',
  title: 'Modificaciones',
  body: `Podemos actualizar estos términos en cualquier momento. La versión vigente es siempre la publicada en esta página, con la fecha de última actualización al inicio. Te recomendamos revisarlos periódicamente.`
}, {
  id: 'jurisdiccion',
  n: '09',
  title: 'Ley aplicable y jurisdicción',
  body: `Estos términos se rigen por la ley colombiana. Cualquier controversia se someterá a los tribunales competentes de Cartagena de Indias, salvo cuando la ley de protección al consumidor disponga otra cosa.`
}];
const PRIVACIDAD_SECTIONS = [{
  id: 'compromiso',
  n: '01',
  title: 'Nuestro compromiso',
  body: `Bersaglio Jewelry trata tus datos personales con el mismo cuidado con el que tratamos una esmeralda Muzo Vieja: con paciencia, con discreción, y con la certeza de que cada decisión sobre tu información debe pasar primero por la pregunta "¿esto es necesario para servirte mejor?".\n\nEsta política explica qué datos recolectamos, por qué, cómo los protegemos y qué derechos tienes sobre ellos.`
}, {
  id: 'responsable',
  n: '02',
  title: 'Responsable del tratamiento',
  body: `Bersaglio Jewelry S.A.S., NIT en proceso de actualización, con domicilio en Calle 36 # 6-32, San Agustín Chiquita, Centro Histórico, Cartagena de Indias, Bolívar, Colombia.\n\nContacto del responsable: info@bersagliojewelry.co · WhatsApp +57 301 375 2592.`
}, {
  id: 'datos-recolectados',
  n: '03',
  title: 'Datos que recolectamos',
  body: `Datos de contacto: nombre, apellido, correo electrónico, número de teléfono o WhatsApp, dirección postal.\n\nDatos de pedido: piezas que has consultado o adquirido, métodos de pago utilizados (procesados por terceros, nunca almacenamos números de tarjeta), historial de conversaciones por WhatsApp o correo.\n\nDatos de navegación: páginas visitadas en bersagliojewelry.co, tiempo en cada página, dispositivo y navegador usados, IP aproximada (recolectados vía cookies y Google Analytics si has aceptado el consentimiento de cookies).\n\nDatos opcionales: cualquier información adicional que decidas compartir al contactarnos (presupuesto orientativo, ocasión, gemas de tu interés, gemas heredadas que quieras integrar).`
}, {
  id: 'finalidad',
  n: '04',
  title: 'Finalidad del tratamiento',
  body: `Atender tus solicitudes de información, asesoría o compra. Procesar pedidos y coordinar envíos. Enviarte el newsletter mensual del Atelier si te has suscrito (con derecho a cancelar en cualquier momento desde el enlace en cada correo).\n\nMejorar nuestro servicio: analizamos datos agregados de navegación para entender qué piezas atraen más interés, qué páginas se leen más, qué dudas suelen surgir. Nunca usamos datos individuales para perfilamiento publicitario.`
}, {
  id: 'compartir',
  n: '05',
  title: 'Con quién compartimos tus datos',
  body: `Nunca vendemos ni cedemos tus datos a terceros con fines comerciales.\n\nCompartimos información estrictamente necesaria con: empresas de mensajería (DHL, FedEx, Servientrega) para coordinar envíos; pasarelas de pago (Wompi, link de pago bancario) cuando realizas una compra; servicios técnicos (Firebase de Google, Brevo para correo transaccional) que alojan o procesan datos bajo acuerdos de confidencialidad y conformidad con regulación de protección de datos.\n\nEn el caso de autoridades judiciales o regulatorias, cumpliremos con cualquier solicitud formal y debidamente notificada por estos canales.`
}, {
  id: 'derechos',
  n: '06',
  title: 'Tus derechos',
  body: `Tienes derecho a conocer, actualizar, rectificar y suprimir tus datos personales en cualquier momento. Para ejercer estos derechos, escribe a info@bersagliojewelry.co con asunto "Datos personales" y te responderemos en máximo 10 días hábiles.\n\nTambién puedes solicitar una copia de toda la información que tenemos sobre ti, oponerte al uso de cookies analíticas, o revocar tu suscripción al newsletter desde cualquier correo que recibas. Ningún ejercicio de derechos afecta el servicio que prestamos.`
}, {
  id: 'cookies',
  n: '07',
  title: 'Cookies',
  body: `Usamos cookies estrictamente necesarias (para que el sitio funcione, recordar tu carrito y lista de deseos) y cookies analíticas opcionales (Google Analytics) que solo se activan tras tu consentimiento explícito en el banner.\n\nPuedes rechazar las cookies opcionales sin afectar tu experiencia. El banner aparece en tu primera visita; tu decisión queda guardada localmente en tu navegador.`
}, {
  id: 'seguridad',
  n: '08',
  title: 'Seguridad',
  body: `Todos los datos viajan cifrados (HTTPS / TLS 1.3) y se almacenan en infraestructura de Google Cloud con cifrado en reposo. Los accesos al panel administrativo requieren autenticación multifactor.\n\nNunca almacenamos números completos de tarjetas de crédito; las pasarelas de pago manejan esa información bajo certificación PCI-DSS.`
}, {
  id: 'menores',
  n: '09',
  title: 'Menores de edad',
  body: `Nuestros servicios están dirigidos a personas mayores de 18 años. No recolectamos conscientemente datos de menores de edad. Si detectamos información de un menor, la eliminamos de inmediato.`
}, {
  id: 'cambios',
  n: '10',
  title: 'Cambios a esta política',
  body: `Podemos actualizar esta política para reflejar cambios legales, técnicos o de negocio. La versión vigente es siempre la publicada en esta página, con la fecha de última actualización al inicio. Si hacemos un cambio sustantivo (por ejemplo, agregar un nuevo destinatario de datos), te avisaremos por correo electrónico si te has suscrito.`
}];
function TerminosScreen({
  navigate
}) {
  return /*#__PURE__*/React.createElement(LegalScreen, {
    eyebrow: "T\xE9rminos y",
    title: "condiciones",
    sub: "C\xF3mo funcionan las compras, los env\xEDos, la garant\xEDa y los cambios en Bersaglio Jewelry. Texto plano, sin trampas.",
    sections: TERMINOS_SECTIONS,
    lastUpdate: "2026-04-12",
    foot: /*#__PURE__*/React.createElement(React.Fragment, null, "\xBFUna duda espec\xEDfica? Escr\xEDbenos a ", /*#__PURE__*/React.createElement("a", {
      href: "mailto:info@bersagliojewelry.co"
    }, "info@bersagliojewelry.co"), " o por ", /*#__PURE__*/React.createElement("a", {
      href: "https://wa.me/573013752592",
      target: "_blank",
      rel: "noopener"
    }, "WhatsApp"), "."),
    navigate: navigate
  });
}
function PrivacidadScreen({
  navigate
}) {
  return /*#__PURE__*/React.createElement(LegalScreen, {
    eyebrow: "Pol\xEDtica de",
    title: "privacidad",
    sub: "C\xF3mo cuidamos tu informaci\xF3n personal. Sin tecnicismos innecesarios. Sin trampas.",
    sections: PRIVACIDAD_SECTIONS,
    lastUpdate: "2026-04-12",
    foot: /*#__PURE__*/React.createElement(React.Fragment, null, "\xBFQuieres ejercer un derecho sobre tus datos? Escr\xEDbenos a ", /*#__PURE__*/React.createElement("a", {
      href: "mailto:info@bersagliojewelry.co"
    }, "info@bersagliojewelry.co"), "."),
    navigate: navigate
  });
}
Object.assign(window, {
  NosotrosScreen,
  ContactoScreen,
  CarritoScreen,
  JournalScreen,
  EntradaScreen,
  ListaDeseosScreen,
  GraciasScreen,
  TerminosScreen,
  PrivacidadScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/Pages.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/Screens.jsx
try { (() => {
/* global React, CATEGORIES, PRODUCTS, MARQUEE, SERVICES, fmt$,
   BersaglioLogo, IconArrow, IconHeart, IconPin, IconShield, IconCheck, ServiceIcon */
// Bersaglio storefront — Home, Catalog and Product-detail screens.

const Diamond = () => /*#__PURE__*/React.createElement("span", {
  className: "dia",
  style: {
    display: 'inline-flex',
    alignItems: 'center'
  }
}, /*#__PURE__*/React.createElement("svg", {
  width: "6",
  height: "6",
  viewBox: "0 0 10 10"
}, /*#__PURE__*/React.createElement("rect", {
  x: "2.5",
  y: "2.5",
  width: "5",
  height: "5",
  transform: "rotate(45 5 5)",
  fill: "currentColor"
})));

// Count-up that fires when scrolled into view (scroll-based; IO is unreliable in preview)
function CountUp({
  to,
  suffix = '',
  dur = 1400
}) {
  const [n, setN] = React.useState(0);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let id, anim;
    const animate = () => {
      const steps = Math.max(1, Math.round(dur / 16));
      let i = 0;
      anim = setInterval(() => {
        i++;
        const p = Math.min(1, i / steps);
        setN(Math.round((1 - Math.pow(1 - p, 3)) * to));
        if (p >= 1) clearInterval(anim);
      }, 16);
    };
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
        animate();
        return;
      }
      id = setTimeout(check, 120);
    };
    id = setTimeout(check, 60);
    return () => {
      clearTimeout(id);
      clearInterval(anim);
    };
  }, [to]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref
  }, n, suffix);
}

// Scroll-reveal driven by React state so it survives re-renders (className stays applied)
function useReveal(delay = 0) {
  const ref = React.useRef(null);
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el) return;
    let id;
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > -40) {
        setShown(true);
        return;
      }
      id = setTimeout(check, 120);
    };
    id = setTimeout(check, 60);
    return () => clearTimeout(id);
  }, [shown]);
  return [ref, 'reveal' + (shown ? ' in' : ''), {
    '--d': delay + 'ms'
  }];
}

// One animated category tile
function CatTile({
  c,
  i,
  navigate
}) {
  const [ref, cls, st] = useReveal(i * 70);
  return /*#__PURE__*/React.createElement("a", {
    ref: ref,
    className: 'glass k-cat ' + cls,
    style: st,
    onClick: () => navigate('catalogo')
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-cat-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-cat-img",
    style: {
      backgroundImage: `url(${c.img})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "k-cat-shade"
  }), /*#__PURE__*/React.createElement("div", {
    className: "k-cat-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-cat-name"
  }, c.name), /*#__PURE__*/React.createElement("div", {
    className: "mono k-cat-count"
  }, "Ver piezas"))));
}

// One animated service card
function ServiceCard({
  s,
  i
}) {
  const [ref, cls, st] = useReveal(i * 80);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: 'glass ' + cls,
    style: {
      padding: '26px 22px',
      borderRadius: 28,
      textAlign: 'center',
      ...st
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60,
      height: 60,
      margin: '0 auto 16px',
      borderRadius: '50%',
      background: 'radial-gradient(circle at 30% 30%, oklch(95% 0.08 150), oklch(65% 0.17 155) 70%)',
      boxShadow: 'inset 0 2px 0 oklch(100% 0 0 / 0.9), 0 8px 24px -4px oklch(50% 0.15 155 / 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement(ServiceIcon, {
    name: s.icon,
    size: 22,
    sw: 1.6
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 19,
      fontWeight: 500,
      color: 'var(--bj-ink-emerald)',
      marginBottom: 8
    }
  }, s.t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--bj-ink-soft)',
      lineHeight: 1.6
    }
  }, s.d));
}

// ════════════════════════════════════════════════════════════════════
// HOME — mirror of js/pages/home.js (9 sections, .home-* / .at-* / .hj-* classes)
// ════════════════════════════════════════════════════════════════════
const HOME_MARQUEE = ['Oro 18K · Ley 750', 'Esmeraldas Colombianas', 'Asesoría Personalizada', 'Garantía Vitalicia', 'Atelier en Cartagena', 'Envío Asegurado Mundial', 'Una pieza, una historia'];
const HOME_CATEGORIES = [{
  name: 'Anillos',
  slug: 'anillos',
  img: '../../assets/ring-sapphire.webp',
  hue: 200,
  pos: 'center'
}, {
  name: 'Topos',
  slug: 'topos-aretes',
  img: '../../assets/earrings-travertino.webp',
  hue: 30,
  pos: 'center'
}, {
  name: 'Argollas',
  slug: 'argollas',
  img: '../../assets/earrings-emerald.webp',
  hue: 155,
  pos: 'center'
}, {
  name: 'Dijes',
  slug: 'dijes-colgantes',
  img: '../../assets/model-emerald.webp',
  hue: 155,
  pos: 'center top'
}, {
  name: 'Pulseras',
  slug: 'pulseras',
  img: '../../assets/banner-hero.webp',
  hue: 90,
  pos: 'center'
}, {
  name: 'Editorial',
  slug: 'editorial',
  img: '../../assets/model-emerald.webp',
  hue: 155,
  pos: 'center'
}];
const HOME_SERVICES = [{
  t: 'Diseño a medida',
  d: 'Crea la pieza de tus sueños con nuestro atelier. Desde boceto hasta entrega.',
  icon: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m12 19 7-7 3 3-7 7-3-3z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m2 2 7.586 7.586"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "2"
  }))
}, {
  t: 'Asesoría privada',
  d: 'Consulta 1:1 con nuestros gemólogos. Virtual o en nuestra casa en Cartagena.',
  icon: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "7",
    r: "4"
  }))
}, {
  t: 'Certificación GIA',
  d: 'Cada pieza con diamante incluye certificado del Gemological Institute.',
  icon: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 12 2 2 4-4"
  }))
}, {
  t: 'Garantía vitalicia',
  d: 'Mantenimiento, pulido y verificación de piedras de por vida.',
  icon: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 12 2 2 4-4"
  }))
}];
const HOME_ATELIER_STEPS = [{
  n: '01',
  t: 'El Diseño y Concepto',
  d: 'Concebimos la joya desde el boceto inicial sobre papel, seleccionando metales nobles y gemas con carácter propio.',
  corner: 0
}, {
  n: '02',
  t: 'Asesoría Confidencial',
  d: 'Te acompañamos en cada etapa de la elección. Un diálogo íntimo y pausado para dar con la pieza exacta que refleje tu legado.',
  corner: 1
}, {
  n: '03',
  t: 'Garantía y Certificación',
  d: 'Respaldamos la autenticidad y excelencia de cada piedra con reportes internacionales de la GIA y origen de mina.',
  corner: 2
}, {
  n: '04',
  t: 'Custodia de por vida',
  d: 'Nuestras piezas nacen con vocación de eternidad. Ofrecemos mantenimiento, pulido y restauración vitalicia sin límites.',
  corner: 3
}];
function HomeScreen({
  navigate,
  openPieza,
  wishlist,
  toggleWish,
  openQuickView,
  openEntrada
}) {
  const featured = PRODUCTS.slice(0, 6);
  const tripled = [...HOME_MARQUEE, ...HOME_MARQUEE, ...HOME_MARQUEE];
  const cover = JOURNAL.find(e => e.featured) || JOURNAL[0];
  const rest = JOURNAL.filter(e => e !== cover);
  const journalSide = rest.slice(0, 4).map(e => ({
    sec: e.section,
    date: e.date,
    title: e.title,
    read: e.read,
    slug: e.slug
  }));
  const journalTrio = rest.slice(4, 7).map(t => ({
    sec: t.section,
    title: t.title,
    who: t.author,
    img: t.img,
    slug: t.slug
  }));
  const tickerDoubled = [...JOURNAL_TICKER, ...JOURNAL_TICKER];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    className: "home-hero",
    "data-hero": true
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    className: "home-hero-bg"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-hero-blob home-hero-blob--em"
  }), /*#__PURE__*/React.createElement("div", {
    className: "home-hero-blob home-hero-blob--gold"
  })), /*#__PURE__*/React.createElement("div", {
    className: "home-hero-stage"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-hero-frame"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-hero-banner",
    "data-tilt": true
  }, /*#__PURE__*/React.createElement("picture", {
    className: "home-hero-img",
    "data-tilt-img": true
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/banner-hero.webp",
    alt: "Atelier Bersaglio en Cartagena de Indias",
    fetchPriority: "high",
    decoding: "async",
    className: "home-hero-img-fallback"
  })), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    className: "home-hero-rim"
  }), /*#__PURE__*/React.createElement("div", {
    className: "home-hero-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-hero-locator-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono home-hero-locator"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "10",
    r: "2.5"
  })), "Cartagena de Indias \xB7 Colombia")), /*#__PURE__*/React.createElement("div", {
    className: "home-hero-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-hero-eyebrow-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "home-hero-eyebrow-line"
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono home-hero-eyebrow"
  }, "Alta Joyer\xEDa Personalizada y de Confianza")), /*#__PURE__*/React.createElement("h1", {
    className: "home-hero-headline"
  }, "El arte de escuchar tu historia,", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "home-hero-headline-italic"
  }, "tallado en una joya \xFAnica.")), /*#__PURE__*/React.createElement("p", {
    className: "home-hero-manifesto"
  }, "Nacimos visitando a nuestros clientes de puerta en puerta, cimentando una relaci\xF3n de cercan\xEDa y confianza duradera. En nuestro atelier privado del Centro Hist\xF3rico de Cartagena, no dise\xF1amos simples accesorios: nos tomamos el tiempo para asesorarte y dar vida a piezas irrepetibles de oro de 18 quilates y esmeraldas colombianas \xE9ticas. Una inversi\xF3n emocional y material destinada a custodiar tu esencia para siempre."), /*#__PURE__*/React.createElement("div", {
    className: "home-hero-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-hero",
    onClick: () => navigate('catalogo')
  }, /*#__PURE__*/React.createElement("span", {
    className: "btn-hero-bg",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: "btn-hero-shimmer",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: "btn-hero-label"
  }, "Descubrir la colecci\xF3n"), /*#__PURE__*/React.createElement("span", {
    className: "btn-hero-arrow",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  }))))))), /*#__PURE__*/React.createElement("div", {
    className: "home-hero-signature"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono home-hero-signature-eyebrow"
  }, "Una creaci\xF3n de"), /*#__PURE__*/React.createElement("span", {
    className: "home-hero-signature-line"
  }), /*#__PURE__*/React.createElement("span", {
    className: "home-hero-signature-name"
  }, "Kary Mendoza")))))), /*#__PURE__*/React.createElement("section", {
    className: "home-marquee"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-fade hm-fade--left",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hm-fade hm-fade--right",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hm-row"
  }, tripled.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "hm-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hm-text"
  }, t), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    className: "hm-sep"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hm-sep-line"
  }), /*#__PURE__*/React.createElement("svg", {
    width: "6",
    height: "6",
    viewBox: "0 0 10 10"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "2.5",
    y: "2.5",
    width: "5",
    height: "5",
    transform: "rotate(45 5 5)",
    fill: "currentColor"
  })), /*#__PURE__*/React.createElement("span", {
    className: "hm-sep-line"
  }))))))), /*#__PURE__*/React.createElement("section", {
    className: "home-cats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-cats-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Colecciones singulares"), /*#__PURE__*/React.createElement("h2", {
    className: "home-cats-title"
  }, "La refracci\xF3n del ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "alma verde")), /*#__PURE__*/React.createElement("p", {
    className: "home-cats-lead"
  }, "Nuestras colecciones son cap\xEDtulos de una historia compartida. Cada anillo, arete y dije es esculpido pacientemente en oro de 18K, rindiendo homenaje al fuego interno y la m\xEDstica de la esmeralda colombiana.")), /*#__PURE__*/React.createElement("div", {
    className: "cat-dock"
  }, HOME_CATEGORIES.map(c => {
    const count = PRODUCTS.filter(p => p.collection === c.slug).length;
    return /*#__PURE__*/React.createElement("a", {
      key: c.slug,
      className: "glass cat-tile",
      onClick: () => navigate('catalogo'),
      style: {
        '--cat-hue': c.hue
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "cat-tile-inner"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cat-tile-img",
      style: {
        background: `url('${c.img}') ${c.pos}/cover`
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "cat-tile-overlay"
    }), /*#__PURE__*/React.createElement("div", {
      className: "cat-tile-content"
    }, /*#__PURE__*/React.createElement("div", {
      className: "cat-tile-name"
    }, c.name), /*#__PURE__*/React.createElement("div", {
      className: "mono cat-tile-count"
    }, count > 0 ? `${count} pieza${count === 1 ? '' : 's'}` : 'Próximamente'))));
  })))), /*#__PURE__*/React.createElement("section", {
    className: "home-featured"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-featured-header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Curadur\xEDa del Atelier"), /*#__PURE__*/React.createElement("h2", {
    className: "home-featured-title"
  }, "Piezas ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "singulares"))), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua home-featured-cta",
    onClick: () => navigate('catalogo')
  }, "Explorar el cat\xE1logo entero", /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "home-featured-grid"
  }, featured.map(p => {
    const tag = p.tag || (p.featured ? 'Destacada' : null);
    const stones = p.specs?.stones || p.specs?.stone || '';
    const metal = p.specs?.metal || p.specs?.gold || '';
    const col = COLLECTIONS.find(c => c.slug === p.collection);
    const wished = wishlist.includes(p.id);
    return /*#__PURE__*/React.createElement("a", {
      key: p.id,
      className: "glass glass-iridescent home-featured-card",
      onClick: () => openPieza(p.id)
    }, /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-imgwrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-img",
      style: {
        background: `url('${p.images?.[0] || p.img}') center/cover`
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-vignette",
      "aria-hidden": "true"
    }), tag && /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-tag"
    }, /*#__PURE__*/React.createElement("div", {
      className: "chip"
    }, /*#__PURE__*/React.createElement("span", {
      className: "chip-dot"
    }), tag)), /*#__PURE__*/React.createElement("button", {
      className: "home-featured-card-wishlist",
      "aria-label": "Guardar",
      onClick: e => {
        e.stopPropagation();
        toggleWish(p.id);
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: wished ? 'currentColor' : 'none',
      stroke: "currentColor",
      strokeWidth: "1.8"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-cat"
    }, col?.name || p.collection), /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-name"
    }, p.name), /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-meta"
    }, [stones, metal].filter(Boolean).join(' · ')), /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-foot"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mono home-featured-card-price"
    }, fmt$(p.price)), /*#__PURE__*/React.createElement("div", {
      className: "home-featured-card-arrow"
    }, "Ver pieza", /*#__PURE__*/React.createElement("svg", {
      width: "10",
      height: "10",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M5 12h14M13 5l7 7-7 7"
    }))))));
  })))), /*#__PURE__*/React.createElement("section", {
    className: "home-editorial"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-editorial-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent home-editorial-image"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-editorial-image-bg"
  }), /*#__PURE__*/React.createElement("div", {
    className: "home-editorial-image-shade"
  }), /*#__PURE__*/React.createElement("div", {
    className: "home-editorial-image-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chip home-editorial-chip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip-dot"
  }), "Editorial"), /*#__PURE__*/React.createElement("h3", {
    className: "home-editorial-image-title"
  }, "La Verde, 2026"), /*#__PURE__*/React.createElement("p", {
    className: "home-editorial-image-sub"
  }, "Seis piezas esculpidas alrededor de la luz esmeralda colombiana."))), /*#__PURE__*/React.createElement("div", {
    className: "glass home-editorial-text"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Nuestra filosof\xEDa"), /*#__PURE__*/React.createElement("h2", {
    className: "home-editorial-title"
  }, "El arte de la orfebrer\xEDa pausada:", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "m\xE1s que una joya, un legado familiar.")), /*#__PURE__*/React.createElement("p", {
    className: "home-editorial-lead"
  }, "Entendemos la esmeralda y el oro de 18 quilates como portadores de la memoria humana. Nos convertimos en c\xF3mplices silenciosos de los instantes que definen una vida: promesas que trascienden el tiempo, hitos de amor incondicional y el recuerdo indeleble de quienes somos."), /*#__PURE__*/React.createElement("blockquote", {
    className: "home-editorial-quote"
  }, "\"Nuestras esmeraldas colombianas de Muzo y Chivor no son meras pertenencias; son fragmentos de tierra viva custodiados por almas sensibles para ser entregados a la siguiente generaci\xF3n.\""), /*#__PURE__*/React.createElement("div", {
    className: "home-editorial-stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-editorial-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "display home-editorial-stat-num"
  }, /*#__PURE__*/React.createElement(CountUp, {
    to: 12,
    suffix: "+"
  })), /*#__PURE__*/React.createElement("div", {
    className: "eyebrow home-editorial-stat-lab"
  }, "A\xF1os")), /*#__PURE__*/React.createElement("div", {
    className: "home-editorial-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "display home-editorial-stat-num"
  }, /*#__PURE__*/React.createElement(CountUp, {
    to: 800,
    suffix: "+"
  })), /*#__PURE__*/React.createElement("div", {
    className: "eyebrow home-editorial-stat-lab"
  }, "Piezas \xFAnicas")), /*#__PURE__*/React.createElement("div", {
    className: "home-editorial-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "display home-editorial-stat-num"
  }, "JA"), /*#__PURE__*/React.createElement("div", {
    className: "eyebrow home-editorial-stat-lab"
  }, "Certificado"))))))), /*#__PURE__*/React.createElement("section", {
    className: "home-services"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-services-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "El valor de lo excepcional"), /*#__PURE__*/React.createElement("h2", {
    className: "home-services-title"
  }, "Una experiencia a la altura", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "de tu propia historia"))), /*#__PURE__*/React.createElement("div", {
    className: "home-services-grid"
  }, HOME_SERVICES.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.t,
    className: "glass home-service-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-service-icon"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    "aria-hidden": "true"
  }, s.icon)), /*#__PURE__*/React.createElement("div", {
    className: "home-service-name"
  }, s.t), /*#__PURE__*/React.createElement("p", {
    className: "home-service-desc"
  }, s.d)))))), /*#__PURE__*/React.createElement("section", {
    className: "home-atelier"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-atelier-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip-dot"
  }), "Atelier Bersaglio"), /*#__PURE__*/React.createElement("h2", {
    className: "home-atelier-title"
  }, "El viaje de creaci\xF3n de ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "una pieza de culto")), /*#__PURE__*/React.createElement("p", {
    className: "home-atelier-lead"
  }, "Un recorrido artesanal meticuloso que transforma una visi\xF3n en un objeto eterno.")), /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent at-stage"
  }, /*#__PURE__*/React.createElement("svg", {
    className: "at-flow",
    viewBox: "0 0 1000 560",
    preserveAspectRatio: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "at-flow-g",
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "oklch(80% 0.13 85)",
    stopOpacity: "0.05"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "oklch(68% 0.15 155)",
    stopOpacity: "0.65"
  }))), /*#__PURE__*/React.createElement("g", {
    fill: "none",
    stroke: "url(#at-flow-g)",
    strokeWidth: "1.5",
    strokeDasharray: "2 9",
    strokeLinecap: "round",
    vectorEffect: "non-scaling-stroke"
  }, /*#__PURE__*/React.createElement("path", {
    className: "at-flow-1",
    d: "M180 150 Q 370 268 470 278"
  }), /*#__PURE__*/React.createElement("path", {
    className: "at-flow-2",
    d: "M820 150 Q 630 268 530 278"
  }), /*#__PURE__*/React.createElement("path", {
    className: "at-flow-3",
    d: "M180 410 Q 370 292 470 282"
  }), /*#__PURE__*/React.createElement("path", {
    className: "at-flow-4",
    d: "M820 410 Q 630 292 530 282"
  }))), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    className: "at-halo"
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    className: "at-ring"
  }), /*#__PURE__*/React.createElement("div", {
    className: "at-jewel"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/gema.png",
    alt: "Esmeralda Bersaglio engastada en oro",
    className: "at-jewel-img",
    loading: "lazy",
    decoding: "async"
  })), HOME_ATELIER_STEPS.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.n,
    className: 'at-card at-card--corner-' + s.corner
  }, /*#__PURE__*/React.createElement("div", {
    className: "at-card-title"
  }, /*#__PURE__*/React.createElement("span", {
    className: "at-card-dot",
    "aria-hidden": "true"
  }), s.t), /*#__PURE__*/React.createElement("p", {
    className: "at-card-desc"
  }, s.d))), /*#__PURE__*/React.createElement("div", {
    className: "at-cta"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => navigate('contacto')
  }, "Iniciar mi pieza", /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  }))))))), /*#__PURE__*/React.createElement("section", {
    className: "home-journal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hj-masthead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hj-masthead-brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono hj-est"
  }, "EST. 2014"), /*#__PURE__*/React.createElement("div", {
    className: "hj-est-divider"
  }), /*#__PURE__*/React.createElement("h2", {
    className: "hj-masthead-title"
  }, "The ", /*#__PURE__*/React.createElement("span", {
    className: "italic"
  }, "Bersaglio"), " Journal")), /*#__PURE__*/React.createElement("div", {
    className: "hj-masthead-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono hj-issue"
  }, JOURNAL_ISSUE.number, " \xB7 ", cover.dateLong), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua hj-archive-btn",
    onClick: () => navigate('journal')
  }, "Archivo completo", /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "hj-masthead-line"
  }), /*#__PURE__*/React.createElement("div", {
    className: "glass hj-ticker"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono hj-ticker-tag"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hj-ticker-pulse"
  }), "EN VIVO"), /*#__PURE__*/React.createElement("div", {
    className: "hj-ticker-clip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hj-ticker-track"
  }, tickerDoubled.map((t, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "hj-ticker-item"
  }, t, /*#__PURE__*/React.createElement("span", {
    className: "hj-ticker-diamond"
  }, "\u25C6")))))), /*#__PURE__*/React.createElement("div", {
    className: "journal-fold hj-fold"
  }, /*#__PURE__*/React.createElement("article", {
    className: "hj-cover"
  }, /*#__PURE__*/React.createElement("a", {
    className: "hj-cover-link",
    onClick: () => openEntrada ? openEntrada(cover.slug) : navigate('journal')
  }, /*#__PURE__*/React.createElement("div", {
    className: "hj-cover-imgwrap"
  }, /*#__PURE__*/React.createElement("img", {
    src: cover.img,
    alt: cover.title,
    className: "hj-cover-img",
    loading: "lazy",
    decoding: "async"
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    className: "hj-cover-vignette"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hj-cover-flag-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono hj-cover-flag"
  }, cover.section.toUpperCase()), /*#__PURE__*/React.createElement("span", {
    className: "mono hj-cover-read"
  }, cover.read, " de lectura")), /*#__PURE__*/React.createElement("div", {
    className: "hj-cover-caption"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono hj-cover-kicker"
  }, cover.kicker))), /*#__PURE__*/React.createElement("h3", {
    className: "hj-cover-title"
  }, cover.title), /*#__PURE__*/React.createElement("p", {
    className: "hj-cover-excerpt cover-excerpt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hj-cover-dropcap"
  }, cover.excerpt.charAt(0)), cover.excerpt.slice(1)), /*#__PURE__*/React.createElement("div", {
    className: "hj-cover-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hj-cover-author-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hj-cover-avatar"
  }, "MB"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hj-cover-author"
  }, cover.author), /*#__PURE__*/React.createElement("div", {
    className: "mono hj-cover-date"
  }, (cover.dateLong || '').toUpperCase()))), /*#__PURE__*/React.createElement("div", {
    className: "hj-cover-continue"
  }, "Continuar leyendo", /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))))), /*#__PURE__*/React.createElement("aside", {
    className: "hj-side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hj-side-header"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "hj-side-title"
  }, "M\xE1s le\xEDdos"), /*#__PURE__*/React.createElement("div", {
    className: "mono hj-side-week"
  }, "ESTA SEMANA")), journalSide.map((s, i) => /*#__PURE__*/React.createElement("article", {
    key: s.slug,
    className: "hj-side-row"
  }, /*#__PURE__*/React.createElement("a", {
    className: "hj-side-link",
    onClick: () => openEntrada ? openEntrada(s.slug) : navigate('journal')
  }, /*#__PURE__*/React.createElement("div", {
    className: "hj-side-num"
  }, "0", i + 1), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mono hj-side-meta"
  }, /*#__PURE__*/React.createElement("span", null, s.sec), /*#__PURE__*/React.createElement("span", {
    className: "hj-side-meta-dot"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    className: "hj-side-meta-date"
  }, s.date)), /*#__PURE__*/React.createElement("h5", {
    className: "hj-side-headline"
  }, s.title), /*#__PURE__*/React.createElement("div", {
    className: "mono hj-side-read"
  }, s.read, " de lectura"))))), /*#__PURE__*/React.createElement("div", {
    className: "glass glass-emerald hj-newsletter"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono hj-newsletter-tag"
  }, "NEWSLETTER"), /*#__PURE__*/React.createElement("div", {
    className: "hj-newsletter-title"
  }, "Una nota cada", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "italic hj-newsletter-italic"
  }, "luna llena")), /*#__PURE__*/React.createElement("form", {
    className: "hj-newsletter-form",
    onSubmit: e => e.preventDefault()
  }, /*#__PURE__*/React.createElement("input", {
    type: "email",
    name: "email",
    placeholder: "tu@correo.com",
    className: "hj-newsletter-input",
    autoComplete: "email",
    required: true
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "hj-newsletter-btn"
  }, "Suscribir"))))), journalTrio.length >= 3 && /*#__PURE__*/React.createElement("div", {
    className: "journal-trio hj-trio"
  }, journalTrio.map(t => /*#__PURE__*/React.createElement("article", {
    key: t.slug,
    className: "hj-trio-item"
  }, /*#__PURE__*/React.createElement("a", {
    className: "hj-trio-link",
    onClick: () => openEntrada ? openEntrada(t.slug) : navigate('journal')
  }, /*#__PURE__*/React.createElement("div", {
    className: "hj-trio-imgwrap"
  }, /*#__PURE__*/React.createElement("img", {
    src: t.img,
    alt: t.title,
    className: "hj-trio-img",
    loading: "lazy",
    decoding: "async"
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    className: "hj-trio-vignette"
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono hj-trio-flag"
  }, t.sec)), /*#__PURE__*/React.createElement("h4", {
    className: "hj-trio-title"
  }, t.title), /*#__PURE__*/React.createElement("div", {
    className: "mono hj-trio-who"
  }, t.who))))))), /*#__PURE__*/React.createElement(FilmsSection, null), /*#__PURE__*/React.createElement(SocialSection, null), /*#__PURE__*/React.createElement("section", {
    className: "home-cta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent home-cta-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-cta-glow",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "home-cta-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Visita nuestro Atelier privado"), /*#__PURE__*/React.createElement("h2", {
    className: "home-cta-title"
  }, "Nuestra Maison", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "Cartagena de Indias")), /*#__PURE__*/React.createElement("p", {
    className: "home-cta-lead"
  }, "Te invitamos a cruzar el umbral de nuestro atelier en el coraz\xF3n del Centro Hist\xF3rico. A puerta cerrada y con la calma de un buen caf\xE9, conversaremos sin prisa sobre la pieza que habitar\xE1 en tu linaje familiar."), /*#__PURE__*/React.createElement("p", {
    className: "mono home-cta-addr"
  }, "Calle 36 # 6-32 \xB7 San Agust\xEDn Chiquita", /*#__PURE__*/React.createElement("br", null), "Centro Hist\xF3rico \xB7 Bol\xEDvar, Colombia"), /*#__PURE__*/React.createElement("div", {
    className: "home-cta-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => navigate('contacto')
  }, "Agendar cita privada"), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua",
    onClick: () => navigate('catalogo')
  }, "Explorar colecciones")))))));
}

// ════════════════════════════════════════════════════════════════════
// PRODUCT CARD (shared)
// ════════════════════════════════════════════════════════════════════
function ProductCard({
  p,
  onOpen,
  wished,
  toggleWish,
  idx = 0,
  openQuickView
}) {
  const [ref, cls, st] = useReveal(idx % 4 * 80);
  return /*#__PURE__*/React.createElement("a", {
    ref: ref,
    className: 'glass glass-iridescent k-card ' + cls,
    style: st,
    onClick: () => onOpen(p.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-card-img"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundImage: `url(${p.img})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "k-card-vig"
  }), p.tag && /*#__PURE__*/React.createElement("div", {
    className: "k-card-tag"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip-dot"
  }), p.tag)), openQuickView && /*#__PURE__*/React.createElement("button", {
    className: "k-card-qv",
    title: "Vista r\xE1pida",
    onClick: e => {
      e.stopPropagation();
      openQuickView(p.id);
    }
  }, /*#__PURE__*/React.createElement(IconEye, {
    size: 15,
    sw: 1.7
  })), /*#__PURE__*/React.createElement("button", {
    className: 'k-card-wish' + (wished ? ' on' : ''),
    onClick: e => {
      e.stopPropagation();
      toggleWish(p.id);
    }
  }, /*#__PURE__*/React.createElement(IconHeart, {
    size: 14,
    sw: 1.8,
    fill: wished ? 'currentColor' : 'none'
  }))), /*#__PURE__*/React.createElement("div", {
    className: "k-card-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-card-cat"
  }, p.cat), /*#__PURE__*/React.createElement("div", {
    className: "k-card-name"
  }, p.name), /*#__PURE__*/React.createElement("div", {
    className: "k-card-meta"
  }, [p.stones, p.gold].filter(Boolean).join(' · ')), /*#__PURE__*/React.createElement("div", {
    className: "k-card-foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k-card-price"
  }, fmt$(p.price)), /*#__PURE__*/React.createElement("span", {
    className: "k-card-arrow"
  }, "Ver pieza ", /*#__PURE__*/React.createElement(IconArrow, {
    size: 10
  })))));
}

// ════════════════════════════════════════════════════════════════════
// CATALOG — mirror of js/pages/catalogo.js (cat-page · cat-pills · cat-grid)
// ════════════════════════════════════════════════════════════════════
const CATALOG_SORTS = [{
  key: 'destacados',
  label: 'Destacados'
}, {
  key: 'menor',
  label: 'Precio · menor'
}, {
  key: 'mayor',
  label: 'Precio · mayor'
}, {
  key: 'nombre',
  label: 'Nombre A-Z'
}];
function CatalogScreen({
  openPieza
}) {
  const [cat, setCat] = React.useState('all');
  const [sort, setSort] = React.useState('destacados');
  const collections = [{
    slug: 'all',
    name: 'Todo'
  }, ...COLLECTIONS];
  const activeCol = cat !== 'all' ? COLLECTIONS.find(c => c.slug === cat) : null;
  const title = activeCol ? /*#__PURE__*/React.createElement(React.Fragment, null, activeCol.name, " ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "en cristal")) : /*#__PURE__*/React.createElement(React.Fragment, null, "Todas las ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "piezas"));
  const lead = activeCol?.description || 'Explora nuestra colección completa. Cada pieza es única, con certificación de origen y oro de ley 750.';
  let list = cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.collection === cat);
  if (sort === 'menor') list = [...list].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));else if (sort === 'mayor') list = [...list].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));else if (sort === 'nombre') list = [...list].sort((a, b) => String(a.name).localeCompare(String(b.name)));else list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  return /*#__PURE__*/React.createElement("div", {
    className: "container cat-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cat-page-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow cat-page-eyebrow"
  }, "Cat\xE1logo \xB7 2026"), /*#__PURE__*/React.createElement("h1", {
    className: "cat-page-title"
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "cat-page-lead"
  }, lead)), /*#__PURE__*/React.createElement("div", {
    className: "cat-controls"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass cat-pills",
    role: "tablist",
    "aria-label": "Filtrar por colecci\xF3n"
  }, collections.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.slug,
    type: "button",
    className: 'cat-pill' + (cat === c.slug ? ' is-active' : ''),
    role: "tab",
    "aria-selected": cat === c.slug,
    onClick: () => setCat(c.slug)
  }, c.name))), /*#__PURE__*/React.createElement("div", {
    className: "glass cat-sort"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cat-sort-label"
  }, "Orden"), /*#__PURE__*/React.createElement("select", {
    className: "cat-sort-select",
    "aria-label": "Ordenar resultados",
    value: sort,
    onChange: e => setSort(e.target.value)
  }, CATALOG_SORTS.map(s => /*#__PURE__*/React.createElement("option", {
    key: s.key,
    value: s.key
  }, s.label))))), /*#__PURE__*/React.createElement("div", {
    className: "cat-grid"
  }, list.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "cat-empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cat-empty-icon",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.2"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "20",
    y1: "20",
    x2: "16.5",
    y2: "16.5"
  }))), /*#__PURE__*/React.createElement("p", {
    className: "cat-empty-title"
  }, "No hay piezas en esta colecci\xF3n \u2014 todav\xEDa."), /*#__PURE__*/React.createElement("p", {
    className: "cat-empty-sub"
  }, "Estamos curando el pr\xF3ximo lote. Mientras tanto, explora otras categor\xEDas."), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => setCat('all')
  }, "Ver todo el cat\xE1logo")) : list.map(p => /*#__PURE__*/React.createElement(CatCard, {
    key: p.id,
    p: p,
    onOpen: openPieza
  }))));
}
function CatCard({
  p,
  onOpen
}) {
  const img = p.images?.[0] || p.image || '';
  const tag = p.tag || (p.featured ? 'Destacada' : null);
  const stones = p.specs?.stones || p.specs?.stone || '';
  const col = COLLECTIONS.find(c => c.slug === p.collection);
  const catLabel = col?.name || p.collection;
  const price = Number(p.price || 0);
  return /*#__PURE__*/React.createElement("a", {
    className: "glass glass-iridescent cat-card",
    onClick: () => onOpen(p.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "cat-card-imgwrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cat-card-img",
    style: {
      background: `url('${img}') center/cover`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "cat-card-vignette",
    "aria-hidden": "true"
  }), tag && /*#__PURE__*/React.createElement("div", {
    className: "cat-card-tag"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip-dot"
  }), tag))), /*#__PURE__*/React.createElement("div", {
    className: "cat-card-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cat-card-cat"
  }, catLabel), /*#__PURE__*/React.createElement("div", {
    className: "cat-card-name"
  }, p.name || 'Pieza'), /*#__PURE__*/React.createElement("div", {
    className: "cat-card-meta"
  }, stones), /*#__PURE__*/React.createElement("div", {
    className: "cat-card-foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono cat-card-price"
  }, price ? fmt$(price) : '— Editorial —'), /*#__PURE__*/React.createElement("div", {
    className: "cat-card-arrow"
  }, "Ver", /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  }))))));
}

// ════════════════════════════════════════════════════════════════════
// PIEZA — mirror of js/pages/pieza.js (breadcrumb · gallery · info · related)
// ════════════════════════════════════════════════════════════════════
const PZ_TALLAS_COLLECTIONS = new Set(['anillos', 'argollas']);
function PiezaScreen({
  product,
  navigate,
  addToCart,
  wishlist,
  toggleWish,
  openPieza
}) {
  const [viewIdx, setViewIdx] = React.useState(0);
  const [size, setSize] = React.useState(null);
  React.useEffect(() => {
    setViewIdx(0);
    setSize(null);
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, [product && product.id]);
  if (!product) {
    return /*#__PURE__*/React.createElement("div", {
      className: "container pz-page"
    }, /*#__PURE__*/React.createElement("div", {
      className: "glass pz-notfound"
    }, /*#__PURE__*/React.createElement("div", {
      className: "pz-notfound-icon",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "56",
      height: "56",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.2"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "8",
      x2: "12",
      y2: "13"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "16",
      x2: "12.01",
      y2: "16"
    }))), /*#__PURE__*/React.createElement("h1", {
      className: "pz-notfound-title"
    }, "Esta pieza descansa en otro lugar"), /*#__PURE__*/React.createElement("p", {
      className: "pz-notfound-sub"
    }, "La pieza solicitada no se encuentra disponible actualmente en nuestro atelier."), /*#__PURE__*/React.createElement("div", {
      className: "pz-notfound-actions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn-aqua btn-aqua-emerald",
      onClick: () => navigate('catalogo')
    }, "Ver el cat\xE1logo"), /*#__PURE__*/React.createElement("button", {
      className: "btn-aqua",
      onClick: () => navigate('contacto')
    }, "Hablar con un asesor"))));
  }
  const collection = COLLECTIONS.find(c => c.slug === product.collection);
  const catLabel = collection?.name || product.collection || 'Pieza';
  const images = (product.images || []).filter(Boolean);
  if (images.length === 0 && product.image) images.push(product.image);
  const main = images[Math.min(viewIdx, images.length - 1)];
  const price = Number(product.price || 0);
  const inWishlist = wishlist.includes(product.id);
  const showTalla = PZ_TALLAS_COLLECTIONS.has(product.collection);
  const showCert = product.specs?.certificate || product.specs?.gia || (product.stones || '').includes('Diamante');
  const stones = product.specs?.stones || product.specs?.stone || '';
  const primaryGem = stones.includes('·') ? stones.split('·')[0].trim() : stones || 'Esmeralda';
  const specs = [{
    key: 'Gema principal',
    val: primaryGem
  }, {
    key: 'Metal',
    val: product.specs?.metal || product.specs?.gold || 'Oro 18K'
  }, {
    key: 'Origen',
    val: product.specs?.origin || 'Muzo, Colombia'
  }, {
    key: 'Entrega',
    val: product.specs?.delivery || '2-3 semanas'
  }];
  const description = product.description || product.desc || `Una pieza de alta joyería esculpida a mano en oro de 18 quilates, concebida alrededor del fuego interior de una ${(stones || 'esmeralda colombiana').toLowerCase()}. Acabado pulido y perfeccionado pacientemente por los maestros orfebres de nuestro atelier en Cartagena de Indias.`;
  const slug = product.slug || product.id;
  const related = PRODUCTS.filter(p => p.id !== product.id && p.collection === product.collection).slice(0, 4);
  while (related.length < 4) {
    const filler = PRODUCTS.find(p => p.id !== product.id && !related.includes(p));
    if (!filler) break;
    related.push(filler);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "container pz-page"
  }, /*#__PURE__*/React.createElement("nav", {
    className: "pz-breadcrumb",
    "aria-label": "Migas de pan"
  }, /*#__PURE__*/React.createElement("a", {
    className: "pz-crumb",
    onClick: () => navigate('home')
  }, "Inicio"), /*#__PURE__*/React.createElement("span", {
    className: "pz-crumb-sep",
    "aria-hidden": "true"
  }, "\u2192"), /*#__PURE__*/React.createElement("a", {
    className: "pz-crumb",
    onClick: () => navigate('catalogo')
  }, catLabel), /*#__PURE__*/React.createElement("span", {
    className: "pz-crumb-sep",
    "aria-hidden": "true"
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    className: "pz-crumb pz-crumb-current"
  }, product.name)), /*#__PURE__*/React.createElement("article", {
    className: "pz-layout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pz-gallery"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent pz-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pz-main-img",
    style: {
      background: `url('${main}') center/cover`
    }
  }), showCert && /*#__PURE__*/React.createElement("div", {
    className: "pz-main-chips"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chip pz-cert-chip"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "12,2 22,8.5 12,22 2,8.5"
  })), "GIA Certificado"))), images.length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "pz-thumbs"
  }, images.slice(0, 6).map((src, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    type: "button",
    className: 'glass pz-thumb' + (i === viewIdx ? ' is-active' : ''),
    onClick: () => setViewIdx(i),
    "aria-label": `Ver imagen ${i + 1}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "pz-thumb-img",
    style: {
      background: `url('${src}') center/cover`
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "pz-info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow pz-info-eyebrow"
  }, catLabel, " \xB7 Bersaglio 2026"), /*#__PURE__*/React.createElement("h1", {
    className: "pz-info-name"
  }, product.name), /*#__PURE__*/React.createElement("div", {
    className: "pz-price-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono pz-price"
  }, price ? fmt$(price) : 'Bajo consulta'), price ? /*#__PURE__*/React.createElement("div", {
    className: "pz-iva"
  }, "IVA incluido") : null), /*#__PURE__*/React.createElement("p", {
    className: "pz-info-desc"
  }, description), /*#__PURE__*/React.createElement("div", {
    className: "pz-specs"
  }, specs.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.key,
    className: "glass pz-spec"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pz-spec-key"
  }, s.key), /*#__PURE__*/React.createElement("div", {
    className: "pz-spec-val"
  }, s.val)))), showTalla && /*#__PURE__*/React.createElement("div", {
    className: "pz-talla"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow pz-talla-label"
  }, "Talla"), /*#__PURE__*/React.createElement("div", {
    className: "pz-talla-pills"
  }, [5, 6, 7, 8, 9].map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    type: "button",
    className: 'glass pz-talla-pill' + (size === s ? ' is-active' : ''),
    onClick: () => setSize(size === s ? null : s)
  }, s)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: 'glass pz-talla-pill pz-talla-custom' + (size === 'custom' ? ' is-active' : ''),
    onClick: () => setSize(size === 'custom' ? null : 'custom')
  }, "A medida"))), /*#__PURE__*/React.createElement("div", {
    className: "pz-actions"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-aqua btn-aqua-emerald pz-cart-btn",
    onClick: () => addToCart(product)
  }, "Agregar al carrito"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: 'btn-aqua pz-wish-btn' + (inWishlist ? ' is-saved' : ''),
    "aria-pressed": inWishlist,
    "aria-label": inWishlist ? 'Quitar de favoritos' : 'Guardar en favoritos',
    onClick: () => toggleWish(product.id)
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: inWishlist ? 'currentColor' : 'none',
    stroke: "currentColor",
    strokeWidth: "1.6",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
  })))), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-gold pz-asesor-btn",
    onClick: () => navigate('contacto')
  }, "Consultar con un asesor"))), related.length > 0 && /*#__PURE__*/React.createElement("section", {
    className: "pz-related"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pz-related-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Tambi\xE9n podr\xEDa gustarte"), /*#__PURE__*/React.createElement("h2", {
    className: "pz-related-title"
  }, "M\xE1s de ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, catLabel))), /*#__PURE__*/React.createElement("div", {
    className: "pz-related-grid"
  }, related.map(p => /*#__PURE__*/React.createElement("a", {
    key: p.id,
    className: "glass glass-iridescent pz-related-card",
    onClick: () => openPieza(p.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "pz-related-imgwrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pz-related-img",
    style: {
      background: `url('${p.images?.[0] || p.img}') center/cover`
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "pz-related-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pz-related-name"
  }, p.name), /*#__PURE__*/React.createElement("div", {
    className: "mono pz-related-price"
  }, fmt$(p.price))))))));
}
Object.assign(window, {
  HomeScreen,
  CatalogScreen,
  PiezaScreen,
  ProductCard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/Screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/Sections.jsx
try { (() => {
/* global React, ATELIER, JOURNAL, JOURNAL_TICKER, useReveal, IconArrow */
// Bersaglio storefront — Fase 2 sections: Atelier, The Journal, Share moment.

const IconWhatsapp = ({
  size = 15
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M20.5 3.5A11 11 0 0 0 3.4 17l-1.4 5.1 5.2-1.4A11 11 0 1 0 20.5 3.5z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M8 10.5c.3 2 2 3.7 4 4.2 1 .3 1.9.1 2.5-.5.2-.2.3-.6.2-.9l-.3-.9c-.1-.3-.4-.4-.7-.4l-1 .2c-.2 0-.4 0-.6-.2-.5-.4-1-.9-1.3-1.5-.1-.2-.1-.4 0-.5l.4-.6c.2-.2.2-.5.1-.7l-.5-1c-.1-.3-.4-.4-.7-.4l-.9.2c-.4.1-.6.4-.6.8 0 .5 0 1 .2 1.4z"
}));
const IconLink = ({
  size = 15
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"
}));
const IconInstagram = ({
  size = 15
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("rect", {
  x: "3",
  y: "3",
  width: "18",
  height: "18",
  rx: "5"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "4"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "17.5",
  cy: "6.5",
  r: "1",
  fill: "currentColor",
  stroke: "none"
}));
const initials = name => name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('');

// ════════════════════════════════════════════════════════════════════
// ATELIER — process scene with central jewel
// ════════════════════════════════════════════════════════════════════
function AtelierSection({
  navigate
}) {
  const [ref, cls, st] = useReveal(0);
  return /*#__PURE__*/React.createElement("section", {
    className: "k-section",
    style: {
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip-dot",
    style: {
      background: 'var(--bj-gold-500)'
    }
  }), "Atelier Bersaglio"), /*#__PURE__*/React.createElement("h2", null, "El viaje de creaci\xF3n de ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "una pieza de culto")), /*#__PURE__*/React.createElement("p", null, "Un recorrido artesanal meticuloso que transforma una visi\xF3n en un objeto eterno.")), /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: 'glass glass-iridescent k-at-stage ' + cls,
    style: st
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-at-halo",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "k-at-ring",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "k-at-jewel"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/ring-sapphire.webp",
    alt: "Pieza Bersaglio en proceso de orfebrer\xEDa",
    loading: "lazy"
  })), ATELIER.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: s.n,
    className: 'k-at-card c' + i
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-at-num"
  }, s.n), /*#__PURE__*/React.createElement("div", {
    className: "k-at-card-t"
  }, s.t), /*#__PURE__*/React.createElement("p", {
    className: "k-at-card-d"
  }, s.d))), /*#__PURE__*/React.createElement("div", {
    className: "k-at-cta"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald",
    onClick: () => navigate('contacto')
  }, "Iniciar mi pieza ", /*#__PURE__*/React.createElement(IconArrow, {
    size: 13
  }))))));
}

// ════════════════════════════════════════════════════════════════════
// THE BERSAGLIO JOURNAL — NYT-style masthead
// ════════════════════════════════════════════════════════════════════
function JournalSection({
  navigate
}) {
  const [ref, cls, st] = useReveal(0);
  const cover = JOURNAL.find(e => e.featured) || JOURNAL[0];
  const rest = JOURNAL.filter(e => e !== cover).slice(0, 4);
  const ticker = [...JOURNAL_TICKER, ...JOURNAL_TICKER];
  const open = () => navigate('nosotros');
  return /*#__PURE__*/React.createElement("section", {
    className: "k-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-masthead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-est"
  }, "EST. 2014"), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-divider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-title"
  }, "The ", /*#__PURE__*/React.createElement("span", {
    className: "italic"
  }, "Bersaglio"), " Journal")), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-issue"
  }, "Issue N\xBA 14 \xB7 Marzo 2026"), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua",
    style: {
      padding: '10px 16px',
      fontSize: 12
    },
    onClick: open
  }, "Archivo completo ", /*#__PURE__*/React.createElement(IconArrow, {
    size: 12
  })))), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-rule"
  }), /*#__PURE__*/React.createElement("div", {
    className: "glass k-jr-ticker"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k-jr-ticker-tag"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k-jr-pulse"
  }), "EN VIVO"), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-ticker-clip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-ticker-track"
  }, ticker.map((t, i) => /*#__PURE__*/React.createElement("span", {
    className: "k-jr-ticker-item",
    key: i
  }, t))))), /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: 'k-jr-fold ' + cls,
    style: st
  }, /*#__PURE__*/React.createElement("a", {
    className: "k-jr-cover",
    onClick: open
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-cover-img"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundImage: `url(${cover.img})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-cover-vig"
  }), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-cover-flag"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k-jr-flag"
  }, cover.section), /*#__PURE__*/React.createElement("span", {
    className: "k-jr-flag"
  }, cover.read, " de lectura"))), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-kicker"
  }, cover.kicker), /*#__PURE__*/React.createElement("h3", {
    className: "k-jr-cover-title"
  }, cover.title), /*#__PURE__*/React.createElement("p", {
    className: "k-jr-cover-excerpt"
  }, cover.excerpt), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-cover-meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-avatar"
  }, initials(cover.author)), /*#__PURE__*/React.createElement("span", null, "Por ", cover.author, " \xB7 ", cover.date))), /*#__PURE__*/React.createElement("aside", {
    className: "k-jr-side"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-side-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-side-title"
  }, "M\xE1s le\xEDdos"), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-side-week"
  }, "ESTA SEMANA")), rest.map((e, i) => /*#__PURE__*/React.createElement("a", {
    className: "k-jr-row",
    key: e.slug,
    onClick: open
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-row-num"
  }, "0", i + 1), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "k-jr-row-sec"
  }, e.section, " \xB7 ", e.date), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-row-title"
  }, e.title), /*#__PURE__*/React.createElement("div", {
    className: "k-jr-row-read"
  }, e.read, " de lectura"))))))));
}

// ════════════════════════════════════════════════════════════════════
// SHARE moment
// ════════════════════════════════════════════════════════════════════
function ShareSection({
  showToast
}) {
  const [ref, cls, st] = useReveal(0);
  const share = kind => {
    if (kind === 'link' && navigator.clipboard) {
      navigator.clipboard.writeText('https://bersagliojewelry.co/pieza/collar-la-verde').catch(() => {});
      showToast('Enlace copiado al portapapeles');
    } else if (kind === 'wa') {
      showToast('Abriendo WhatsApp…');
    } else {
      showToast('Compartiendo en Instagram…');
    }
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "k-section",
    style: {
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-container"
  }, /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: 'glass glass-iridescent k-share ' + cls,
    style: st
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-share-visual"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundImage: 'url(../../assets/model-emerald.webp)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "k-share-visual-shade"
  })), /*#__PURE__*/React.createElement("div", {
    className: "k-share-body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Comparte el deseo"), /*#__PURE__*/React.createElement("h2", null, "Una pieza que ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "merece ser contada")), /*#__PURE__*/React.createElement("p", {
    className: "k-share-lead"
  }, "\xBFEncontraste la joya que habla por ti? Comp\xE1rtela con quien debe verla \u2014 o gu\xE1rdala para esa conversaci\xF3n pendiente frente a un caf\xE9 en Cartagena."), /*#__PURE__*/React.createElement("div", {
    className: "k-share-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "k-share-btn wa",
    onClick: () => share('wa')
  }, /*#__PURE__*/React.createElement(IconWhatsapp, null), " WhatsApp"), /*#__PURE__*/React.createElement("button", {
    className: "k-share-btn",
    onClick: () => share('link')
  }, /*#__PURE__*/React.createElement(IconLink, null), " Copiar enlace"), /*#__PURE__*/React.createElement("button", {
    className: "k-share-btn",
    onClick: () => share('ig')
  }, /*#__PURE__*/React.createElement(IconInstagram, null), " Instagram"))))));
}

// ════════════════════════════════════════════════════════════════════
// BERSAGLIO FILMS — multimedia / video gallery + lightbox
// ════════════════════════════════════════════════════════════════════
function PlatformIcon({
  name,
  size = 15
}) {
  if (name === 'Instagram') return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.4-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z"
  }));
  if (name === 'Facebook') return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M24 12a12 12 0 1 0-13.88 11.86v-8.39H7.08V12h3.04V9.36c0-3 1.79-4.66 4.53-4.66 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.39A12 12 0 0 0 24 12z"
  }));
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"
  }));
}
function FilmsSection() {
  const [filter, setFilter] = React.useState('Todos');
  const [active, setActive] = React.useState(null);
  const featured = VIDEOS.find(v => v.featured) || VIDEOS[0];
  const list = (filter === 'Todos' ? VIDEOS : VIDEOS.filter(v => v.cat === filter)).filter(v => v !== featured);
  const playIcon = s => /*#__PURE__*/React.createElement("svg", {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 5v14l11-7z"
  }));
  return /*#__PURE__*/React.createElement("section", {
    className: "home-films"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "films-header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Bersaglio Films"), /*#__PURE__*/React.createElement("h2", {
    className: "films-title"
  }, "Mira el ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "oficio"), " en movimiento")), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua",
    onClick: () => setActive(featured)
  }, "Ver el \xFAltimo estreno", /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 5l7 7-7 7"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "films-filters"
  }, VIDEO_CATEGORIES.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    className: 'films-pill' + (filter === c ? ' on' : ''),
    onClick: () => setFilter(c)
  }, c))), /*#__PURE__*/React.createElement("div", {
    className: "films-layout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass glass-iridescent film-feature",
    onClick: () => setActive(featured)
  }, /*#__PURE__*/React.createElement("div", {
    className: "film-feature-img",
    style: {
      backgroundImage: `url(${featured.thumb})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "film-feature-shade"
  }), /*#__PURE__*/React.createElement("div", {
    className: "film-play",
    "aria-hidden": "true"
  }, playIcon(26)), /*#__PURE__*/React.createElement("div", {
    className: "film-feature-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "film-feature-chips"
  }, /*#__PURE__*/React.createElement("span", {
    className: "film-flag"
  }, featured.cat), /*#__PURE__*/React.createElement("span", {
    className: "film-flag"
  }, featured.dur)), /*#__PURE__*/React.createElement("h3", {
    className: "film-feature-title"
  }, featured.title), /*#__PURE__*/React.createElement("p", {
    className: "film-feature-desc"
  }, featured.desc))), /*#__PURE__*/React.createElement("div", {
    className: "films-side"
  }, list.slice(0, 4).map(v => /*#__PURE__*/React.createElement("div", {
    key: v.id,
    className: "glass film-card",
    onClick: () => setActive(v)
  }, /*#__PURE__*/React.createElement("div", {
    className: "film-thumb",
    style: {
      backgroundImage: `url(${v.thumb})`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "film-thumb-play"
  }, playIcon(22)), /*#__PURE__*/React.createElement("span", {
    className: "film-dur"
  }, v.dur)), /*#__PURE__*/React.createElement("div", {
    className: "film-card-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "film-card-cat"
  }, v.cat), /*#__PURE__*/React.createElement("div", {
    className: "film-card-title"
  }, v.title, v.badge && /*#__PURE__*/React.createElement("span", {
    className: "film-badge"
  }, v.badge))))), /*#__PURE__*/React.createElement("div", {
    className: "films-upload"
  }, /*#__PURE__*/React.createElement("div", {
    className: "films-upload-icon"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "films-upload-text"
  }, /*#__PURE__*/React.createElement("b", null, "Panel de administraci\xF3n:"), " sube videos a Firebase Storage o pega un enlace de YouTube/Vimeo; aparecen aqu\xED al instante."))))), /*#__PURE__*/React.createElement("div", {
    className: 'film-lightbox' + (active ? ' is-open' : ''),
    onClick: () => setActive(null)
  }, active && /*#__PURE__*/React.createElement("div", {
    className: "film-lightbox-inner",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "film-screen"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundImage: `url(${active.thumb})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "film-screen-shade"
  }), /*#__PURE__*/React.createElement("div", {
    className: "film-play",
    "aria-hidden": "true"
  }, playIcon(28)), /*#__PURE__*/React.createElement("div", {
    className: "film-screen-note"
  }, "\u25B6 Demo \xB7 aqu\xED se reproduce el video real (Firebase Storage / YouTube / Vimeo)")), /*#__PURE__*/React.createElement("div", {
    className: "film-lightbox-bar"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      letterSpacing: '0.12em',
      color: 'oklch(85% 0.1 90)',
      marginBottom: 4
    }
  }, active.cat.toUpperCase(), " \xB7 ", active.dur), /*#__PURE__*/React.createElement("div", {
    className: "film-lightbox-title"
  }, active.title)), /*#__PURE__*/React.createElement("button", {
    className: "film-lightbox-close",
    onClick: () => setActive(null),
    "aria-label": "Cerrar"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "6",
    x2: "18",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "18",
    y1: "6",
    x2: "6",
    y2: "18"
  })))))));
}

// ════════════════════════════════════════════════════════════════════
// SOCIAL FEED — latest from Instagram / Facebook / TikTok
// ════════════════════════════════════════════════════════════════════
function SocialSection() {
  const [tab, setTab] = React.useState('Todas');
  const list = tab === 'Todas' ? SOCIAL : SOCIAL.filter(p => p.platform === tab);
  const statIcon = kind => kind === 'views' ? /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 21s-8-4.5-8-10a4.5 4.5 0 0 1 8-2.9A4.5 4.5 0 0 1 20 11c0 5.5-8 10-8 10z"
  }));
  return /*#__PURE__*/React.createElement("section", {
    className: "home-social"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "social-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "S\xEDguenos de cerca"), /*#__PURE__*/React.createElement("h2", {
    className: "social-title"
  }, "Lo \xFAltimo en ", /*#__PURE__*/React.createElement("span", {
    className: "italic emerald-text"
  }, "nuestras redes")), /*#__PURE__*/React.createElement("p", {
    className: "social-lead"
  }, "Cada pieza tiene vida fuera de la vitrina. Esto es lo m\xE1s reciente que hemos publicado en Instagram, Facebook y TikTok \u2014 actualizado autom\xE1ticamente.")), /*#__PURE__*/React.createElement("div", {
    className: "social-tabs"
  }, SOCIAL_PLATFORMS.map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    className: 'social-tab' + (tab === p ? ' on' : ''),
    onClick: () => setTab(p)
  }, p !== 'Todas' && /*#__PURE__*/React.createElement(PlatformIcon, {
    name: p,
    size: 14
  }), p))), /*#__PURE__*/React.createElement("div", {
    className: "social-grid"
  }, list.slice(0, 8).map((p, i) => /*#__PURE__*/React.createElement("a", {
    key: i,
    className: "social-card",
    target: "_blank",
    rel: "noopener"
  }, /*#__PURE__*/React.createElement("div", {
    className: "social-card-img",
    style: {
      backgroundImage: `url(${p.thumb})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "social-card-grad"
  }), /*#__PURE__*/React.createElement("span", {
    className: 'social-badge social-badge--' + p.platform.toLowerCase()
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    name: p.platform,
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "social-type"
  }, p.type), /*#__PURE__*/React.createElement("div", {
    className: "social-card-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "social-card-caption"
  }, p.caption), /*#__PURE__*/React.createElement("div", {
    className: "social-card-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "social-card-stat"
  }, statIcon(p.kind), p.stat), /*#__PURE__*/React.createElement("span", null, p.date)))))), /*#__PURE__*/React.createElement("div", {
    className: "social-follow"
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn-aqua",
    href: "https://instagram.com/bersagliojewelry",
    target: "_blank",
    rel: "noopener"
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    name: "Instagram",
    size: 15
  }), " @bersagliojewelry"), /*#__PURE__*/React.createElement("a", {
    className: "btn-aqua",
    href: "https://tiktok.com/@bersagliojewelry",
    target: "_blank",
    rel: "noopener"
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    name: "TikTok",
    size: 14
  }), " TikTok"), /*#__PURE__*/React.createElement("a", {
    className: "btn-aqua",
    href: "https://facebook.com/bersagliojewelry",
    target: "_blank",
    rel: "noopener"
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    name: "Facebook",
    size: 15
  }), " Facebook"))));
}
Object.assign(window, {
  AtelierSection,
  JournalSection,
  ShareSection,
  FilmsSection,
  SocialSection
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/Sections.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/Shell.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React, fmt$ */
// Bersaglio storefront shell — logo, icons, header pill, footer, cart drawer.

// ── Inline line-icon set (stroke-only, the house style) ─────────────
const Icon = ({
  d,
  size = 18,
  sw = 1.8,
  fill = 'none',
  children
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: fill,
  stroke: "currentColor",
  strokeWidth: sw,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, d ? /*#__PURE__*/React.createElement("path", {
  d: d
}) : children);
const IconCart = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "9",
  cy: "21",
  r: "1"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "20",
  cy: "21",
  r: "1"
}), /*#__PURE__*/React.createElement("path", {
  d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
}));
const IconSearch = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "11",
  cy: "11",
  r: "7"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 21l-4.3-4.3"
}));
const IconHeart = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
}));
const IconArrow = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  sw: 2,
  d: "M5 12h14M13 5l7 7-7 7"
}));
const IconClose = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  sw: 2
}), /*#__PURE__*/React.createElement("line", {
  x1: "6",
  y1: "6",
  x2: "18",
  y2: "18"
}), /*#__PURE__*/React.createElement("line", {
  x1: "18",
  y1: "6",
  x2: "6",
  y2: "18"
}));
const IconPin = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "10",
  r: "2.5"
}));
const IconShield = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
}));
const IconCheck = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: "M20 6L9 17l-5-5"
}));
const IconPen = p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
  d: "M12 20h9M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
}));
const IconUser = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "7",
  r: "4"
}));
const IconEye = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "3"
}));
const ServiceIcon = ({
  name,
  ...p
}) => ({
  pen: IconPen,
  user: IconUser,
  check: IconCheck,
  shield: IconShield
}[name] || IconCheck)(p);

// ── Brand mark (serif B in circle with construction axis) ───────────
const BersaglioLogo = ({
  size = 28
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size * 1.05,
  viewBox: "0 0 80 84",
  fill: "none",
  style: {
    display: 'block'
  }
}, /*#__PURE__*/React.createElement("circle", {
  cx: "40",
  cy: "42",
  r: "28",
  stroke: "#0f5132",
  strokeWidth: "1.2",
  opacity: "0.85"
}), /*#__PURE__*/React.createElement("line", {
  x1: "40",
  y1: "4",
  x2: "40",
  y2: "80",
  stroke: "#0f5132",
  strokeWidth: "0.8",
  opacity: "0.5"
}), /*#__PURE__*/React.createElement("text", {
  x: "40",
  y: "54",
  textAnchor: "middle",
  fontFamily: "Fraunces, serif",
  fontWeight: "600",
  fontSize: "32",
  fill: "#0f5132"
}, "B"));

// ── Header — floating Dynamic Island pill ───────────────────────────
function Header({
  route,
  navigate,
  cartCount,
  onCart,
  onSearch,
  wishlistCount
}) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const nav = [{
    k: 'home',
    label: 'Inicio'
  }, {
    k: 'catalogo',
    label: 'Colecciones'
  }, {
    k: 'nosotros',
    label: 'Nosotros'
  }, {
    k: 'contacto',
    label: 'Contacto'
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "bj-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: 'bj-header-pill glass glass-iridescent' + (scrolled ? ' is-scrolled' : '')
  }, /*#__PURE__*/React.createElement("button", {
    className: "bj-header-logo",
    onClick: () => navigate('home')
  }, /*#__PURE__*/React.createElement(BersaglioLogo, {
    size: 28
  }), /*#__PURE__*/React.createElement("div", {
    className: "bj-header-logo-text"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-header-brand"
  }, "BERSAGLIO"), /*#__PURE__*/React.createElement("div", {
    className: "bj-header-sub"
  }, "Jewelry"))), /*#__PURE__*/React.createElement("nav", {
    className: "bj-header-nav"
  }, nav.map(n => {
    const active = route === n.k || n.k === 'catalogo' && route === 'pieza';
    return /*#__PURE__*/React.createElement("button", {
      key: n.k,
      className: 'bj-nav-pill' + (active ? ' is-active' : ''),
      onClick: () => navigate(n.k)
    }, n.label);
  })), /*#__PURE__*/React.createElement("button", {
    className: "bj-header-cart",
    onClick: onSearch,
    title: "Buscar (Ctrl K)",
    style: {
      marginRight: 2
    }
  }, /*#__PURE__*/React.createElement(IconSearch, {
    size: 16
  })), /*#__PURE__*/React.createElement("button", {
    className: "bj-header-cart",
    onClick: () => navigate('lista-deseos'),
    title: "Favoritos",
    style: {
      marginRight: 2
    }
  }, /*#__PURE__*/React.createElement(IconHeart, {
    size: 16
  }), wishlistCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "bj-header-badge"
  }, wishlistCount)), /*#__PURE__*/React.createElement("button", {
    className: "bj-header-cart",
    onClick: onCart,
    title: "Carrito"
  }, /*#__PURE__*/React.createElement(IconCart, {
    size: 16
  }), cartCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "bj-header-badge"
  }, cartCount))));
}

// ── Cart drawer ─────────────────────────────────────────────────────
function CartDrawer({
  open,
  items,
  onClose,
  onQty,
  onRemove,
  onCheckout
}) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: 'bj-drawer-backdrop' + (open ? ' is-open' : ''),
    onClick: onClose
  }), /*#__PURE__*/React.createElement("aside", {
    className: 'bj-cart-drawer' + (open ? ' is-open' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Carrito"), /*#__PURE__*/React.createElement("h3", {
    className: "bj-cart-title"
  }, "Tus joyas")), /*#__PURE__*/React.createElement("button", {
    className: "bj-cart-close",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(IconClose, {
    size: 14
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-body"
  }, items.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-empty-icon",
    style: {
      width: 140,
      height: 140,
      background: 'none',
      borderRadius: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/cart-gems.png",
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      filter: 'drop-shadow(0 10px 24px oklch(42% 0.14 155 / 0.3))'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-empty-title"
  }, "A\xFAn sin piezas"), /*#__PURE__*/React.createElement("p", {
    className: "bj-cart-empty-sub"
  }, "Tu colecci\xF3n comienza con una historia. Explora el atelier.")), items.map(i => /*#__PURE__*/React.createElement("div", {
    key: i.id,
    className: "bj-cart-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-row-img",
    style: {
      backgroundImage: `url(${i.img})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-row-body"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-row-name"
  }, i.name), /*#__PURE__*/React.createElement("div", {
    className: "mono bj-cart-row-meta"
  }, fmt$(i.price))), /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-row-controls"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-qty"
  }, /*#__PURE__*/React.createElement("button", {
    className: "bj-cart-qty-btn",
    onClick: () => onQty(i.id, i.qty - 1)
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    className: "mono bj-cart-qty-val"
  }, i.qty), /*#__PURE__*/React.createElement("button", {
    className: "bj-cart-qty-btn",
    onClick: () => onQty(i.id, i.qty + 1)
  }, "+")), /*#__PURE__*/React.createElement("button", {
    className: "bj-cart-row-remove",
    onClick: () => onRemove(i.id)
  }, "Quitar")))))), items.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-cart-subtotal-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Subtotal"), /*#__PURE__*/React.createElement("span", {
    className: "mono bj-cart-subtotal"
  }, fmt$(subtotal))), /*#__PURE__*/React.createElement("button", {
    className: "btn-aqua btn-aqua-emerald bj-cart-checkout-btn",
    onClick: onCheckout
  }, "Ir al checkout ", /*#__PURE__*/React.createElement(IconArrow, {
    size: 14
  })), /*#__PURE__*/React.createElement("p", {
    className: "bj-cart-note"
  }, "Asesor\xEDa personalizada antes de cada compra \xB7 Env\xEDo asegurado mundial"))));
}

// ── Footer ──────────────────────────────────────────────────────────
function Footer({
  navigate
}) {
  const cols = [{
    t: 'Colecciones',
    l: [['Anillos', 'catalogo'], ['Topos & Aretes', 'catalogo'], ['Argollas', 'catalogo'], ['Dijes', 'catalogo']]
  }, {
    t: 'Casa',
    l: [['Nuestra historia', 'nosotros'], ['Diseño a medida', 'contacto'], ['Certificaciones', 'nosotros'], ['The Journal', 'journal']]
  }, {
    t: 'Servicio',
    l: [['Contacto', 'contacto'], ['Asesoría', 'contacto'], ['Envíos', 'terminos'], ['Garantía', 'terminos']]
  }];
  return /*#__PURE__*/React.createElement("footer", {
    className: "bj-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "k-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-footer-grid glass glass-iridescent"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-footer-brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bj-footer-logo-row"
  }, /*#__PURE__*/React.createElement(BersaglioLogo, {
    size: 34
  }), /*#__PURE__*/React.createElement("div", {
    className: "bj-footer-brand-name"
  }, "BERSAGLIO")), /*#__PURE__*/React.createElement("p", {
    className: "bj-footer-tagline"
  }, "Alta joyer\xEDa con esmeraldas colombianas, diamantes certificados y oro 18K. Piezas dise\xF1adas para trascender generaciones.")), cols.map(col => /*#__PURE__*/React.createElement("div", {
    key: col.t
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow bj-footer-col-title"
  }, col.t), /*#__PURE__*/React.createElement("ul", {
    className: "bj-footer-col-list"
  }, col.l.map(([lab, r]) => /*#__PURE__*/React.createElement("li", {
    key: lab
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => navigate(r),
    style: {
      cursor: 'pointer'
    }
  }, lab))))))), /*#__PURE__*/React.createElement("div", {
    className: "bj-footer-meta"
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Bersaglio Jewelry \xB7 Cartagena de Indias, Colombia"), /*#__PURE__*/React.createElement("span", {
    className: "bj-footer-legal"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bj-footer-legal-links"
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => navigate('terminos')
  }, "T\xE9rminos"), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "\xB7"), /*#__PURE__*/React.createElement("a", {
    onClick: () => navigate('privacidad')
  }, "Cookies"), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "\xB7"), /*#__PURE__*/React.createElement("a", {
    onClick: () => navigate('privacidad')
  }, "Privacidad"))))));
}
Object.assign(window, {
  BersaglioLogo,
  Header,
  CartDrawer,
  Footer,
  ServiceIcon,
  IconCart,
  IconSearch,
  IconHeart,
  IconArrow,
  IconClose,
  IconPin,
  IconShield,
  IconCheck,
  IconPen,
  IconUser,
  IconEye
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/data.jsx
try { (() => {
/* global window */
// Bersaglio storefront — data layer. Shape mirrors the production
// Firestore schema (see js/pages/catalogo.js, js/pages/pieza.js).

const ASSET = '../../assets';

// Collections — slug, display name, description (used in catalogo header).
const COLLECTIONS = [{
  slug: 'anillos',
  name: 'Anillos',
  description: 'Solitarios, halos y aros de compromiso esculpidos en oro 18K, con esmeraldas colombianas y diamantes certificados.'
}, {
  slug: 'topos-aretes',
  name: 'Topos & Aretes',
  description: 'La piedra en su gesto más íntimo. Topos solitarios, briolettes y halos para todos los días.'
}, {
  slug: 'argollas',
  name: 'Argollas',
  description: 'Alianzas y argollas en oro 18K — pulido espejo o satinado. La pieza que se hereda.'
}, {
  slug: 'dijes-colgantes',
  name: 'Dijes & Colgantes',
  description: 'Dijes con esmeraldas briolette y gotas de oro sobre cadenas venecianas y rolós.'
}, {
  slug: 'pulseras',
  name: 'Pulseras',
  description: 'Pulseras tenis, riveras y eslabones — todas en oro de 18 quilates.'
}, {
  slug: 'editorial',
  name: 'Editorial',
  description: 'Piezas únicas de campaña. Cada una existe una sola vez en el mundo.'
}];

// Catalog — mirror of Firestore /pieces.
// Required fields (used by catalogo.js + pieza.js): id, slug, name, collection, price,
// images[], tag?, featured?, specs.{stones, metal, ...}, description, story (paragraphs).
const PRODUCTS = [{
  id: 'halo-emerald',
  slug: 'topos-halo-esmeralda',
  name: 'Topos Halo Esmeralda',
  collection: 'topos-aretes',
  price: 12400000,
  images: [`${ASSET}/earrings-emerald.webp`, `${ASSET}/earrings-travertino.webp`, `${ASSET}/model-emerald.webp`],
  tag: 'Best Seller',
  featured: true,
  specs: {
    stones: 'Esmeralda · Diamante',
    stone: 'Esmeralda Muzo',
    metal: 'Oro amarillo 18K',
    origin: 'Muzo, Boyacá',
    guarantee: 'Vitalicia'
  },
  description: 'Un halo de diamantes que orbita una esmeralda colombiana de talla cojín. Engaste a microscopio, 40x de aumento, para que cada uña sostenga el fuego sin tocar la luz.',
  story: ['Cada topo es engastado a mano por Eliécer Patiño en nuestro atelier de Cartagena. La esmeralda central viaja desde la mina de Muzo, en Boyacá, donde es seleccionada por color y "jardín".', 'El halo está construido con 22 diamantes redondos de 1.2mm, clarity VS, color G. Tomamos cuatro horas en engastarlos uno a uno.']
}, {
  id: 'emerald-classic',
  slug: 'topos-esmeralda-classic',
  name: 'Topos Esmeralda Classic',
  collection: 'topos-aretes',
  price: 9800000,
  images: [`${ASSET}/earrings-travertino.webp`, `${ASSET}/earrings-emerald.webp`],
  specs: {
    stones: 'Esmeralda colombiana',
    stone: 'Esmeralda Coscuez',
    metal: 'Oro amarillo 18K',
    cut: 'Cojín',
    guarantee: 'Vitalicia'
  },
  description: 'La esmeralda en su gesto más puro: solitaria, sobre cuatro uñas de oro 18K. La pieza que se hereda sin pedir permiso a ninguna época.',
  story: ['Esmeraldas de Coscuez con verde profundo y "jardín" controlado. Talla cojín ovalada, 5x4mm cada una. Aceitadas con resina natural, certificado GIA opcional.']
}, {
  id: 'trinity-sapphire',
  slug: 'anillo-trinity-zafiro',
  name: 'Anillo Trinity Zafiro',
  collection: 'anillos',
  price: 14800000,
  images: [`${ASSET}/ring-sapphire.webp`, `${ASSET}/model-emerald.webp`, `${ASSET}/earrings-emerald.webp`],
  tag: 'Edición limitada',
  featured: true,
  specs: {
    stones: 'Zafiro · Diamantes',
    stone: 'Zafiro azul',
    metal: 'Oro 18K paladiado',
    edition: '12 piezas',
    size: 'Hecho a medida'
  },
  description: 'Tres aros entrelazados, tres significados que tú eliges. Una reinterpretación del gesto Trinity en oro 18K paladiado, coronada por un zafiro de corte real.',
  story: ['Inspirado en el Trinity de Cartier (1924), pero con tres aros del mismo tono de oro y un único zafiro central. Edición limitada a 12 piezas numeradas.']
}, {
  id: 'editorial-emerald',
  slug: 'collar-la-verde',
  name: 'Collar La Verde',
  collection: 'editorial',
  price: 38600000,
  images: [`${ASSET}/model-emerald.webp`, `${ASSET}/banner-hero.webp`, `${ASSET}/ring-sapphire.webp`],
  tag: 'Pieza única',
  featured: true,
  specs: {
    stones: '11 esmeraldas Muzo',
    accent: 'Diamantes GIA',
    metal: 'Oro amarillo 18K',
    piece: 'Única'
  },
  description: 'La pieza central de la campaña La Verde 2026: una cascada de esmeraldas briolette engarzadas en hilos de oro, diseñada para un único cuello en el mundo.',
  story: ['Diseñada por Kary Mendoza durante dos meses de bocetos antes de tocar el oro. Las once esmeraldas briolette fueron seleccionadas en Muzo a lo largo de medio año.', 'Cada hilo está tejido a mano. La pieza tomó 380 horas de orfebrería.']
}, {
  id: 'argolla-aurora',
  slug: 'argollas-aurora',
  name: 'Argollas Aurora',
  collection: 'argollas',
  price: 6200000,
  images: [`${ASSET}/banner.webp`, `${ASSET}/earrings-travertino.webp`],
  specs: {
    stones: 'Oro pulido',
    metal: 'Oro 18K · Ley 750',
    finish: 'Pulido espejo',
    section: 'Confort',
    engraving: 'Incluido'
  },
  description: 'La alianza no se elige para impresionar; se elige para durar. Oro 18K liso, sección confort, pensado para los 50 años que vienen.',
  story: ['Aleación europea estándar (oro 75%, plata 12.5%, paladio 12.5%) para resistencia estructural. Grabado interior incluido — fecha, iniciales o un verso.']
}, {
  id: 'dije-muzo',
  slug: 'dije-gota-muzo',
  name: 'Dije Gota de Muzo',
  collection: 'dijes-colgantes',
  price: 8900000,
  images: [`${ASSET}/gema.webp`, `${ASSET}/earrings-emerald.webp`],
  specs: {
    stones: 'Esmeralda briolette',
    stone: 'Esmeralda Muzo Vieja',
    chain: 'Veneciana 45cm',
    metal: 'Oro amarillo 18K'
  },
  description: 'Una sola gota de esmeralda briolette, suspendida de una cadena veneciana de oro 18K. La piedra gira con la luz; nunca se queda quieta.',
  story: ['Esmeralda briolette de 1.8 quilates, extraída de Muzo antes de 1990 ("Muzo Vieja"). Su transparencia es notablemente superior a las de mina contemporánea.']
}, {
  id: 'pulsera-tenis',
  slug: 'pulsera-tenis-diamante',
  name: 'Pulsera Tenis Diamante',
  collection: 'pulseras',
  price: 18600000,
  images: [`${ASSET}/ring-sapphire.webp`, `${ASSET}/banner.webp`],
  tag: 'Best Seller',
  specs: {
    stones: '54 diamantes',
    cut: 'Brillante 2.2mm',
    metal: 'Oro blanco 18K',
    clarity: 'VS · color G'
  },
  description: 'La pulsera tenis clásica, reinterpretada en proporciones más íntimas. 54 diamantes brillante en línea sobre oro blanco 18K.',
  story: ['Engaste tipo carril con doble seguro de mariposa. Pesa apenas 8.4 gramos pero refracta como una pieza tres veces más grande.']
}, {
  id: 'anillo-jardin',
  slug: 'anillo-jardin-esmeralda',
  name: 'Anillo Jardín Esmeralda',
  collection: 'anillos',
  price: 16400000,
  images: [`${ASSET}/earrings-emerald.webp`, `${ASSET}/model-emerald.webp`],
  featured: true,
  specs: {
    stones: 'Esmeralda · 8 diamantes',
    stone: 'Esmeralda Chivor',
    metal: 'Oro amarillo 18K',
    size: 'Hecho a medida'
  },
  description: 'Una esmeralda esmeralda-cut central enmarcada por ocho diamantes baguette que dibujan un jardín cuadrado.',
  story: ['Esmeralda de 1.6 quilates, talla esmeralda 7x5mm. Los diamantes baguette están engastados a presión sin uñas — un acabado que solo se logra en oro 18K bien aleado.']
}];

// Decorate products with back-compat shortcuts used by simpler components
PRODUCTS.forEach(p => {
  p.img = p.images && p.images[0];
  const col = COLLECTIONS.find(c => c.slug === p.collection);
  p.cat = col ? col.name : p.collection;
  p.stones = p.specs && p.specs.stones;
  p.gold = p.specs && p.specs.metal;
  p.gallery = p.images;
  p.desc = p.description;
});

// Catalog helpers (mirror of data.js API)
function getCollections() {
  return COLLECTIONS;
}
function getAll() {
  return PRODUCTS;
}
function getFeatured(n = 8) {
  return [...PRODUCTS].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).slice(0, n);
}
function countByCollection(slug) {
  return PRODUCTS.filter(p => p.collection === slug).length;
}
function getBySlug(slug) {
  return PRODUCTS.find(p => p.slug === slug || p.id === slug);
}
function getRelated(p, n = 3) {
  return PRODUCTS.filter(x => x.id !== p.id && x.collection === p.collection).slice(0, n);
}

// Marquee + services (used by home)
const MARQUEE = ['Oro 18K · Ley 750', 'Esmeraldas Colombianas', 'Asesoría Personalizada', 'Garantía Vitalicia', 'Atelier en Cartagena', 'Envío Asegurado Mundial', 'Una pieza, una historia'];
const SERVICES = [{
  t: 'Diseño a medida',
  d: 'Crea la pieza de tus sueños con nuestro atelier. Desde boceto hasta entrega.',
  icon: 'pen'
}, {
  t: 'Asesoría privada',
  d: 'Consulta 1:1 con nuestros gemólogos. Virtual o en nuestra casa en Cartagena.',
  icon: 'user'
}, {
  t: 'Certificación GIA',
  d: 'Cada pieza con diamante incluye certificado del Gemological Institute.',
  icon: 'check'
}, {
  t: 'Garantía vitalicia',
  d: 'Mantenimiento, pulido y verificación de piedras de por vida.',
  icon: 'shield'
}];

// Atelier — 4-step process
const ATELIER = [{
  n: '01',
  t: 'El Diseño y Concepto',
  d: 'Concebimos la joya desde el boceto inicial sobre papel, seleccionando metales nobles y gemas con carácter propio.'
}, {
  n: '02',
  t: 'Asesoría Confidencial',
  d: 'Un diálogo íntimo y pausado para dar con la pieza exacta que refleje tu legado.'
}, {
  n: '03',
  t: 'Garantía y Certificación',
  d: 'Respaldamos cada piedra con reportes internacionales de la GIA y origen de mina.'
}, {
  n: '04',
  t: 'Custodia de por vida',
  d: 'Mantenimiento, pulido y restauración vitalicia. Nuestras piezas nacen con vocación de eternidad.'
}];

// The Bersaglio Journal — subset of production js/data/journal.js
const JOURNAL_TICKER = ['Nuevo: Colección Atrato 2026 disponible', 'Live · Subasta privada Casa Bersaglio 14·04', 'Guía: 7 mitos sobre las esmeraldas colombianas', 'Atelier abierto · Cartagena · Cita previa'];
const JOURNAL = [{
  slug: 'esmeraldas-historia-oculta',
  section: 'Reportaje',
  kicker: 'Las gemas que cambiaron Cartagena',
  title: 'Esmeraldas: la historia oculta detrás del verde colombiano',
  excerpt: 'Un viaje al corazón de Muzo y Coscuez, donde la geología, la herencia indígena y el oficio artesanal convergen para producir las esmeraldas más codiciadas del planeta.',
  date: '14·03·26',
  dateLong: 'Marzo 2026',
  read: '8 min',
  author: 'María Camila Bersaglio',
  authorRole: 'Directora editorial',
  img: `${ASSET}/earrings-emerald.webp`,
  featured: true
}, {
  slug: 'seis-pulsos-anillo',
  section: 'Atelier',
  kicker: 'Detrás del taller',
  title: 'Los seis pulsos de un anillo a medida',
  excerpt: 'Desde el boceto hasta la entrega, así viaja una pieza por las manos de cuatro oficios.',
  date: '12·03·26',
  dateLong: 'Marzo 2026',
  read: '5 min',
  author: 'Andrés Beltrán',
  authorRole: 'Diseñador atelier',
  img: `${ASSET}/ring-sapphire.webp`
}, {
  slug: 'oro-18k-vs-14k',
  section: 'Mercado',
  kicker: 'Patrimonio',
  title: 'Por qué el oro 18K supera al 14K en patrimonio',
  excerpt: 'Una diferencia de 4 quilates parece menor — pero a treinta años, la prima del 18K se nota en color, estructura y valor.',
  date: '06·03·26',
  dateLong: 'Marzo 2026',
  read: '4 min',
  author: 'Kary Mendoza',
  authorRole: 'Directora',
  img: `${ASSET}/banner-hero.webp`
}, {
  slug: 'trinity-cartier',
  section: 'Diseño',
  kicker: 'Historia del diseño',
  title: 'Trinity: la geometría que enamoró a Cartier',
  excerpt: 'Tres anillos entrelazados, tres metales, tres significados.',
  date: '28·02·26',
  dateLong: 'Febrero 2026',
  read: '6 min',
  author: 'María Camila Bersaglio',
  authorRole: 'Directora editorial',
  img: `${ASSET}/model-emerald.webp`
}, {
  slug: 'rituales-diamante',
  section: 'Cuidado',
  kicker: 'Mantenimiento',
  title: 'Rituales caseros para conservar el fuego de tu diamante',
  excerpt: 'Una rutina mensual de tres pasos para que tu diamante mantenga el brillo del primer día.',
  date: '19·02·26',
  dateLong: 'Febrero 2026',
  read: '3 min',
  author: 'Lucía Restrepo',
  authorRole: 'Gemóloga GIA',
  img: `${ASSET}/earrings-travertino.webp`
}, {
  slug: 'paciencia-geologica',
  section: 'Entrevista',
  kicker: 'Conversaciones del atelier',
  title: '"La esmeralda es paciencia geológica"',
  excerpt: 'Andrés Forero, gemólogo GIA con 18 años de oficio, sobre cómo leer una piedra.',
  date: '14·02·26',
  dateLong: 'Febrero 2026',
  read: '9 min',
  author: 'María Camila Bersaglio',
  authorRole: 'Directora editorial',
  img: `${ASSET}/gema.webp`
}];
const JOURNAL_ISSUE = {
  number: 'Issue Nº 14',
  date: 'Marzo 2026',
  est: 'EST. 2014'
};

// ── Bersaglio Films · multimedia (videos) ──────────────────────────
const VIDEO_CATEGORIES = ['Todos', 'Atelier', 'Educativo', 'Colección', 'Ofertas', 'Inventario'];
const VIDEOS = [{
  id: 'v-laverde',
  title: 'El nacimiento de La Verde',
  cat: 'Atelier',
  dur: '4:12',
  thumb: `${ASSET}/model-emerald.webp`,
  featured: true,
  desc: '380 horas de orfebrería condensadas en un cortometraje. La pieza central de la campaña 2026, de la mina al cuello.'
}, {
  id: 'v-leer',
  title: 'Cómo leer una esmeralda',
  cat: 'Educativo',
  dur: '6:30',
  thumb: `${ASSET}/gema.webp`
}, {
  id: 'v-atrato',
  title: 'Colección Atrato · 2026',
  cat: 'Colección',
  dur: '1:45',
  thumb: `${ASSET}/earrings-emerald.webp`
}, {
  id: 'v-argollas',
  title: '−15% en argollas de boda',
  cat: 'Ofertas',
  dur: '0:30',
  thumb: `${ASSET}/banner.webp`,
  badge: 'Oferta'
}, {
  id: 'v-pave',
  title: 'Detrás del engaste pavé',
  cat: 'Atelier',
  dur: '3:20',
  thumb: `${ASSET}/ring-sapphire.webp`
}, {
  id: 'v-muzo',
  title: 'Muzo vs Coscuez: el verde decide',
  cat: 'Educativo',
  dur: '5:10',
  thumb: `${ASSET}/earrings-travertino.webp`
}, {
  id: 'v-inventario',
  title: 'Esmeraldas disponibles esta semana',
  cat: 'Inventario',
  dur: '2:00',
  thumb: `${ASSET}/collage.webp`,
  badge: 'En vivo'
}, {
  id: 'v-historia',
  title: 'Una pieza, una historia',
  cat: 'Atelier',
  dur: '2:48',
  thumb: `${ASSET}/banner-hero.webp`
}];

// ── Social feed (latest posts; in production fed from Meta/TikTok APIs → Firestore) ──
const SOCIAL_PLATFORMS = ['Todas', 'Instagram', 'Facebook', 'TikTok'];
const SOCIAL = [{
  platform: 'Instagram',
  thumb: `${ASSET}/earrings-emerald.webp`,
  caption: 'Topos Halo recién salidos del atelier ✨',
  stat: '2.4k',
  kind: 'likes',
  date: 'hace 2 h',
  type: 'reel'
}, {
  platform: 'TikTok',
  thumb: `${ASSET}/gema.webp`,
  caption: 'POV: ves una Muzo Vieja por primera vez',
  stat: '38.1k',
  kind: 'views',
  date: 'hace 5 h',
  type: 'video'
}, {
  platform: 'Instagram',
  thumb: `${ASSET}/ring-sapphire.webp`,
  caption: 'El zafiro Trinity, edición de 12 piezas',
  stat: '1.9k',
  kind: 'likes',
  date: 'ayer',
  type: 'photo'
}, {
  platform: 'Facebook',
  thumb: `${ASSET}/model-emerald.webp`,
  caption: 'Nuestro atelier te espera con un café',
  stat: '512',
  kind: 'likes',
  date: 'ayer',
  type: 'photo'
}, {
  platform: 'TikTok',
  thumb: `${ASSET}/banner-hero.webp`,
  caption: 'Cartagena al atardecer desde el atelier',
  stat: '64.7k',
  kind: 'views',
  date: 'hace 2 d',
  type: 'video'
}, {
  platform: 'Instagram',
  thumb: `${ASSET}/earrings-travertino.webp`,
  caption: 'Detalle: engaste pavé a 40x de aumento',
  stat: '3.1k',
  kind: 'likes',
  date: 'hace 3 d',
  type: 'reel'
}, {
  platform: 'Facebook',
  thumb: `${ASSET}/collage.webp`,
  caption: 'Colección Atrato 2026 · ya disponible',
  stat: '847',
  kind: 'likes',
  date: 'hace 4 d',
  type: 'photo'
}, {
  platform: 'TikTok',
  thumb: `${ASSET}/banner.webp`,
  caption: 'Cómo limpiar tu esmeralda en casa',
  stat: '22.5k',
  kind: 'views',
  date: 'hace 5 d',
  type: 'video'
}];
const fmt$ = n => '$ ' + Number(n).toLocaleString('es-CO') + ' COP';
const fmtShort = n => '$ ' + (n / 1000000).toFixed(1).replace('.0', '') + 'M';

// Legacy alias used by simplified Home/Catalog screens
const CATEGORIES = COLLECTIONS.map(c => ({
  name: c.name,
  slug: c.slug,
  img: PRODUCTS.find(p => p.collection === c.slug)?.img || `${ASSET}/banner.webp`
}));
Object.assign(window, {
  COLLECTIONS,
  CATEGORIES,
  PRODUCTS,
  MARQUEE,
  SERVICES,
  ATELIER,
  JOURNAL,
  JOURNAL_TICKER,
  JOURNAL_ISSUE,
  VIDEOS,
  VIDEO_CATEGORIES,
  SOCIAL,
  SOCIAL_PLATFORMS,
  getCollections,
  getAll,
  getFeatured,
  countByCollection,
  getBySlug,
  getRelated,
  fmt$,
  fmtShort
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/data.jsx", error: String((e && e.message) || e) }); }

})();
