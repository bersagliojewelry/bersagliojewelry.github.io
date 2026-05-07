/* global React */
const { useState: uS, useEffect: uE } = React;

// ═══════════════════════════════════════════════════════════════════
// CATÁLOGO — Grid + filtros
// ═══════════════════════════════════════════════════════════════════
function Catalogo() {
  const { navigate } = useRouter();
  const [cat, setCat] = uS("Todo");
  const [sort, setSort] = uS("destacados");
  const cats = ["Todo", "Anillos", "Aretes", "Argollas", "Dijes", "Editorial"];
  const fmt = (n) => "$ " + n.toLocaleString("es-CO");

  // Ampliar el catálogo con variantes repetidas para vista rica
  const extendedCatalog = [
    ...PRODUCTS,
    { id:"halo-em-2", name:"Aros Halo Doble", cat:"Aretes", price:11200000, img:"assets/earrings-travertino.png", stones:"Esmeralda · Diamante", gold:"Oro 18K" },
    { id:"ring-em-classic", name:"Solitario Esmeralda", cat:"Anillos", price:18900000, img:"assets/ring-sapphire.jpg", stones:"Esmeralda 2.8ct", gold:"Oro blanco 18K", tag:"Nuevo" },
    { id:"argolla-inf", name:"Argolla Infinito", cat:"Argollas", price:6400000, img:"assets/earrings-emerald.png", stones:"Diamantes pavé", gold:"Oro amarillo 18K" },
    { id:"dije-muzo", name:"Dije Gota Muzo", cat:"Dijes", price:8600000, img:"assets/earrings-travertino.png", stones:"Esmeralda gota 1.4ct", gold:"Oro amarillo 18K" },
  ];

  let filtered = cat === "Todo" ? extendedCatalog : extendedCatalog.filter(p => p.cat === cat);
  if (sort === "menor") filtered = [...filtered].sort((a,b)=>a.price-b.price);
  if (sort === "mayor") filtered = [...filtered].sort((a,b)=>b.price-a.price);

  return (
    <main style={{paddingTop:116, paddingBottom:40}}>
      <div className="container">
        {/* Header */}
        <div style={{textAlign:"center", marginBottom:24}}>
          <div className="eyebrow" style={{marginBottom:10}}>Catálogo · 2026</div>
          <h1 style={{fontSize:"clamp(48px, 6vw, 88px)", fontWeight:300, letterSpacing:"-0.03em", lineHeight:1}}>
            Todas las <span className="italic emerald-text">piezas</span>
          </h1>
          <p style={{fontSize:16, color:"var(--bj-ink-soft)", maxWidth:540, margin:"20px auto 0"}}>
            Explora nuestra colección completa. Cada pieza es única, con certificación de origen y oro de ley 750.
          </p>
        </div>

        {/* Filtros glass */}
        <div style={{display:"flex", justifyContent:"space-between", gap:16, marginBottom:22, flexWrap:"wrap", alignItems:"center"}}>
          <div className="glass" style={{padding:6, borderRadius:999, display:"flex", gap:2}}>
            {cats.map(c => (
              <button key={c} onClick={()=>setCat(c)} style={{
                padding:"10px 18px", fontSize:13, fontWeight:500, borderRadius:999,
                color: cat===c ? "#fff" : "var(--bj-ink-soft)",
                background: cat===c ? "linear-gradient(180deg, oklch(62% 0.18 155), oklch(42% 0.14 155))" : "transparent",
                boxShadow: cat===c ? "0 1px 0 oklch(100% 0 0 / 0.5) inset, 0 4px 12px -4px oklch(42% 0.14 155 / 0.45)" : "none",
                textShadow: cat===c ? "0 1px 1px oklch(20% 0.05 155 / 0.4)" : "none",
                transition:"all .3s",
              }}>{c}</button>
            ))}
          </div>
          <div className="glass" style={{padding:"8px 8px 8px 16px", borderRadius:999, display:"flex", alignItems:"center", gap:10}}>
            <span style={{fontSize:12, color:"var(--bj-ink-mute)", letterSpacing:"0.1em", textTransform:"uppercase"}}>Orden</span>
            <select value={sort} onChange={e=>setSort(e.target.value)} style={{background:"oklch(100% 0 0 / 0.6)", border:"1px solid oklch(100% 0 0 / 0.5)", padding:"8px 14px", borderRadius:999, fontSize:13, color:"var(--bj-ink-emerald)", fontFamily:"inherit", cursor:"pointer"}}>
              <option value="destacados">Destacados</option>
              <option value="menor">Precio · menor</option>
              <option value="mayor">Precio · mayor</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:22}}>
          {filtered.map(p => (
            <button key={p.id} onClick={()=>navigate("producto/"+p.id)} className="glass glass-iridescent" style={{
              padding:0, borderRadius:30, overflow:"hidden", textAlign:"left",
              transition:"transform .5s cubic-bezier(.2,.9,.2,1)",
            }}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-8px)"}
            onMouseLeave={e=>e.currentTarget.style.transform=""}>
              <div style={{position:"relative", aspectRatio:"4/5", background:`url(${p.img}) center/cover`}}>
                <div style={{position:"absolute", inset:0, background:"linear-gradient(180deg, oklch(92% 0.06 150 / 0.15), transparent 40%)"}}/>
                {p.tag && <div style={{position:"absolute", top:14, left:14}}><div className="chip" style={{background:"oklch(20% 0.05 155 / 0.5)", color:"#fff", border:"1px solid oklch(100% 0 0 / 0.4)", backdropFilter:"blur(12px)"}}><span className="chip-dot" style={{background:"var(--bj-gold-500)"}}/>{p.tag}</div></div>}
              </div>
              <div style={{padding:"20px 22px 22px"}}>
                <div style={{fontSize:10, letterSpacing:"0.25em", textTransform:"uppercase", color:"var(--bj-ink-mute)", marginBottom:6}}>{p.cat}</div>
                <div style={{fontFamily:"var(--font-display)", fontSize:20, fontWeight:500, color:"var(--bj-ink-emerald)", marginBottom:6}}>{p.name}</div>
                <div style={{fontSize:12, color:"var(--bj-ink-soft)", marginBottom:14}}>{p.stones}</div>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:12, borderTop:"1px solid oklch(100% 0 0 / 0.5)"}}>
                  <div className="mono" style={{fontSize:14, fontWeight:600, color:"var(--bj-emerald-800)"}}>{p.price?fmt(p.price):"— Editorial —"}</div>
                  <div style={{fontSize:11, color:"var(--bj-ink-mute)"}}>Ver <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:"middle"}}><path d="M5 12h14M13 5l7 7-7 7"/></svg></div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DETALLE PRODUCTO
