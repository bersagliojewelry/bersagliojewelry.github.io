/* global React */
// Hooks destructured ONLY here. Other babel files must use React.useState etc.
const { useState, useEffect, useRef } = React;

// ═══════════════════════════════════════════════════════════════════
// LOGO
// ═══════════════════════════════════════════════════════════════════
const BersaglioLogo = ({ size = 40, mono = false, tone = "emerald" }) => {
  const stroke = mono ? "currentColor" : (tone === "emerald" ? "#0f5132" : "#d4a94a");
  return (
    <svg width={size} height={size * 1.05} viewBox="0 0 80 84" fill="none" style={{display:"block"}}>
      <circle cx="40" cy="42" r="28" stroke={stroke} strokeWidth="1.2" opacity="0.85" fill="none"/>
      <line x1="40" y1="4" x2="40" y2="80" stroke={stroke} strokeWidth="0.8" opacity="0.5"/>
      <text x="40" y="54" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="600" fontSize="32" fill={stroke}>B</text>
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════
// CART CONTEXT (simple global)
// ═══════════════════════════════════════════════════════════════════
const CartCtx = React.createContext(null);
const useCart = () => React.useContext(CartCtx);

function CartProvider({ children }) {
  const [items, setItems] = useState([
    { id: "trinity-em", name: "Anillo Trinity Esmeralda", price: 14800000, qty: 1, img: "assets/ring-sapphire.jpg" },
  ]);
  const [open, setOpen] = useState(false);
  const add = (p) => setItems(prev => {
    const e = prev.find(i => i.id === p.id);
    if (e) return prev.map(i => i.id === p.id ? {...i, qty: i.qty+1} : i);
    return [...prev, {...p, qty: 1}];
  });
  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const updateQty = (id, qty) => setItems(prev => prev.map(i => i.id === id ? {...i, qty: Math.max(1, qty)} : i));
  const subtotal = items.reduce((s,i) => s + i.price * i.qty, 0);
  return <CartCtx.Provider value={{items, add, remove, updateQty, subtotal, open, setOpen}}>{children}</CartCtx.Provider>;
}

// ═══════════════════════════════════════════════════════════════════
// ROUTER (hash-based, lightweight)
// ═══════════════════════════════════════════════════════════════════
const RouteCtx = React.createContext(null);
function RouterProvider({ children }) {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || "home");
  useEffect(() => {
    const onHash = () => {
      setRoute(window.location.hash.slice(1) || "home");
      window.scrollTo({top:0,behavior:"instant"});
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const navigate = (to) => { window.location.hash = to; };
  return <RouteCtx.Provider value={{route, navigate}}>{children}</RouteCtx.Provider>;
}
const useRouter = () => React.useContext(RouteCtx);

// ═══════════════════════════════════════════════════════════════════
// HEADER — Floating glass dock with liquid nav
// ═══════════════════════════════════════════════════════════════════
function Header() {
  const { route, navigate } = useRouter();
  const { items, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [
    { k: "home", label: "Inicio" },
    { k: "catalogo", label: "Colecciones" },
    { k: "nosotros", label: "Nosotros" },
    { k: "contacto", label: "Contacto" },
  ];

  return (
    <header style={{
      position: "fixed", top: 18, left: 0, right: 0, zIndex: 100,
      display: "flex", justifyContent: "center", pointerEvents: "none",
      transition: "top .4s",
    }}>
      <div className="glass glass-iridescent" style={{
        pointerEvents: "auto",
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 14px 10px 22px",
        borderRadius: 999,
        maxWidth: "min(980px, calc(100vw - 32px))",
        width: "100%",
      }}>
        {/* Logo */}
        <button onClick={() => navigate("home")} style={{display:"flex", alignItems:"center", gap:10, padding:"4px 8px"}}>
          <BersaglioLogo size={28} />
          <div style={{lineHeight:1}}>
            <div style={{fontFamily:"var(--font-brand)", fontSize:18, fontWeight:500, color:"var(--bj-emerald-800)", letterSpacing:"0.05em"}}>BERSAGLIO</div>
            <div style={{fontFamily:"var(--font-ui)", fontSize:8, letterSpacing:"0.4em", color:"var(--bj-ink-mute)", textTransform:"uppercase"}}>Jewelry</div>
          </div>
        </button>

        {/* Desktop nav pills */}
        <nav style={{
          display: "flex", gap: 2, marginLeft: "auto", marginRight: 8,
          background: "oklch(100% 0 0 / 0.35)", padding: 4, borderRadius: 999,
          border: "1px solid oklch(100% 0 0 / 0.5)",
        }} className="hide-mobile">
          {nav.map(n => {
            const active = route === n.k || (n.k === "catalogo" && route.startsWith("producto"));
            return (
              <button key={n.k} onClick={() => navigate(n.k)} style={{
                padding: "8px 16px", fontSize: 13, fontWeight: 500, borderRadius: 999,
                color: active ? "#fff" : "var(--bj-emerald-800)",
                background: active ? "linear-gradient(180deg, oklch(62% 0.18 155), oklch(42% 0.14 155))" : "transparent",
                boxShadow: active ? "0 1px 0 oklch(100% 0 0 / 0.5) inset, 0 4px 12px -4px oklch(42% 0.14 155 / 0.45)" : "none",
                textShadow: active ? "0 1px 1px oklch(20% 0.05 155 / 0.4)" : "none",
                transition: "all .3s",
              }}>
                {n.label}
              </button>
            );
          })}
        </nav>

        {/* Cart */}
        <button onClick={() => setOpen(true)} title="Carrito" style={{
          position: "relative",
          width: 40, height: 40, borderRadius: 999,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "oklch(100% 0 0 / 0.6)",
          border: "1px solid oklch(100% 0 0 / 0.6)",
          boxShadow: "0 1px 0 oklch(100% 0 0 / 0.9) inset",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2l-2 5v15h16V7l-2-5H6z"/><path d="M4 7h16M10 11a2 2 0 0 0 4 0"/></svg>
          {items.length > 0 && (
            <span style={{position:"absolute", top:-4, right:-4, minWidth:18, height:18, padding:"0 5px", borderRadius:999, background:"var(--bj-emerald-600)", color:"#fff", fontSize:10, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid var(--bj-pearl)"}}>{items.reduce((s,i)=>s+i.qty,0)}</span>
          )}
        </button>

        {/* Mobile menu btn */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="show-mobile" style={{
          width: 40, height: 40, borderRadius: 999, display: "none",
          alignItems: "center", justifyContent: "center",
          background: "oklch(100% 0 0 / 0.6)", border: "1px solid oklch(100% 0 0 / 0.6)",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="glass" style={{
          pointerEvents: "auto",
          position: "absolute", top: 80, left: 16, right: 16,
          padding: 16, borderRadius: 24, display: "flex", flexDirection: "column", gap: 4,
        }}>
          {nav.map(n => (
            <button key={n.k} onClick={() => {navigate(n.k); setMobileOpen(false);}} style={{
              textAlign: "left", padding: "14px 16px", fontSize: 15, fontWeight: 500, borderRadius: 12,
              color: route === n.k ? "#fff" : "var(--bj-emerald-800)",
              background: route === n.k ? "linear-gradient(180deg, oklch(62% 0.18 155), oklch(42% 0.14 155))" : "transparent",
            }}>{n.label}</button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CART DRAWER
// ═══════════════════════════════════════════════════════════════════
function CartDrawer() {
  const { items, remove, updateQty, subtotal, open, setOpen } = useCart();
  const { navigate } = useRouter();
  if (!open) return null;
  const fmt = (n) => "$ " + n.toLocaleString("es-CO") + " COP";
  return (
    <div style={{position:"fixed", inset:0, zIndex:200, display:"flex", justifyContent:"flex-end"}}>
      <div onClick={() => setOpen(false)} style={{position:"absolute", inset:0, background:"oklch(28% 0.08 155 / 0.3)", backdropFilter:"blur(6px)"}}/>
      <div className="glass" style={{
        position:"relative", width:"min(440px, 100vw)", height:"100%", borderRadius:0,
        display:"flex", flexDirection:"column", padding:24,
        background:"oklch(98% 0.01 150 / 0.85)",
      }}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24}}>
          <div>
            <div className="eyebrow">Carrito</div>
            <h3 style={{fontSize:28, marginTop:4}}>Tus joyas</h3>
          </div>
          <button onClick={() => setOpen(false)} style={{width:36, height:36, borderRadius:999, background:"oklch(100% 0 0 / 0.6)", border:"1px solid oklch(100% 0 0 / 0.6)", display:"flex", alignItems:"center", justifyContent:"center"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
          </button>
        </div>

        <div style={{flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:14}}>
          {items.length === 0 && <div style={{textAlign:"center", padding:"48px 0", color:"var(--bj-ink-mute)"}}>Tu carrito está vacío</div>}
          {items.map(i => (
            <div key={i.id} className="glass" style={{padding:14, borderRadius:16, display:"flex", gap:14}}>
              <div style={{width:72, height:72, borderRadius:12, background:`url(${i.img}) center/cover`, flexShrink:0, boxShadow:"inset 0 0 0 1px oklch(100% 0 0 / 0.5)"}}/>
              <div style={{flex:1, display:"flex", flexDirection:"column", justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:14, fontWeight:500, color:"var(--bj-ink-emerald)"}}>{i.name}</div>
                  <div className="mono" style={{fontSize:12, color:"var(--bj-emerald-700)", marginTop:2}}>{fmt(i.price)}</div>
                </div>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <div style={{display:"flex", alignItems:"center", gap:6, background:"oklch(100% 0 0 / 0.6)", padding:"2px 6px", borderRadius:999, border:"1px solid oklch(100% 0 0 / 0.6)"}}>
                    <button onClick={() => updateQty(i.id, i.qty-1)} style={{width:22, height:22, fontSize:14}}>−</button>
                    <span className="mono" style={{minWidth:16, textAlign:"center", fontSize:12}}>{i.qty}</span>
                    <button onClick={() => updateQty(i.id, i.qty+1)} style={{width:22, height:22, fontSize:14}}>+</button>
                  </div>
                  <button onClick={() => remove(i.id)} style={{fontSize:11, color:"var(--bj-ink-mute)", textDecoration:"underline"}}>Quitar</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div style={{marginTop:20, paddingTop:20, borderTop:"1px solid oklch(100% 0 0 / 0.5)"}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:16}}>
              <span className="eyebrow">Subtotal</span>
              <span className="mono" style={{fontSize:18, fontWeight:600, color:"var(--bj-emerald-800)"}}>{fmt(subtotal)}</span>
            </div>
            <button onClick={() => {setOpen(false); navigate("checkout");}} className="btn-aqua btn-aqua-emerald" style={{width:"100%", padding:"16px"}}>
              Ir al checkout
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════
function Footer() {
  const { navigate } = useRouter();
  return (
    <footer style={{padding:"24px 0 20px", marginTop: 24}}>
      <div className="container">
        <div className="glass glass-iridescent" style={{padding:"32px 32px", borderRadius:40, display:"grid", gridTemplateColumns:"1.3fr 1fr 1fr 1fr", gap:32}}>
          <div>
            <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:16}}>
              <BersaglioLogo size={36} />
              <div style={{fontFamily:"var(--font-brand)", fontSize:22, fontWeight:500, color:"var(--bj-emerald-800)", letterSpacing:"0.05em"}}>BERSAGLIO</div>
            </div>
            <p style={{fontSize:13, color:"var(--bj-ink-soft)", lineHeight:1.6, marginBottom:20}}>
              Alta joyería con esmeraldas colombianas, diamantes certificados y oro 18K. Piezas diseñadas para trascender generaciones.
            </p>
            <div style={{display:"flex", gap:8}}>
              {[
                {k:"instagram", svg:<><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></>},
                {k:"facebook",  svg:<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>},
                {k:"whatsapp",  svg:<><path d="M20.5 3.5A11 11 0 0 0 3.4 17l-1.4 5.1 5.2-1.4A11 11 0 1 0 20.5 3.5z"/><path d="M8 10.5c.3 2 2 3.7 4 4.2 1 .3 1.9.1 2.5-.5.2-.2.4-.5.3-.8l-.3-.9c-.1-.3-.4-.4-.7-.4l-1 .2c-.2 0-.4 0-.6-.2-.5-.4-1-.9-1.3-1.5-.1-.2-.1-.4 0-.5l.4-.6c.2-.2.2-.5.1-.7l-.5-1c-.1-.3-.4-.4-.7-.4l-.9.2c-.4.1-.6.4-.6.8 0 .7.1 1.4.3 2z"/></>},
              ].map(s => (
                <a key={s.k} href="#" aria-label={s.k} style={{width:34, height:34, borderRadius:999, background:"oklch(100% 0 0 / 0.6)", border:"1px solid oklch(100% 0 0 / 0.6)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--bj-emerald-800)"}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">{s.svg}</svg>
                </a>
              ))}
            </div>
          </div>

          {[
            {t:"Colecciones", l:[["Anillos","catalogo"],["Aretes","catalogo"],["Collares","catalogo"],["Argollas","catalogo"]]},
            {t:"Casa", l:[["Nuestra historia","nosotros"],["Diseño a medida","contacto"],["Certificaciones","nosotros"],["Journal","nosotros"]]},
            {t:"Servicio", l:[["Contacto","contacto"],["Asesoría","contacto"],["Envíos","contacto"],["Garantía","contacto"]]},
          ].map(col => (
            <div key={col.t}>
              <div className="eyebrow" style={{marginBottom:14}}>{col.t}</div>
              <ul style={{listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:10}}>
                {col.l.map(([lab,r]) => <li key={lab}><button onClick={()=>navigate(r)} style={{fontSize:13, color:"var(--bj-ink-soft)"}}>{lab}</button></li>)}
              </ul>
            </div>
          ))}
        </div>

        <div style={{marginTop:24, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12, fontSize:11, color:"var(--bj-ink-mute)", letterSpacing:"0.1em", textTransform:"uppercase"}}>
          <span>© 2026 Bersaglio Jewelry · Cartagena de Indias, Colombia</span>
          <span>Certificado JA · Jewelers of America</span>
        </div>
      </div>

      <style>{`
        footer .glass { }
        @media (max-width: 820px) {
          footer .glass { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 520px) {
          footer .glass { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DATA — Catálogo
// ═══════════════════════════════════════════════════════════════════
const PRODUCTS = [
  { id:"halo-emerald", name:"Topos Halo Esmeralda", cat:"Aretes", price: 12400000, img:"assets/earrings-travertino.png", stones:"Esmeralda · Diamante", gold:"Oro 18K", tag:"Best Seller" },
  { id:"emerald-classic", name:"Topos Esmeralda Classic", cat:"Aretes", price: 9800000, img:"assets/earrings-emerald.png", stones:"Esmeralda colombiana", gold:"Oro amarillo 18K" },
  { id:"trinity-em", name:"Anillo Trinity Zafiro", cat:"Anillos", price: 14800000, img:"assets/ring-sapphire.jpg", stones:"Zafiro · Diamantes", gold:"Oro amarillo 18K", tag:"Edición limitada" },
  { id:"model-em", name:"Editorial Esmeralda", cat:"Editorial", price: 0, img:"assets/model-emerald.png", stones:"Esmeralda · Diamantes", gold:"Oro 18K", hideCart:true },
];

Object.assign(window, { BersaglioLogo, CartProvider, useCart, RouterProvider, useRouter, Header, CartDrawer, Footer, PRODUCTS });