// ═══════════════════════════════════════════════════════════════════
function Producto({ id }) {
  const { navigate } = useRouter();
  const { add, setOpen } = useCart();
  const p = PRODUCTS.find(x => x.id === id) || PRODUCTS[0];
  const [view, setView] = uS(0);
  const imgs = [p.img, "assets/ring-sapphire.jpg", "assets/earrings-emerald.png"];
  const fmt = (n) => "$ " + n.toLocaleString("es-CO");

  return (
    <main style={{paddingTop:120, paddingBottom:56}}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{display:"flex", gap:8, alignItems:"center", fontSize:12, color:"var(--bj-ink-mute)", marginBottom:18, letterSpacing:"0.08em", textTransform:"uppercase"}}>
          <button onClick={()=>navigate("home")}>Inicio</button>
          <span>→</span>
          <button onClick={()=>navigate("catalogo")}>Catálogo</button>
          <span>→</span>
          <span style={{color:"var(--bj-emerald-800)"}}>{p.name}</span>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1.1fr 1fr", gap:36}} className="prod-grid">
          {/* GALLERY */}
          <div>
            <div className="glass glass-iridescent" style={{borderRadius:36, overflow:"hidden", aspectRatio:"4/5", position:"relative", marginBottom:14}}>
              <div style={{position:"absolute", inset:0, background:`url(${imgs[view]}) center/cover`, transition:"background-image .5s"}}/>
              <div style={{position:"absolute", top:20, right:20, display:"flex", gap:8}}>
                <div className="chip" style={{background:"oklch(100% 0 0 / 0.8)", backdropFilter:"blur(16px)"}}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 22,8.5 12,22 2,8.5"/></svg>
                  GIA Certificado
                </div>
              </div>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10}}>
              {imgs.map((src, i) => (
                <button key={i} onClick={()=>setView(i)} className="glass" style={{aspectRatio:"1", borderRadius:18, overflow:"hidden", padding:0, border: view===i?"2px solid var(--bj-emerald-600)":"1px solid oklch(100% 0 0 / 0.5)"}}>
                  <div style={{width:"100%", height:"100%", background:`url(${src}) center/cover`}}/>
                </button>
              ))}
            </div>
          </div>

          {/* INFO */}
          <div>
            <div className="eyebrow" style={{marginBottom:14}}>{p.cat} · Bersaglio 2026</div>
            <h1 style={{fontSize:"clamp(38px, 4vw, 56px)", fontWeight:300, letterSpacing:"-0.025em", lineHeight:1.05, marginBottom:14}}>{p.name}</h1>
            <div style={{display:"flex", gap:16, alignItems:"center", marginBottom:28}}>
              <div className="mono" style={{fontSize:28, fontWeight:600, color:"var(--bj-emerald-800)"}}>{p.price?fmt(p.price):"Bajo consulta"}</div>
              <div style={{fontSize:11, color:"var(--bj-ink-mute)", letterSpacing:"0.1em", textTransform:"uppercase"}}>IVA incluido</div>
            </div>
            <p style={{fontSize:16, lineHeight:1.7, color:"var(--bj-ink-soft)", marginBottom:32}}>
              Una pieza de alta joyería esculpida en oro de 18 quilates alrededor de una {p.stones.toLowerCase()}. Acabado pulido a mano por nuestro atelier en Cartagena.
            </p>

            {/* Specs glass cards */}
            <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:10, marginBottom:32}}>
              {[
                ["Gema principal", p.stones.split("·")[0]],
                ["Metal", p.gold],
                ["Origen", "Muzo, Colombia"],
                ["Entrega", "2-3 semanas"],
              ].map(([k,v])=>(
                <div key={k} className="glass" style={{padding:"14px 16px", borderRadius:16}}>
                  <div style={{fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--bj-ink-mute)", marginBottom:4}}>{k}</div>
                  <div style={{fontSize:14, fontWeight:500, color:"var(--bj-ink-emerald)"}}>{v}</div>
                </div>
              ))}
            </div>

            {/* Talla selector */}
            <div style={{marginBottom:32}}>
              <div className="eyebrow" style={{marginBottom:12}}>Talla</div>
              <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                {[5,6,7,8,9].map(s => <button key={s} className="glass" style={{width:48, height:48, borderRadius:999, fontSize:13, fontWeight:500, color:"var(--bj-ink-emerald)"}}>{s}</button>)}
                <button className="glass" style={{padding:"0 18px", height:48, borderRadius:999, fontSize:12, color:"var(--bj-ink-soft)"}}>A medida</button>
              </div>
            </div>

            {/* Actions */}
            <div style={{display:"flex", gap:12, marginBottom:24}}>
              <button onClick={()=>{add(p); setOpen(true);}} className="btn-aqua btn-aqua-emerald" style={{padding:"18px 32px", fontSize:14, flex:1}}>
                Agregar al carrito
              </button>
              <button className="btn-aqua" style={{padding:"18px", width:58}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>
            <button onClick={()=>navigate("contacto")} className="btn-aqua btn-aqua-gold" style={{padding:"16px 28px", fontSize:13, width:"100%"}}>
              Consultar con un asesor
            </button>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:920px){.prod-grid{grid-template-columns:1fr!important}}`}</style>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════
// NOSOTROS — historia, manifiesto, atelier, equipo, prensa, FAQ
// ═══════════════════════════════════════════════════════════════════
function Nosotros() {
  const { navigate } = useRouter();
  const [openFaq, setOpenFaq] = uS(0);
  const [activeChapter, setActiveChapter] = uS(0);

  const chapters = [
    {y:"2013", t:"El primer encuentro", d:"Kary Mendoza comienza visitando familias en Cartagena, casa por casa. No vendía joyas: escuchaba historias. Cumpleaños, aniversarios, primeras comuniones, herencias. Cada conversación se convertía en una pieza pensada con propósito."},
    {y:"2016", t:"La primera vitrina", d:"Tras tres años de relaciones íntimas, abre un primer espacio en el Centro Histórico. La filosofía no cambió: la puerta se abre con cita previa, una taza de café tinto, y la promesa de que ninguna pieza sale del atelier sin haber sido pensada para alguien específico."},
    {y:"2020", t:"Reconocimiento internacional", d:"Bersaglio se convierte en miembro de Jewelers of America, certificación que avala estándares éticos en abastecimiento de gemas, trazabilidad de oro y prácticas laborales. Esmeraldas certificadas Muzo y diamantes con reporte GIA."},
    {y:"2023", t:"Diez años de oficio", d:"Más de mil piezas entregadas, cada una con su libreta de origen: la mina de la gema, el orfebre que la talló, el cliente que la encargó, la ocasión que celebra. La memoria viva del atelier."},
    {y:"2026", t:"Colección La Verde", d:"Seis piezas únicas con esmeraldas Muzo Vieja sin tratamiento, monturas en oro 18K paladiado y diamantes briolette. Una declaración: la esmeralda colombiana no necesita imitar a otras gemas, basta con dejar que cuente su propia historia."},
  ];

  const valores = [
    {n:"01", t:"Asesoría antes que venta", d:"No te mostramos catálogos. Te preguntamos por la persona, la ocasión, el presupuesto, el sentimiento. La pieza correcta aparece después, no antes."},
    {n:"02", t:"Origen verificable", d:"Cada esmeralda viene con certificado de mina (Muzo, Coscuez, Chivor). Cada diamante con reporte GIA. Cada gramo de oro con trazabilidad RJC."},
    {n:"03", t:"Orfebrería paciente", d:"Cuatro a seis semanas por pieza. Sin atajos, sin moldes industriales. Cera perdida, lima en mano, lupa de relojero."},
    {n:"04", t:"Servicio de por vida", d:"Limpieza, pulido, reanclaje, redimensionado. Si la pieza salió de Bersaglio, vuelve cuando lo necesite. Sin costo, sin condiciones, durante toda la vida."},
    {n:"05", t:"Discreción absoluta", d:"No publicamos nombres, no etiquetamos clientes, no compartimos imágenes sin permiso explícito. Tu pieza es tu historia."},
    {n:"06", t:"Herencia como medida del éxito", d:"No medimos por ventas. Medimos por cuántas de nuestras piezas vuelven al atelier veinte años después, esta vez en manos de la siguiente generación."},
  ];

  const equipo = [
    {n:"Kary Mendoza", r:"Fundadora & Directora", b:"Diez años escuchando historias y traduciéndolas en piezas. Su firma está en cada decisión: la gema, el orfebre, el detalle final."},
    {n:"Maestro Eliécer Patiño", r:"Orfebre principal", b:"Treinta y dos años en oficio. Aprendiz en Mompox, oficial en Cartagena. Cera perdida, engaste pavé, tallado de filigrana."},
    {n:"Lucía Restrepo", r:"Gemóloga GIA", b:"Certificada por el Gemological Institute of America. Selecciona y autentica cada esmeralda y diamante antes de que entre al taller."},
    {n:"Andrés Beltrán", r:"Diseño & dibujo técnico", b:"Boceto a mano, render 3D, prototipado en cera. Traduce conversaciones en planos que el orfebre puede ejecutar."},
  ];

  const prensa = [
    {m:"Vogue Latinoamérica", t:'"La nueva ola de la alta joyería colombiana"', y:"2024"},
    {m:"Forbes Colombia", t:'"Bersaglio: el lujo discreto de Cartagena"', y:"2023"},
    {m:"El Espectador", t:'"Kary Mendoza, la voz detrás del atelier"', y:"2023"},
    {m:"Revista Diners", t:'"Esmeraldas con apellido"', y:"2022"},
  ];

  const faqs = [
    {q:"¿Cuánto tarda una pieza a medida?", a:"Entre cuatro y seis semanas desde la aprobación del boceto. La primera conversación, los renders y los ajustes pueden sumar dos semanas adicionales. No aceleramos plazos: el oficio paciente no admite atajos."},
    {q:"¿Trabajan con piedras del cliente?", a:"Sí. Recibimos gemas heredadas, las evaluamos con nuestra gemóloga, y las integramos en una pieza nueva. Si la talla original tiene daños, ofrecemos retalle previo en taller especializado."},
    {q:"¿Hacen envíos internacionales?", a:"Sí, con seguro pleno declarado y entrega registrada por DHL Express o FedEx Priority. Despachamos a más de cuarenta países. Los aranceles del país destino corren por cuenta del cliente."},
    {q:"¿Aceptan financiación?", a:"Hasta tres cuotas sin interés con tarjetas locales. Para piezas sobre $50.000.000 COP estructuramos planes a seis o doce meses con entidades aliadas."},
    {q:"¿Puedo visitar el atelier sin comprar?", a:"Por supuesto. La cita previa es solo para garantizar que tengamos tiempo para ti. Recibirás un café, te mostraremos el taller, conocerás al maestro orfebre. Sin compromiso de compra."},
    {q:"¿Qué garantía tienen las piezas?", a:"Garantía de por vida en estructura y engaste. Si una piedra se afloja, la reparamos sin costo. Si una soldadura cede, la rehacemos. Mientras Bersaglio exista, tu pieza tiene casa."},
  ];

  return (
    <main style={{paddingTop:116, paddingBottom:40}}>
      <div className="container">

        {/* HERO EDITORIAL */}
        <div style={{display:"grid", gridTemplateColumns:"1.1fr 1fr", gap:28, alignItems:"center", marginBottom:32}} className="abt-hero">
          <div>
            <div className="mono" style={{fontSize:11, letterSpacing:"0.3em", color:"var(--bj-gold-700)", marginBottom:24}}>CAPÍTULO 00 · QUIÉNES SOMOS</div>
            <h1 style={{fontSize:"clamp(56px, 7.5vw, 120px)", fontWeight:200, letterSpacing:"-0.04em", lineHeight:0.92, marginBottom:32}}>
              Una joya<br/>
              <span className="italic emerald-text" style={{fontWeight:300}}>se elige,</span><br/>
              no se compra.
            </h1>
            <p style={{fontSize:19, color:"var(--bj-ink-soft)", lineHeight:1.65, marginBottom:24, maxWidth:540}}>
              Trece años atrás, Kary Mendoza tocaba puertas en Cartagena. No llevaba un catálogo. Llevaba tiempo, atención y la convicción de que detrás de cada joya hay una conversación pendiente.
            </p>
            <p style={{fontSize:16, color:"var(--bj-ink-mute)", lineHeight:1.7, fontStyle:"italic", maxWidth:540}}>
              Hoy seguimos haciendo lo mismo. Solo cambiaron las paredes: ahora la conversación ocurre en un atelier en el Centro Histórico, sigue siendo a puerta cerrada, sigue empezando con un café.
            </p>
            <div style={{display:"flex", gap:14, marginTop:36, flexWrap:"wrap"}}>
              <button onClick={()=>navigate("contacto")} className="btn-aqua btn-aqua-emerald" style={{padding:"16px 28px"}}>
                Agendar una visita
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </button>
              <button onClick={()=>navigate("catalogo")} className="btn-aqua" style={{padding:"16px 28px"}}>
                Ver colecciones
              </button>
            </div>
          </div>
          <div style={{position:"relative", aspectRatio:"4/5", borderRadius:40, overflow:"hidden"}} className="glass glass-iridescent">
            <div style={{position:"absolute", inset:0, background:"url(assets/earrings-travertino.png) center/cover"}}/>
            <div style={{position:"absolute", inset:0, background:"linear-gradient(180deg, transparent 40%, oklch(18% 0.05 155 / 0.7))"}}/>
            <div style={{position:"absolute", bottom:28, left:28, right:28, color:"#fff"}}>
              <div className="mono" style={{fontSize:10, letterSpacing:"0.3em", opacity:0.85, marginBottom:10}}>ATELIER · CARTAGENA DE INDIAS</div>
              <div style={{fontFamily:"var(--font-display)", fontSize:28, fontStyle:"italic", fontWeight:300, lineHeight:1.2}}>
                "Nuestra casa es tu casa."
              </div>
              <div className="mono" style={{fontSize:11, letterSpacing:"0.2em", opacity:0.75, marginTop:14}}>— KARY MENDOZA</div>
            </div>
          </div>
        </div>

        {/* MÉTRICAS / KPIs */}
        <div className="glass abt-stats" style={{padding:"24px 24px", borderRadius:36, marginBottom:44, display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:24}}>
          {[1].map(()=>null)}
          {[
            
              {n:"13", l:"años de oficio", s:"desde 2013"},
              {n:"+1.200", l:"piezas entregadas", s:"con libreta de origen"},
              {n:"40", l:"países alcanzados", s:"envíos asegurados"},
              {n:"100%", l:"trazabilidad", s:"gema · oro · orfebre"},
            ].map((k,i)=>(
              <div key={i} style={{textAlign:"center", padding:"0 8px", borderLeft: i>0?"1px solid oklch(100% 0 0 / 0.5)":"none"}}>
                <div className="display" style={{fontSize:"clamp(40px, 4.5vw, 64px)", fontWeight:300, color:"var(--bj-ink-emerald)", letterSpacing:"-0.03em", lineHeight:1, marginBottom:10}}>{k.n}</div>
                <div style={{fontSize:13, fontWeight:500, color:"var(--bj-ink-emerald)", marginBottom:4}}>{k.l}</div>
                <div className="mono" style={{fontSize:10, letterSpacing:"0.2em", color:"var(--bj-ink-mute)", textTransform:"uppercase"}}>{k.s}</div>
              </div>
            ))}
        </div>

        {/* MANIFIESTO — frase grande */}
        <div style={{textAlign:"center", padding:"28px 20px", marginBottom:44, position:"relative"}}>
          <div className="mono" style={{fontSize:11, letterSpacing:"0.3em", color:"var(--bj-gold-700)", marginBottom:22}}>MANIFIESTO</div>
          <h2 style={{fontSize:"clamp(32px, 4.5vw, 64px)", fontWeight:200, letterSpacing:"-0.02em", lineHeight:1.15, maxWidth:1100, margin:"0 auto"}}>
            Creemos que el lujo verdadero no se grita. <span className="italic emerald-text">Se susurra entre dos personas</span>, en una mesa con café, mientras una conversación lenta da forma a algo que un día — sin nosotros — seguirá siendo importante.
          </h2>
          <div style={{width:60, height:1, background:"var(--bj-gold-500)", margin:"40px auto"}}/>
          <div className="mono" style={{fontSize:11, letterSpacing:"0.3em", color:"var(--bj-ink-mute)"}}>BERSAGLIO JOYERÍA · CARTAGENA</div>
        </div>

        {/* VALORES — 6 cards */}
        <div style={{marginBottom:44}}>
          <div style={{textAlign:"center", marginBottom:24}}>
            <div className="mono" style={{fontSize:11, letterSpacing:"0.3em", color:"var(--bj-gold-700)", marginBottom:10}}>NUESTROS PRINCIPIOS</div>
            <h2 style={{fontSize:"clamp(36px, 4.5vw, 60px)", fontWeight:300, letterSpacing:"-0.025em"}}>Seis cosas en las que <span className="italic emerald-text">no negociamos</span></h2>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:18}} className="val-grid">
            {valores.map((v,i)=>(
              <div key={i} className="glass glass-iridescent" style={{padding:"28px 26px", borderRadius:32, position:"relative"}}>
                <div style={{display:"flex", alignItems:"baseline", gap:14, marginBottom:20}}>
                  <div className="mono" style={{fontSize:13, color:"var(--bj-gold-700)", fontWeight:600, letterSpacing:"0.1em"}}>{v.n}</div>
                  <div style={{flex:1, height:1, background:"linear-gradient(90deg, var(--bj-gold-500), transparent)"}}/>
                </div>
                <div style={{fontFamily:"var(--font-display)", fontSize:24, fontWeight:500, color:"var(--bj-ink-emerald)", marginBottom:14, letterSpacing:"-0.01em"}}>{v.t}</div>
                <p style={{fontSize:14, color:"var(--bj-ink-soft)", lineHeight:1.7}}>{v.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TIMELINE INTERACTIVO */}
        <div style={{marginBottom:44}}>
          <div style={{textAlign:"center", marginBottom:24}}>
            <div className="mono" style={{fontSize:11, letterSpacing:"0.3em", color:"var(--bj-gold-700)", marginBottom:10}}>RECORRIDO</div>
            <h2 style={{fontSize:"clamp(36px, 4.5vw, 60px)", fontWeight:300, letterSpacing:"-0.025em"}}>Trece años en <span className="italic emerald-text">cinco capítulos</span></h2>
          </div>
          <div className="glass" style={{padding:"28px 28px", borderRadius:40}}>
            {/* Tabs */}
            <div style={{display:"flex", gap:8, marginBottom:24, borderBottom:"1px solid oklch(100% 0 0 / 0.5)", paddingBottom:18, overflowX:"auto"}}>
              {chapters.map((c,i)=>(
                <button key={i} onClick={()=>setActiveChapter(i)} style={{
                  padding:"10px 18px", fontSize:12, fontWeight:500, borderRadius:999, whiteSpace:"nowrap",
                  color: activeChapter===i ? "#fff" : "var(--bj-ink-soft)",
                  background: activeChapter===i ? "linear-gradient(180deg, oklch(62% 0.18 155), oklch(42% 0.14 155))" : "oklch(100% 0 0 / 0.55)",
                  border:"1px solid oklch(100% 0 0 / 0.6)",
                  textShadow: activeChapter===i ? "0 1px 1px oklch(20% 0.05 155 / 0.4)" : "none",
                  transition:"all 0.3s",
                }}>
                  <span className="mono" style={{opacity:0.7, marginRight:8}}>{c.y}</span>{c.t}
                </button>
              ))}
            </div>
            {/* Active content */}
            <div style={{display:"grid", gridTemplateColumns:"180px 1fr", gap:40, alignItems:"start"}} className="tl-content">
              <div>
                <div className="display" style={{fontSize:"clamp(64px, 7vw, 96px)", fontWeight:200, color:"var(--bj-emerald-800)", letterSpacing:"-0.04em", lineHeight:0.9}}>{chapters[activeChapter].y}</div>
                <div style={{width:50, height:2, background:"var(--bj-gold-500)", marginTop:16}}/>
              </div>
              <div>
                <div style={{fontFamily:"var(--font-display)", fontSize:32, fontWeight:400, color:"var(--bj-ink-emerald)", marginBottom:20, letterSpacing:"-0.02em"}}>{chapters[activeChapter].t}</div>
                <p style={{fontSize:17, color:"var(--bj-ink-soft)", lineHeight:1.75, maxWidth:680}}>{chapters[activeChapter].d}</p>
              </div>
            </div>
          </div>
        </div>

        {/* EL ATELIER — split image+text */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:28, marginBottom:44, alignItems:"stretch"}} className="atl-split">
          <div className="glass glass-iridescent" style={{borderRadius:40, overflow:"hidden", aspectRatio:"4/5", position:"relative"}}>
            <div style={{position:"absolute", inset:0, background:"url(assets/ring-sapphire.jpg) center/cover"}}/>
            <div style={{position:"absolute", top:24, left:24}} className="chip glass-pill">El Atelier</div>
          </div>
          <div className="glass" style={{padding:"32px 32px", borderRadius:40, display:"flex", flexDirection:"column", justifyContent:"center"}}>
            <div className="mono" style={{fontSize:11, letterSpacing:"0.3em", color:"var(--bj-gold-700)", marginBottom:18}}>EL TALLER</div>
            <h3 style={{fontSize:42, fontWeight:300, letterSpacing:"-0.025em", lineHeight:1.05, marginBottom:24}}>
              Donde el oficio<br/><span className="italic emerald-text">toma forma</span>
            </h3>
            <p style={{fontSize:16, color:"var(--bj-ink-soft)", lineHeight:1.75, marginBottom:18}}>
              Doscientos metros cuadrados en el Centro Histórico de Cartagena. Mesas de orfebrería del siglo pasado, lupas binoculares calibradas, hornos de fundición, microscopios para engaste pavé. Todo lo que entra al atelier sale firmado a mano.
            </p>
            <p style={{fontSize:16, color:"var(--bj-ink-soft)", lineHeight:1.75, marginBottom:28}}>
              Tres orfebres en planta, una gemóloga GIA certificada, un dibujante técnico y Kary supervisando cada decisión. Sin más, sin menos.
            </p>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, paddingTop:24, borderTop:"1px solid oklch(100% 0 0 / 0.5)"}}>
              <div>
                <div className="mono" style={{fontSize:10, letterSpacing:"0.25em", color:"var(--bj-ink-mute)", marginBottom:6}}>UBICACIÓN</div>
                <div style={{fontSize:14, color:"var(--bj-ink-emerald)", fontWeight:500}}>Centro Histórico<br/>Cartagena de Indias</div>
              </div>
              <div>
                <div className="mono" style={{fontSize:10, letterSpacing:"0.25em", color:"var(--bj-ink-mute)", marginBottom:6}}>VISITAS</div>
                <div style={{fontSize:14, color:"var(--bj-ink-emerald)", fontWeight:500}}>Solo con cita<br/>Lun–Sáb · 10:00–19:00</div>
              </div>
            </div>
          </div>
        </div>

        {/* EQUIPO */}
        <div style={{marginBottom:44}}>
          <div style={{textAlign:"center", marginBottom:24}}>
            <div className="mono" style={{fontSize:11, letterSpacing:"0.3em", color:"var(--bj-gold-700)", marginBottom:10}}>LAS MANOS</div>
            <h2 style={{fontSize:"clamp(36px, 4.5vw, 60px)", fontWeight:300, letterSpacing:"-0.025em"}}>El equipo <span className="italic emerald-text">detrás del atelier</span></h2>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:18}} className="team-grid">
            {equipo.map((p,i)=>(
              <div key={i} className="glass glass-iridescent" style={{padding:24, borderRadius:32, textAlign:"left"}}>
                <div style={{
                  width:"100%", aspectRatio:"3/4", borderRadius:20, marginBottom:20,
                  background:`linear-gradient(145deg, oklch(${88-i*4}% 0.05 ${150+i*8}), oklch(${72-i*4}% 0.12 ${155+i*5}))`,
                  position:"relative", overflow:"hidden",
                  boxShadow:"inset 0 1px 0 oklch(100% 0 0 / 0.4)",
                }}>
                  <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", color:"oklch(100% 0 0 / 0.85)", fontFamily:"var(--font-display)", fontSize:64, fontWeight:200, fontStyle:"italic"}}>
                    {p.n.split(" ")[0][0]}{p.n.split(" ").slice(-1)[0][0]}
                  </div>
                </div>
                <div style={{fontFamily:"var(--font-display)", fontSize:20, fontWeight:500, color:"var(--bj-ink-emerald)", marginBottom:6, letterSpacing:"-0.01em"}}>{p.n}</div>
                <div className="mono" style={{fontSize:10, letterSpacing:"0.2em", color:"var(--bj-gold-700)", textTransform:"uppercase", marginBottom:14}}>{p.r}</div>
                <p style={{fontSize:13, color:"var(--bj-ink-soft)", lineHeight:1.65}}>{p.b}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CERTIFICACIONES */}
        <div className="glass glass-emerald" style={{padding:"28px 28px", borderRadius:40, marginBottom:44, color:"#fff"}}>
          <div style={{display:"grid", gridTemplateColumns:"1fr 2fr", gap:48, alignItems:"center"}} className="cert-grid">
            <div>
              <div className="mono" style={{fontSize:11, letterSpacing:"0.3em", opacity:0.75, marginBottom:18}}>RESPALDOS Y CERTIFICACIONES</div>
              <h3 style={{fontSize:38, fontWeight:300, letterSpacing:"-0.025em", lineHeight:1.1}}>Cada pieza viene con <span className="italic" style={{color:"oklch(85% 0.14 90)"}}>papel y palabra</span></h3>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:18}}>
              {[
                {t:"Jewelers of America", d:"Miembro acreditado desde 2020"},
                {t:"GIA", d:"Reportes gemológicos en cada diamante"},
                {t:"Muzo Origin", d:"Certificación de mina en cada esmeralda"},
                {t:"Responsible Jewellery Council", d:"Trazabilidad de oro y prácticas éticas"},
              ].map((c,i)=>(
                <div key={i} style={{padding:"20px 22px", borderRadius:20, background:"oklch(100% 0 0 / 0.12)", border:"1px solid oklch(100% 0 0 / 0.25)", backdropFilter:"blur(12px)"}}>
                  <div style={{fontFamily:"var(--font-display)", fontSize:18, fontWeight:500, marginBottom:6}}>{c.t}</div>
                  <div style={{fontSize:12, opacity:0.85, lineHeight:1.5}}>{c.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PRENSA */}
        <div style={{marginBottom:44}}>
          <div style={{textAlign:"center", marginBottom:22}}>
            <div className="mono" style={{fontSize:11, letterSpacing:"0.3em", color:"var(--bj-gold-700)", marginBottom:10}}>NOS HAN ESCRITO</div>
            <h2 style={{fontSize:"clamp(32px, 4vw, 52px)", fontWeight:300, letterSpacing:"-0.025em"}}>En la <span className="italic emerald-text">prensa</span></h2>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:14}} className="press-grid">
            {prensa.map((p,i)=>(
              <div key={i} className="glass" style={{padding:"20px 26px", borderRadius:24, display:"flex", alignItems:"center", gap:24}}>
                <div className="display" style={{fontSize:14, fontWeight:600, color:"var(--bj-gold-700)", letterSpacing:"0.05em", textTransform:"uppercase", minWidth:160}}>{p.m}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"var(--font-display)", fontSize:17, fontStyle:"italic", color:"var(--bj-ink-emerald)", lineHeight:1.4}}>{p.t}</div>
                </div>
                <div className="mono" style={{fontSize:12, color:"var(--bj-ink-mute)"}}>{p.y}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{marginBottom:40}}>
          <div style={{textAlign:"center", marginBottom:22}}>
            <div className="mono" style={{fontSize:11, letterSpacing:"0.3em", color:"var(--bj-gold-700)", marginBottom:10}}>PREGUNTAS FRECUENTES</div>
            <h2 style={{fontSize:"clamp(32px, 4vw, 52px)", fontWeight:300, letterSpacing:"-0.025em"}}>Lo que <span className="italic emerald-text">suelen preguntarnos</span></h2>
          </div>
          <div className="glass" style={{padding:"12px", borderRadius:32, maxWidth:880, margin:"0 auto"}}>
            {faqs.map((f,i)=>(
              <div key={i} style={{borderBottom: i<faqs.length-1 ? "1px solid oklch(100% 0 0 / 0.45)" : "none"}}>
                <button onClick={()=>setOpenFaq(openFaq===i?-1:i)} style={{width:"100%", padding:"18px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", textAlign:"left", gap:20}}>
                  <span style={{fontFamily:"var(--font-display)", fontSize:18, fontWeight:500, color:"var(--bj-ink-emerald)", letterSpacing:"-0.01em"}}>{f.q}</span>
                  <span style={{
                    width:32, height:32, borderRadius:"50%", flexShrink:0,
                    background: openFaq===i ? "linear-gradient(180deg, oklch(62% 0.18 155), oklch(42% 0.14 155))" : "oklch(100% 0 0 / 0.6)",
                    border:"1px solid oklch(100% 0 0 / 0.7)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all 0.3s",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={openFaq===i?"#fff":"var(--bj-emerald-800)"} strokeWidth="2.5" style={{transform:openFaq===i?"rotate(45deg)":"rotate(0)", transition:"transform 0.3s"}}><path d="M12 5v14M5 12h14"/></svg>
                  </span>
                </button>
                {openFaq===i && (
                  <div style={{padding:"0 24px 26px 24px", animation:"faqIn 0.4s ease"}}>
                    <p style={{fontSize:15, color:"var(--bj-ink-soft)", lineHeight:1.75, maxWidth:720}}>{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA FINAL */}
        <div className="glass glass-iridescent" style={{padding:"36px 36px", borderRadius:40, textAlign:"center", position:"relative", overflow:"hidden"}}>
          <div aria-hidden="true" style={{position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 0%, oklch(72% 0.18 155 / 0.18), transparent 60%)", pointerEvents:"none"}}/>
          <div style={{position:"relative"}}>
            <div className="mono" style={{fontSize:11, letterSpacing:"0.3em", color:"var(--bj-gold-700)", marginBottom:18}}>EMPEZAMOS POR UNA CONVERSACIÓN</div>
            <h3 style={{fontSize:"clamp(36px, 4.5vw, 56px)", fontWeight:300, letterSpacing:"-0.025em", lineHeight:1.1, marginBottom:20}}>
              Tu próxima joya<br/><span className="italic emerald-text">comienza con un café</span>
            </h3>
            <p style={{fontSize:16, color:"var(--bj-ink-soft)", maxWidth:520, margin:"0 auto 32px", lineHeight:1.7}}>
              Agenda una visita al atelier o escríbenos. Sin compromiso, sin guion, sin prisas. Solo una conversación.
            </p>
            <div style={{display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap"}}>
              <button onClick={()=>navigate("contacto")} className="btn-aqua btn-aqua-emerald" style={{padding:"16px 32px"}}>
                Hablemos
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>

      </div>
      <style>{`
        @keyframes faqIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:980px){
          .abt-hero,.atl-split,.cert-grid,.tl-content{grid-template-columns:1fr!important}
          .val-grid,.team-grid{grid-template-columns:repeat(2,1fr)!important}
          .press-grid{grid-template-columns:1fr!important}
        }
        @media(max-width:600px){
          .val-grid,.team-grid{grid-template-columns:1fr!important}
        }
      `}</style>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CONTACTO — multicanal, agendar visita, mapa, FAQ rápido
// ═══════════════════════════════════════════════════════════════════
function Contacto() {
  const [tab, setTab] = uS("mensaje"); // mensaje | visita | llamada
  const [form, setForm] = uS({n:"", e:"", tel:"", t:"asesoria", presup:"", m:""});
  const [visit, setVisit] = uS({n:"", e:"", tel:"", fecha:"", hora:"10:00", personas:"1", motivo:"asesoria", notas:""});
  const [call, setCall] = uS({n:"", tel:"", franja:"manana", urgencia:"normal"});
  const [sent, setSent] = uS(false);
  const set = (k,v)=>setForm(f=>({...f,[k]:v}));
  const setV = (k,v)=>setVisit(f=>({...f,[k]:v}));
  const setC = (k,v)=>setCall(f=>({...f,[k]:v}));

  // Min date: today + 2 days
  const minDate = (() => {
    const d = new Date(); d.setDate(d.getDate()+2);
    return d.toISOString().split("T")[0];
  })();

  const canales = [
    {k:"whatsapp", t:"WhatsApp", v:"+57 310 813 6829", d:"Respuesta inmediata · 09:00–20:00", icon:(<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.7-1.4-1.7-1.6-1.9-.2-.3 0-.4.1-.5.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5 0-.2 0-.4-.1-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.5c-.2 0-.5.1-.7.4-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1 2.7.1.2 1.8 2.7 4.3 3.8.6.3 1.1.4 1.4.5.6.2 1.1.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.2-.3-.2-.5-.3zM12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3.1-.2-.3C4.4 14.9 4 13.5 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8z"/></svg>)},
    {k:"telefono", t:"Teléfono atelier", v:"+57 (5) 660 1234", d:"Lun–Sáb · 10:00–19:00", icon:(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>)},
    {k:"email", t:"Correo", v:"hola@bersagliojewelry.com", d:"Respondemos en < 24h", icon:(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>)},
    {k:"instagram", t:"Instagram", v:"@bersagliojewelry", d:"Mensaje directo", icon:(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>)},
  ];

  const horas = ["10:00","11:00","12:00","14:00","15:00","16:00","17:00","18:00"];

  const faqsRapido = [
    {q:"¿Necesito cita previa?", a:"Sí, recibimos solo con cita para garantizar una atención dedicada."},
    {q:"¿Hay parqueadero?", a:"Tenemos convenio con parqueadero a 80m del atelier. Validamos tu tiquete."},
    {q:"¿Puedo llevar acompañantes?", a:"Hasta tres personas. Indícalo al agendar para preparar el espacio."},
    {q:"¿Atienden en otro idioma?", a:"Español, inglés y francés. Italiano con cita previa."},
  ];

  const motivos = [
    {k:"asesoria", t:"Asesoría general", d:"Quiero conocer las colecciones"},
    {k:"pieza", t:"Pieza a medida", d:"Tengo una idea o una historia"},
    {k:"compromiso", t:"Anillo de compromiso", d:"Asesoría privada y discreta"},
    {k:"herencia", t:"Pieza heredada", d:"Restauración o reinterpretación"},
    {k:"prensa", t:"Prensa & medios", d:"Editoriales y entrevistas"},
    {k:"otro", t:"Otro motivo", d:"Cuéntame en el mensaje"},
  ];

  return (
    <main style={{paddingTop:116, paddingBottom:40}}>
      <div className="container">

        {/* HERO */}
        <div style={{textAlign:"center", marginBottom:24, maxWidth:780, margin:"0 auto 36px"}}>
          <div className="mono" style={{fontSize:11, letterSpacing:"0.3em", color:"var(--bj-gold-700)", marginBottom:14}}>HABLEMOS</div>
          <h1 style={{fontSize:"clamp(56px, 7vw, 110px)", fontWeight:200, letterSpacing:"-0.04em", lineHeight:0.94, marginBottom:22}}>
            Una conversación,<br/><span className="italic emerald-text" style={{fontWeight:300}}>un café,</span> una pieza.
          </h1>
          <p style={{fontSize:18, color:"var(--bj-ink-soft)", lineHeight:1.7, maxWidth:600, margin:"0 auto"}}>
            Elige cómo prefieres que iniciemos. Tres canales, cero formularios fríos: cada mensaje lo lee Kary y su equipo en persona.
          </p>
        </div>

        {/* CANALES DIRECTOS — quick contact tiles */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14, marginBottom:24}} className="canales-grid">
          {canales.map((c,i)=>(
            <a key={c.k} href={c.k==="whatsapp"?"https://wa.me/573108136829":c.k==="email"?"mailto:hola@bersagliojewelry.com":c.k==="telefono"?"tel:+5756601234":"https://instagram.com/bersagliojewelry"} target="_blank" rel="noopener" className="glass glass-iridescent canal-card" style={{padding:"20px 20px", borderRadius:28, textDecoration:"none", color:"inherit", display:"flex", flexDirection:"column", gap:12, transition:"transform 0.3s, box-shadow 0.3s"}}>
              <div style={{
                width:48, height:48, borderRadius:14,
                background: c.k==="whatsapp" ? "linear-gradient(145deg, oklch(72% 0.16 155), oklch(48% 0.18 150))"
                          : c.k==="instagram" ? "linear-gradient(145deg, oklch(75% 0.18 30), oklch(55% 0.22 340))"
                          : "linear-gradient(145deg, oklch(85% 0.14 88), oklch(65% 0.16 80))",
                color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"inset 0 1px 0 oklch(100% 0 0 / 0.5), 0 6px 20px -6px oklch(40% 0.1 200 / 0.3)",
              }}>{c.icon}</div>
              <div>
                <div style={{fontFamily:"var(--font-display)", fontSize:18, fontWeight:500, color:"var(--bj-ink-emerald)", marginBottom:4}}>{c.t}</div>
                <div className="mono" style={{fontSize:12, color:"var(--bj-emerald-800)", fontWeight:600, marginBottom:6, letterSpacing:"0.02em"}}>{c.v}</div>
                <div style={{fontSize:11, color:"var(--bj-ink-mute)", letterSpacing:"0.05em"}}>{c.d}</div>
              </div>
            </a>
          ))}
        </div>

        {/* TABS — modo de contacto */}
        <div style={{display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:22, marginBottom:40}} className="contact-grid">
          {/* Left: Form */}
          <div className="glass glass-iridescent" style={{padding:26, borderRadius:32}}>
            {/* Tab bar */}
            <div style={{display:"flex", gap:6, padding:6, background:"oklch(100% 0 0 / 0.55)", borderRadius:999, marginBottom:22, border:"1px solid oklch(100% 0 0 / 0.6)"}}>
              {[
                {k:"mensaje", t:"Enviar mensaje", icon:"✉"},
                {k:"visita", t:"Agendar visita", icon:"☕"},
                {k:"llamada", t:"Pedir llamada", icon:"☎"},
              ].map(opt => (
                <button key={opt.k} onClick={()=>{setTab(opt.k); setSent(false);}} style={{
                  flex:1, padding:"12px 14px", fontSize:13, fontWeight:500, borderRadius:999,
                  color: tab===opt.k?"#fff":"var(--bj-ink-soft)",
                  background: tab===opt.k?"linear-gradient(180deg, oklch(62% 0.18 155), oklch(42% 0.14 155))":"transparent",
                  textShadow: tab===opt.k?"0 1px 1px oklch(20% 0.05 155 / 0.4)":"none",
                  boxShadow: tab===opt.k?"0 1px 0 oklch(100% 0 0 / 0.4) inset, 0 6px 16px -6px oklch(40% 0.14 155 / 0.5)":"none",
                  transition:"all 0.3s",
                }}>{opt.t}</button>
              ))}
            </div>

            {sent ? (
              <div style={{textAlign:"center", padding:"40px 0"}}>
                <div style={{width:88, height:88, margin:"0 auto 28px", borderRadius:"50%", background:"linear-gradient(145deg, oklch(72% 0.18 155), oklch(38% 0.13 155))", boxShadow:"inset 0 2px 0 oklch(100% 0 0 / 0.7), 0 0 50px oklch(65% 0.18 155 / 0.45)", display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <h3 style={{fontSize:32, fontWeight:300, marginBottom:12, fontFamily:"var(--font-display)", letterSpacing:"-0.02em"}}>
                  Recibido, <span className="italic emerald-text">{(tab==="mensaje"?form.n:tab==="visita"?visit.n:call.n) || "amigo"}</span>
                </h3>
                <p style={{color:"var(--bj-ink-soft)", fontSize:15, maxWidth:380, margin:"0 auto", lineHeight:1.65}}>
                  {tab==="visita" ? `Confirmaremos tu cita por WhatsApp para el ${visit.fecha || "día acordado"} a las ${visit.hora}. Llega cinco minutos antes; el café estará listo.` : tab==="llamada" ? "Te llamaremos en la franja que indicaste. Si no respondes, lo intentaremos una segunda vez." : "Kary o alguien del equipo te responderá en menos de 24 horas. Mientras tanto, puedes seguirnos en Instagram para ver lo que sale del atelier esta semana."}
                </p>
                <button onClick={()=>setSent(false)} className="btn-aqua" style={{padding:"12px 22px", marginTop:28, fontSize:13}}>
                  Enviar otro
                </button>
              </div>
            ) : tab==="mensaje" ? (
              <form onSubmit={e=>{e.preventDefault();setSent(true);}} style={{display:"flex", flexDirection:"column", gap:22}}>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
                  <Field label="Nombre completo" value={form.n} onChange={v=>set("n",v)} required/>
                  <Field label="Email" value={form.e} onChange={v=>set("e",v)} type="email" required/>
                </div>
                <Field label="Teléfono / WhatsApp (opcional)" value={form.tel} onChange={v=>set("tel",v)} type="tel"/>

                <div>
                  <div className="eyebrow" style={{marginBottom:12}}>¿Sobre qué quieres hablar?</div>
                  <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:10}} className="motivo-grid">
                    {motivos.map(mt => (
                      <button key={mt.k} type="button" onClick={()=>set("t",mt.k)} style={{
                        padding:"14px 16px", borderRadius:18, textAlign:"left",
                        background: form.t===mt.k ? "linear-gradient(145deg, oklch(96% 0.04 155), oklch(90% 0.06 155))" : "oklch(100% 0 0 / 0.55)",
                        border: form.t===mt.k ? "1.5px solid var(--bj-emerald-700)" : "1px solid oklch(100% 0 0 / 0.65)",
                        boxShadow: form.t===mt.k ? "inset 0 1px 0 oklch(100% 0 0 / 0.7), 0 6px 18px -8px oklch(50% 0.16 155 / 0.4)" : "inset 0 1px 0 oklch(100% 0 0 / 0.5)",
                        cursor:"pointer", transition:"all 0.25s",
                      }}>
                        <div style={{fontSize:13, fontWeight:600, color:"var(--bj-ink-emerald)", marginBottom:3}}>{mt.t}</div>
                        <div style={{fontSize:11, color:"var(--bj-ink-mute)", lineHeight:1.4}}>{mt.d}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="eyebrow" style={{marginBottom:10}}>Rango de presupuesto (opcional)</div>
                  <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
                    {["Definiendo","< $5M","$5M–$15M","$15M–$50M","> $50M"].map(p => (
                      <button key={p} type="button" onClick={()=>set("presup",p)} style={{
                        padding:"8px 14px", fontSize:11, fontWeight:500, borderRadius:999, letterSpacing:"0.02em",
                        color: form.presup===p?"#fff":"var(--bj-ink-soft)",
                        background: form.presup===p?"linear-gradient(180deg, oklch(60% 0.16 80), oklch(45% 0.13 75))":"oklch(100% 0 0 / 0.55)",
                        border:"1px solid oklch(100% 0 0 / 0.6)",
                      }}>{p}</button>
                    ))}
                  </div>
                </div>

                <Field label="Cuéntanos en pocas palabras" value={form.m} onChange={v=>set("m",v)} area placeholder="¿Para quién es la pieza? ¿Hay una fecha importante? ¿Tienes una piedra o boceto?"/>

                <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14, paddingTop:8}}>
                  <div style={{display:"flex", alignItems:"center", gap:8, fontSize:12, color:"var(--bj-ink-mute)"}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Tus datos se tratan con discreción absoluta.
                  </div>
                  <button type="submit" className="btn-aqua btn-aqua-emerald" style={{padding:"16px 28px", fontSize:14}}>
                    Enviar mensaje
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </form>
            ) : tab==="visita" ? (
              <form onSubmit={e=>{e.preventDefault();setSent(true);}} style={{display:"flex", flexDirection:"column", gap:22}}>
                <div style={{padding:"16px 20px", borderRadius:18, background:"linear-gradient(145deg, oklch(96% 0.06 155 / 0.6), oklch(92% 0.08 155 / 0.4))", border:"1px solid oklch(100% 0 0 / 0.6)", display:"flex", gap:14, alignItems:"center"}}>
                  <div style={{fontSize:32}}>☕</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"var(--font-display)", fontSize:16, fontWeight:500, color:"var(--bj-ink-emerald)", marginBottom:2}}>Visita privada al atelier</div>
                    <div style={{fontSize:12, color:"var(--bj-ink-soft)", lineHeight:1.5}}>Centro Histórico, Cartagena · 60–90 minutos · Sin compromiso de compra</div>
                  </div>
                </div>

                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
                  <Field label="Nombre completo" value={visit.n} onChange={v=>setV("n",v)} required/>
                  <Field label="Email" value={visit.e} onChange={v=>setV("e",v)} type="email" required/>
                </div>
                <Field label="Teléfono / WhatsApp" value={visit.tel} onChange={v=>setV("tel",v)} type="tel" required/>

                <div style={{display:"grid", gridTemplateColumns:"1.2fr 1fr 1fr", gap:14}} className="visit-row">
                  <label style={{display:"flex", flexDirection:"column", gap:8}}>
                    <span className="eyebrow">Fecha preferida</span>
                    <input type="date" min={minDate} value={visit.fecha} onChange={e=>setV("fecha",e.target.value)} style={fieldStyle} required/>
                  </label>
                  <label style={{display:"flex", flexDirection:"column", gap:8}}>
                    <span className="eyebrow">Hora</span>
                    <select value={visit.hora} onChange={e=>setV("hora",e.target.value)} style={{...fieldStyle, appearance:"none"}}>
                      {horas.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </label>
                  <label style={{display:"flex", flexDirection:"column", gap:8}}>
                    <span className="eyebrow">Personas</span>
                    <select value={visit.personas} onChange={e=>setV("personas",e.target.value)} style={{...fieldStyle, appearance:"none"}}>
                      {["1","2","3","4"].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </label>
                </div>

                <div>
                  <div className="eyebrow" style={{marginBottom:10}}>Motivo de la visita</div>
                  <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                    {[["asesoria","Asesoría general"],["pieza","Pieza a medida"],["compromiso","Anillo de compromiso"],["evento","Evento especial"],["otro","Otro"]].map(([k,l])=>(
                      <button key={k} type="button" onClick={()=>setV("motivo",k)} style={{
                        padding:"10px 16px", fontSize:12, fontWeight:500, borderRadius:999,
                        color: visit.motivo===k?"#fff":"var(--bj-ink-soft)",
                        background: visit.motivo===k?"linear-gradient(180deg, oklch(62% 0.18 155), oklch(42% 0.14 155))":"oklch(100% 0 0 / 0.55)",
                        border:"1px solid oklch(100% 0 0 / 0.6)",
                        textShadow: visit.motivo===k?"0 1px 1px oklch(20% 0.05 155 / 0.4)":"none",
                      }}>{l}</button>
                    ))}
                  </div>
                </div>

                <Field label="Notas (alergias, idioma preferido, accesibilidad...)" value={visit.notas} onChange={v=>setV("notas",v)} area placeholder="Cualquier detalle que nos ayude a recibirte mejor."/>

                <button type="submit" className="btn-aqua btn-aqua-emerald" style={{padding:"16px 28px", fontSize:14, alignSelf:"flex-start"}}>
                  Reservar mi visita
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </button>
              </form>
            ) : (
              <form onSubmit={e=>{e.preventDefault();setSent(true);}} style={{display:"flex", flexDirection:"column", gap:22}}>
                <div style={{padding:"16px 20px", borderRadius:18, background:"linear-gradient(145deg, oklch(94% 0.08 88 / 0.6), oklch(88% 0.1 80 / 0.4))", border:"1px solid oklch(100% 0 0 / 0.6)", display:"flex", gap:14, alignItems:"center"}}>
                  <div style={{fontSize:32}}>☎</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"var(--font-display)", fontSize:16, fontWeight:500, color:"var(--bj-ink-emerald)", marginBottom:2}}>Te llamamos cuando puedas</div>
                    <div style={{fontSize:12, color:"var(--bj-ink-soft)", lineHeight:1.5}}>Indícanos la franja y te contactamos en menos de 4 horas hábiles.</div>
                  </div>
                </div>

                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
                  <Field label="Nombre" value={call.n} onChange={v=>setC("n",v)} required/>
                  <Field label="Teléfono" value={call.tel} onChange={v=>setC("tel",v)} type="tel" required/>
                </div>

                <div>
                  <div className="eyebrow" style={{marginBottom:10}}>Mejor franja horaria</div>
                  <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10}}>
                    {[
                      {k:"manana", t:"Mañana", h:"09:00–12:00"},
                      {k:"tarde", t:"Tarde", h:"14:00–17:00"},
                      {k:"noche", t:"Final de tarde", h:"17:00–19:00"},
                    ].map(f => (
                      <button key={f.k} type="button" onClick={()=>setC("franja",f.k)} style={{
                        padding:"16px 14px", borderRadius:18, textAlign:"center",
                        background: call.franja===f.k ? "linear-gradient(145deg, oklch(96% 0.04 155), oklch(90% 0.06 155))" : "oklch(100% 0 0 / 0.55)",
                        border: call.franja===f.k ? "1.5px solid var(--bj-emerald-700)" : "1px solid oklch(100% 0 0 / 0.65)",
                        boxShadow: call.franja===f.k ? "inset 0 1px 0 oklch(100% 0 0 / 0.7), 0 6px 18px -8px oklch(50% 0.16 155 / 0.4)" : "inset 0 1px 0 oklch(100% 0 0 / 0.5)",
                        cursor:"pointer", transition:"all 0.25s",
                      }}>
                        <div style={{fontFamily:"var(--font-display)", fontSize:15, fontWeight:500, color:"var(--bj-ink-emerald)", marginBottom:4}}>{f.t}</div>
                        <div className="mono" style={{fontSize:11, color:"var(--bj-ink-mute)", letterSpacing:"0.05em"}}>{f.h}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="eyebrow" style={{marginBottom:10}}>Urgencia</div>
                  <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                    {[["normal","Sin prisa"],["semana","Esta semana"],["urgente","Hoy mismo"]].map(([k,l]) => (
                      <button key={k} type="button" onClick={()=>setC("urgencia",k)} style={{
                        padding:"10px 18px", fontSize:12, fontWeight:500, borderRadius:999,
                        color: call.urgencia===k?"#fff":"var(--bj-ink-soft)",
                        background: call.urgencia===k?"linear-gradient(180deg, oklch(62% 0.18 155), oklch(42% 0.14 155))":"oklch(100% 0 0 / 0.55)",
                        border:"1px solid oklch(100% 0 0 / 0.6)",
                        textShadow: call.urgencia===k?"0 1px 1px oklch(20% 0.05 155 / 0.4)":"none",
                      }}>{l}</button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-aqua btn-aqua-emerald" style={{padding:"16px 28px", fontSize:14, alignSelf:"flex-start"}}>
                  Pedir llamada
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </button>
              </form>
            )}
          </div>

          {/* RIGHT: Sidebar info */}
          <div style={{display:"flex", flexDirection:"column", gap:16}}>
            {/* Atelier card with map illustration */}
            <div className="glass glass-emerald" style={{padding:0, borderRadius:32, overflow:"hidden", color:"#fff"}}>
              {/* Mapa estilizado */}
              <div style={{height:200, position:"relative", background:"linear-gradient(145deg, oklch(35% 0.1 155), oklch(22% 0.06 155))", overflow:"hidden"}}>
                <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" style={{position:"absolute", inset:0, opacity:0.45}}>
                  {/* Streets grid Cartagena style */}
                  <g stroke="oklch(85% 0.14 90)" strokeWidth="0.5" fill="none" opacity="0.6">
                    <path d="M0 60 Q100 50 200 65 T400 70"/>
                    <path d="M0 100 Q120 95 240 105 T400 110"/>
                    <path d="M0 140 L400 145"/>
                    <path d="M80 0 L75 200"/>
                    <path d="M180 0 L175 200"/>
                    <path d="M280 0 L290 200"/>
                  </g>
                  <g stroke="oklch(85% 0.14 90)" strokeWidth="0.3" fill="none" opacity="0.4">
                    <rect x="90" y="70" width="40" height="30"/>
                    <rect x="200" y="80" width="50" height="35"/>
                    <rect x="290" y="100" width="40" height="40"/>
                    <rect x="120" y="130" width="60" height="30"/>
                  </g>
                </svg>
                {/* Pin */}
                <div style={{position:"absolute", left:"52%", top:"50%", transform:"translate(-50%, -100%)"}}>
                  <div style={{width:40, height:40, borderRadius:"50% 50% 50% 0", transform:"rotate(-45deg)", background:"linear-gradient(145deg, oklch(85% 0.14 90), oklch(60% 0.16 80))", boxShadow:"0 8px 24px oklch(20% 0 0 / 0.5)", display:"flex", alignItems:"center", justifyContent:"center"}}>
                    <div style={{width:14, height:14, borderRadius:"50%", background:"oklch(28% 0.06 155)", transform:"rotate(45deg)"}}/>
                  </div>
                  <div style={{position:"absolute", left:"50%", top:"100%", transform:"translateX(-50%)", marginTop:6, padding:"4px 10px", background:"oklch(100% 0 0 / 0.95)", borderRadius:999, fontSize:9, fontWeight:600, letterSpacing:"0.1em", color:"oklch(28% 0.06 155)", whiteSpace:"nowrap", textTransform:"uppercase"}}>Atelier</div>
                </div>
                <div style={{position:"absolute", top:14, right:14, padding:"5px 10px", borderRadius:999, background:"oklch(100% 0 0 / 0.18)", border:"1px solid oklch(100% 0 0 / 0.3)", backdropFilter:"blur(10px)", fontSize:9, fontWeight:600, letterSpacing:"0.15em"}}>CENTRO HISTÓRICO</div>
              </div>
              <div style={{padding:28}}>
                <div className="mono" style={{fontSize:11, letterSpacing:"0.3em", opacity:0.75, marginBottom:10}}>CASA BERSAGLIO</div>
                <div style={{fontFamily:"var(--font-display)", fontSize:24, fontWeight:400, marginBottom:10, letterSpacing:"-0.01em"}}>Cartagena de Indias</div>
                <p style={{fontSize:13, opacity:0.92, lineHeight:1.7, marginBottom:18}}>Calle 36 # 6-32<br/>San Agustín Chiquita · Centro Histórico<br/>Bolívar, Colombia</p>
                <a href="https://maps.google.com/?q=Cartagena+Centro+Hist%C3%B3rico" target="_blank" rel="noopener" style={{
                  display:"inline-flex", alignItems:"center", gap:8, padding:"10px 16px", borderRadius:999,
                  background:"oklch(100% 0 0 / 0.15)", border:"1px solid oklch(100% 0 0 / 0.3)",
                  fontSize:12, color:"#fff", textDecoration:"none", letterSpacing:"0.05em",
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Abrir en mapas
                </a>
              </div>
            </div>

            {/* Horarios */}
            <div className="glass" style={{padding:28, borderRadius:28}}>
              <div className="mono" style={{fontSize:10, letterSpacing:"0.3em", color:"var(--bj-gold-700)", marginBottom:14}}>HORARIOS DE ATENCIÓN</div>
              <div style={{display:"flex", flexDirection:"column", gap:8, fontSize:13}}>
                {[
                  {d:"Lunes", h:"10:00 – 19:00", abierto:true},
                  {d:"Martes", h:"10:00 – 19:00", abierto:true},
                  {d:"Miércoles", h:"10:00 – 19:00", abierto:true},
                  {d:"Jueves", h:"10:00 – 19:00", abierto:true},
                  {d:"Viernes", h:"10:00 – 20:00", abierto:true},
                  {d:"Sábado", h:"10:00 – 18:00", abierto:true},
                  {d:"Domingo", h:"Solo con cita previa", abierto:false},
                ].map((h,i)=>(
                  <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:i<6?"1px dashed oklch(60% 0.04 155 / 0.25)":"none"}}>
                    <span style={{color:h.abierto?"var(--bj-ink-emerald)":"var(--bj-ink-mute)", fontWeight:500}}>{h.d}</span>
                    <span className="mono" style={{fontSize:12, color:h.abierto?"var(--bj-emerald-800)":"var(--bj-ink-mute)"}}>{h.h}</span>
                  </div>
                ))}
              </div>
              <div style={{marginTop:16, padding:"10px 14px", borderRadius:14, background:"linear-gradient(145deg, oklch(94% 0.1 155 / 0.5), oklch(88% 0.12 155 / 0.3))", display:"flex", alignItems:"center", gap:10}}>
                <div style={{width:8, height:8, borderRadius:"50%", background:"oklch(60% 0.18 150)", boxShadow:"0 0 12px oklch(60% 0.18 150 / 0.7)", animation:"pulseDot 2s ease infinite"}}/>
                <div style={{fontSize:11, color:"var(--bj-emerald-800)", fontWeight:600, letterSpacing:"0.05em"}}>Abierto ahora · Cierra a las 19:00</div>
              </div>
            </div>

            {/* Respuesta garantizada */}
            <div className="glass" style={{padding:24, borderRadius:24, background:"linear-gradient(145deg, oklch(93% 0.12 88 / 0.55), oklch(80% 0.14 82 / 0.3))", textAlign:"center"}}>
              <div className="mono" style={{fontSize:10, letterSpacing:"0.3em", color:"oklch(45% 0.12 80)", marginBottom:8}}>RESPUESTA GARANTIZADA</div>
              <div style={{fontFamily:"var(--font-display)", fontSize:48, fontWeight:300, color:"oklch(35% 0.08 80)", lineHeight:1, letterSpacing:"-0.03em"}}>&lt; 24h</div>
              <div style={{fontSize:11, color:"oklch(40% 0.08 80)", marginTop:8, fontStyle:"italic"}}>en días hábiles</div>
            </div>
          </div>
        </div>

        {/* QUÉ ESPERAR — proceso */}
        <div className="glass" style={{padding:"28px 28px", borderRadius:40, marginBottom:40}}>
          <div style={{textAlign:"center", marginBottom:22}}>
            <div className="mono" style={{fontSize:11, letterSpacing:"0.3em", color:"var(--bj-gold-700)", marginBottom:10}}>QUÉ ESPERAR DE NOSOTROS</div>
            <h2 style={{fontSize:"clamp(28px, 3.4vw, 44px)", fontWeight:300, letterSpacing:"-0.02em"}}>Después de que <span className="italic emerald-text">nos escribes</span></h2>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:22}} className="proc-grid">
            {[
              {n:"01", t:"Lectura personal", d:"Tu mensaje lo lee Kary o alguien de su equipo. Sin chatbots, sin filtros automáticos.", tiempo:"En el día"},
              {n:"02", t:"Primera respuesta", d:"Te contactamos con preguntas de contexto: ocasión, tiempos, presupuesto.", tiempo:"< 24 horas"},
              {n:"03", t:"Conversación", d:"Llamada, WhatsApp o visita al atelier. Lo que prefieras, sin presión de venta.", tiempo:"A tu ritmo"},
              {n:"04", t:"Boceto y propuesta", d:"Si decides avanzar, recibirás boceto a mano, render 3D y plan de pago.", tiempo:"3–5 días"},
            ].map((p,i)=>(
              <div key={i} style={{position:"relative"}}>
                {i<3 && <div aria-hidden="true" style={{position:"absolute", left:"calc(100% - 12px)", top:18, width:"calc(100% + 22px)", height:1, background:"linear-gradient(90deg, var(--bj-gold-500) 0%, transparent 100%)", display:"none"}} className="proc-line"/>}
                <div className="display" style={{fontSize:14, color:"var(--bj-gold-700)", fontWeight:600, letterSpacing:"0.1em", marginBottom:14}}>{p.n}</div>
                <div style={{fontFamily:"var(--font-display)", fontSize:20, fontWeight:500, color:"var(--bj-ink-emerald)", marginBottom:10, letterSpacing:"-0.01em"}}>{p.t}</div>
                <p style={{fontSize:13, color:"var(--bj-ink-soft)", lineHeight:1.65, marginBottom:14}}>{p.d}</p>
                <div className="mono" style={{fontSize:10, letterSpacing:"0.2em", color:"var(--bj-emerald-800)", textTransform:"uppercase", fontWeight:600, padding:"5px 10px", borderRadius:999, background:"oklch(94% 0.04 155 / 0.5)", display:"inline-block"}}>{p.tiempo}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ rápido visita */}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:28, marginBottom:40, alignItems:"start"}} className="contact-grid">
          <div>
            <div className="mono" style={{fontSize:11, letterSpacing:"0.3em", color:"var(--bj-gold-700)", marginBottom:10}}>ANTES DE TU VISITA</div>
            <h3 style={{fontSize:"clamp(28px, 3.5vw, 42px)", fontWeight:300, letterSpacing:"-0.025em", lineHeight:1.05, marginBottom:18}}>
              Lo que necesitas <span className="italic emerald-text">saber</span>
            </h3>
            <p style={{fontSize:15, color:"var(--bj-ink-soft)", lineHeight:1.7, marginBottom:24}}>
              Cuatro respuestas rápidas para que llegues con todo claro. Si te queda alguna duda, escríbenos por WhatsApp.
            </p>
            <a href="https://wa.me/573108136829" target="_blank" rel="noopener" className="btn-aqua" style={{padding:"14px 22px", fontSize:13, display:"inline-flex"}}>
              Preguntar por WhatsApp
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a>
          </div>
          <div className="glass" style={{padding:"8px", borderRadius:28}}>
            {faqsRapido.map((f,i)=>(
              <div key={i} style={{padding:"22px 24px", borderBottom: i<faqsRapido.length-1 ? "1px solid oklch(100% 0 0 / 0.45)" : "none"}}>
                <div style={{fontFamily:"var(--font-display)", fontSize:16, fontWeight:600, color:"var(--bj-ink-emerald)", marginBottom:8}}>{f.q}</div>
                <p style={{fontSize:14, color:"var(--bj-ink-soft)", lineHeight:1.6}}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
      <style>{`
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(1.2)}}
        .canal-card:hover{transform:translateY(-3px);box-shadow:0 18px 40px -12px oklch(50% 0.1 200 / 0.3)!important}
        @media(max-width:980px){
          .canales-grid{grid-template-columns:repeat(2,1fr)!important}
          .contact-grid{grid-template-columns:1fr!important}
          .proc-grid{grid-template-columns:repeat(2,1fr)!important}
          .visit-row{grid-template-columns:1fr!important}
        }
        @media(max-width:600px){
          .canales-grid,.proc-grid,.motivo-grid{grid-template-columns:1fr!important}
        }
      `}</style>
    </main>
  );
}

function Field({ label, value, onChange, type="text", area, placeholder, required }) {
  return (
    <label style={{display:"flex", flexDirection:"column", gap:8}}>
      <span className="eyebrow">{label}{required && <span style={{color:"var(--bj-gold-700)", marginLeft:4}}>*</span>}</span>
      {area ? (
        <textarea value={value} onChange={e=>onChange(e.target.value)} rows={5} placeholder={placeholder} required={required} style={fieldStyle}/>
      ) : (
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required} style={fieldStyle}/>
      )}
    </label>
  );
}
const fieldStyle = {
  padding:"14px 18px",
  background:"oklch(100% 0 0 / 0.55)",
  border:"1px solid oklch(100% 0 0 / 0.6)",
  borderRadius:16,
  fontSize:14, fontFamily:"inherit", color:"var(--bj-ink-emerald)",
  outline:"none", resize:"vertical",
  boxShadow:"inset 0 1px 2px oklch(30% 0.08 155 / 0.05)",
};

// ═══════════════════════════════════════════════════════════════════
// CHECKOUT
// ═══════════════════════════════════════════════════════════════════
function Checkout() {
  const { items, subtotal, updateQty, remove } = useCart();
  const { navigate } = useRouter();
  const [step, setStep] = uS(1);
  const fmt = (n) => "$ " + n.toLocaleString("es-CO");
  const steps = ["Carrito", "Envío", "Pago"];

  return (
    <main style={{paddingTop:116, paddingBottom:40}}>
      <div className="container">
        <div style={{textAlign:"center", marginBottom:18}}>
          <div className="eyebrow" style={{marginBottom:10}}>Checkout</div>
          <h1 style={{fontSize:"clamp(40px, 5vw, 72px)", fontWeight:300, letterSpacing:"-0.03em"}}>Finalizar <span className="italic emerald-text">compra</span></h1>
        </div>

        {/* Stepper */}
        <div className="glass" style={{padding:8, borderRadius:999, display:"flex", gap:4, maxWidth:460, margin:"0 auto 24px"}}>
          {steps.map((s,i)=>(
            <button key={s} onClick={()=>setStep(i+1)} style={{
              flex:1, padding:"12px", fontSize:12, fontWeight:500, borderRadius:999,
              color: step===i+1?"#fff":"var(--bj-ink-soft)",
              background: step===i+1?"linear-gradient(180deg, oklch(62% 0.18 155), oklch(42% 0.14 155))":"transparent",
              boxShadow: step===i+1?"0 1px 0 oklch(100% 0 0 / 0.5) inset":"none",
              textShadow: step===i+1?"0 1px 1px oklch(20% 0.05 155 / 0.4)":"none",
            }}><span className="mono" style={{opacity:0.7, marginRight:6}}>0{i+1}</span>{s}</button>
          ))}
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:20}} className="ck-grid">
          <div className="glass" style={{padding:28, borderRadius:28}}>
            {step===1 && (
              <div>
                <h3 style={{fontSize:24, marginBottom:20}}>Tus piezas</h3>
                {items.length===0 ? <p style={{color:"var(--bj-ink-mute)"}}>Carrito vacío</p> : items.map(i=>(
                  <div key={i.id} style={{display:"flex", gap:16, padding:"16px 0", borderBottom:"1px solid oklch(100% 0 0 / 0.4)"}}>
                    <div style={{width:80, height:80, borderRadius:14, background:`url(${i.img}) center/cover`, flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"var(--font-display)", fontSize:17, fontWeight:500}}>{i.name}</div>
                      <div className="mono" style={{fontSize:13, color:"var(--bj-emerald-800)", marginTop:4}}>{fmt(i.price)}</div>
                      <div style={{display:"flex", gap:10, marginTop:10, alignItems:"center"}}>
                        <div style={{display:"flex", alignItems:"center", gap:8, background:"oklch(100% 0 0 / 0.6)", padding:"4px 10px", borderRadius:999, border:"1px solid oklch(100% 0 0 / 0.6)"}}>
                          <button onClick={()=>updateQty(i.id, i.qty-1)}>−</button>
                          <span className="mono" style={{minWidth:20, textAlign:"center"}}>{i.qty}</span>
                          <button onClick={()=>updateQty(i.id, i.qty+1)}>+</button>
                        </div>
                        <button onClick={()=>remove(i.id)} style={{fontSize:12, color:"var(--bj-ink-mute)", textDecoration:"underline"}}>Quitar</button>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={()=>setStep(2)} className="btn-aqua btn-aqua-emerald" style={{marginTop:24, padding:"16px 28px"}}>Continuar al envío</button>
              </div>
            )}
            {step===2 && (
              <div>
                <h3 style={{fontSize:24, marginBottom:20}}>Información de envío</h3>
                <div style={{display:"grid", gap:14}}>
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
                    <Field label="Nombre" value="" onChange={()=>{}}/>
                    <Field label="Apellido" value="" onChange={()=>{}}/>
                  </div>
                  <Field label="Dirección" value="" onChange={()=>{}}/>
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14}}>
                    <Field label="Ciudad" value="" onChange={()=>{}}/>
                    <Field label="País" value="" onChange={()=>{}}/>
                    <Field label="Código postal" value="" onChange={()=>{}}/>
                  </div>
                </div>
                <button onClick={()=>setStep(3)} className="btn-aqua btn-aqua-emerald" style={{marginTop:24, padding:"16px 28px"}}>Continuar al pago</button>
              </div>
            )}
            {step===3 && (
              <div>
                <h3 style={{fontSize:24, marginBottom:20}}>Método de pago</h3>
                <div style={{display:"grid", gap:10, marginBottom:20}}>
                  {["Tarjeta de crédito", "PSE", "Transferencia", "Financiación 3 cuotas"].map((m,i)=>(
                    <label key={m} className="glass" style={{padding:"16px 20px", borderRadius:16, display:"flex", alignItems:"center", gap:12, cursor:"pointer"}}>
                      <input type="radio" name="pay" defaultChecked={i===0}/>
                      <span style={{fontSize:14, fontWeight:500}}>{m}</span>
                    </label>
                  ))}
                </div>
                <button onClick={()=>{alert("Orden confirmada 💎"); navigate("home");}} className="btn-aqua btn-aqua-emerald" style={{padding:"18px 32px", width:"100%"}}>
                  Confirmar compra · {fmt(subtotal)}
                </button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="glass glass-emerald" style={{padding:32, borderRadius:28, height:"fit-content", position:"sticky", top:100}}>
            <div className="eyebrow" style={{color:"oklch(92% 0.08 150)", marginBottom:16}}>Resumen</div>
            <div style={{display:"flex", flexDirection:"column", gap:10, fontSize:13, opacity:0.92}}>
              <Row k="Subtotal" v={fmt(subtotal)}/>
              <Row k="Envío asegurado" v="Gratis"/>
              <Row k="IVA incluido" v="—"/>
            </div>
            <div style={{margin:"20px 0", height:1, background:"oklch(100% 0 0 / 0.3)"}}/>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
              <span style={{fontSize:12, letterSpacing:"0.15em", textTransform:"uppercase", opacity:0.8}}>Total</span>
              <span className="mono" style={{fontSize:24, fontWeight:600}}>{fmt(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:920px){.ck-grid{grid-template-columns:1fr!important}}`}</style>
    </main>
  );
}
const Row = ({k,v}) => <div style={{display:"flex", justifyContent:"space-between"}}><span>{k}</span><span className="mono">{v}</span></div>;

Object.assign(window, { Catalogo, Producto, Nosotros, Contacto, Checkout });
