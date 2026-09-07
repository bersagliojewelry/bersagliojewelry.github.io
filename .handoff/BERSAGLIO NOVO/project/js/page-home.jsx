/* global React */
// ═══════════════════════════════════════════════════════════════════
// HOME — Hero 3D Aqua + secciones con liquid glass
// ═══════════════════════════════════════════════════════════════════
const { useState: useS, useEffect: useE, useRef: useR } = React;

function Home() {
  const { navigate } = useRouter();

  return (
    <main>
      <HomeHero navigate={navigate} />
      <HomeMarquee />
      <HomeCategories navigate={navigate} />
      <HomeFeatured navigate={navigate} />
      <HomeEditorial />
      <HomeServices />
      <HomeAtelier navigate={navigate} />
      <HomeJournal navigate={navigate} />
      <HomeCTA navigate={navigate} />
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HERO — pieza central flotando con parallax de capas cristal
// ═══════════════════════════════════════════════════════════════════
function HomeHero({ navigate }) {
  const [mouse, setMouse] = useS({ x: 0, y: 0 });
  const ref = useR(null);

  useE(() => {
    const onMove = (e) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      setMouse({
        x: ((e.clientX - r.left) / r.width - 0.5) * 2,
        y: ((e.clientY - r.top) / r.height - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const tilt = (d = 1) => ({
    transform: `perspective(1200px) rotateY(${mouse.x * 4 * d}deg) rotateX(${-mouse.y * 4 * d}deg) translateZ(0)`,
    transition: "transform .25s cubic-bezier(.2,.9,.2,1)",
  });

  return (
    <section ref={ref} style={{
      position: "relative", paddingTop: 116, paddingBottom: 28,
      overflow: "hidden",
    }}>
      {/* Backdrop atmospheric blobs */}
      <div aria-hidden="true" style={{position:"absolute", inset:0, pointerEvents:"none"}}>
        <div style={{position:"absolute", width:600, height:600, left:"10%", top:"20%", borderRadius:"50%", background:"radial-gradient(circle, oklch(70% 0.20 155 / 0.25), transparent 70%)", filter:"blur(40px)", animation:"float 16s ease-in-out infinite"}}/>
        <div style={{position:"absolute", width:500, height:500, right:"5%", top:"10%", borderRadius:"50%", background:"radial-gradient(circle, oklch(88% 0.14 85 / 0.3), transparent 70%)", filter:"blur(50px)", animation:"float 20s ease-in-out infinite reverse"}}/>
      </div>

      {/* CINEMATIC BANNER — texto superpuesto estilo Apple/Dior */}
      <div className="hero-stage" style={{position:"relative", zIndex:2, padding:"0 24px", perspective: "1800px"}}>
        {/* CRYSTAL FRAME — vitrina de joyería de lujo */}
        <div className="hero-crystal-frame" style={{
          position:"relative",
          padding: 3,
          borderRadius: 42,
          background: "linear-gradient(135deg, oklch(100% 0 0 / 0.35) 0%, oklch(99% 0.005 200 / 0.18) 30%, oklch(98% 0.01 95 / 0.12) 50%, oklch(99% 0.005 95 / 0.2) 70%, oklch(100% 0 0 / 0.35) 100%)",
          backdropFilter: "blur(22px) saturate(160%)",
          WebkitBackdropFilter: "blur(22px) saturate(160%)",
          boxShadow: [
            "inset 0 1px 0 oklch(100% 0 0 / 0.95)",
            "inset 0 -1px 0 oklch(95% 0.01 95 / 0.5)",
            "inset 1.5px 0 4px -1px oklch(100% 0 0 / 0.55)",
            "inset -1.5px 0 4px -1px oklch(100% 0 0 / 0.55)",
            "inset 0 0 8px oklch(100% 0 0 / 0.25)",
            "0 0 0 0.5px oklch(100% 0 0 / 0.4)",
            "0 0 18px oklch(95% 0.04 90 / 0.1)",
          ].join(", "),
        }}>
        <div className="hero-banner" style={{
          position:"relative",
          width:"100%",
          aspectRatio:"21/9",
          minHeight: 620,
          maxHeight: "84vh",
          borderRadius: 40,
          overflow: "hidden",
          transformStyle: "preserve-3d",
          transform: `rotateX(${mouse.y * 1.5}deg) rotateY(${mouse.x * -1.5}deg)`,
          transition: "transform .8s cubic-bezier(.2,.9,.2,1)",
          boxShadow: [
            // Solo highlights internos para sensación de cristal — sin sombra exterior
            "inset 0 2px 0 oklch(100% 0 0 / 0.7)",
            "inset 0 1px 12px oklch(100% 0 0 / 0.15)",
            "inset 0 -1px 24px oklch(15% 0.04 155 / 0.3)",
          ].join(", "),
          background: "#000",
        }}>
          {/* Background image with parallax */}
          <div
            style={{
              position:"absolute", inset:0,
              backgroundImage: "url('assets/banner-hero.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: `scale(1.06) translate3d(${mouse.x * -10}px, ${mouse.y * -10}px, 0)`,
              transition: "transform .8s cubic-bezier(.2,.9,.2,1)",
            }}
          />

          {/* Frame sutil — solo rim hairline blanco, sin neón aqua */}
          <div aria-hidden="true" style={{
            position:"absolute", inset:0,
            borderRadius:40,
            boxShadow: "inset 0 0 0 1px oklch(100% 0 0 / 0.18), inset 0 1px 0 oklch(100% 0 0 / 0.35)",
            pointerEvents:"none",
            zIndex:2,
          }}/>

          {/* OVERLAID CONTENT */}
          <div className="hero-content" style={{
            position:"absolute", inset:0,
            padding:"clamp(40px, 6vw, 88px)",
            display:"flex", flexDirection:"column", justifyContent:"space-between",
            zIndex: 3,
          }}>
            {/* TOP: locator solo (estilo maison) */}
            <div style={{display:"flex", alignItems:"center", justifyContent:"flex-end"}}>
              <div className="hero-locator mono" style={{
                fontSize:10, letterSpacing:"0.25em", textTransform:"uppercase",
                color:"oklch(100% 0 0 / 0.7)",
                display:"flex", alignItems:"center", gap:10,
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="2.5"/>
                </svg>
                Cartagena de Indias · Colombia
              </div>
            </div>

            {/* CENTER/BOTTOM */}
            <div style={{maxWidth: 760}}>
              {/* Eyebrow editorial */}
              <div style={{display:"flex", alignItems:"center", gap:14, marginBottom:24}}>
                <span style={{width:36, height:1, background:"linear-gradient(90deg, oklch(85% 0.14 85), transparent)"}}/>
                <span className="mono" style={{fontSize:11, letterSpacing:"0.32em", color:"oklch(92% 0.10 88)", textTransform:"uppercase"}}>
                  Joyería de autor
                </span>
              </div>

              <h1 className="hero-headline" style={{
                fontSize:"clamp(52px, 7vw, 108px)",
                lineHeight:0.92, fontWeight:300, letterSpacing:"-0.04em",
                marginBottom:28, color:"#fff",
              }}>
                Donde la luz<br/>
                <span className="hero-headline-italic" style={{
                  fontStyle:"italic", fontWeight:300,
                  background:"linear-gradient(135deg, oklch(96% 0.04 90) 0%, oklch(82% 0.14 90) 22%, oklch(72% 0.20 155) 50%, oklch(82% 0.14 90) 78%, oklch(96% 0.04 90) 100%)",
                  WebkitBackgroundClip:"text", backgroundClip:"text",
                  WebkitTextFillColor:"transparent", color:"transparent",
                }}>cobra alma.</span>
              </h1>

              <p
                className="hero-manifesto"
                style={{
                fontSize:"clamp(15px, 1.1vw, 17px)",
                lineHeight:1.7, color:"#fff",
                maxWidth:540, marginBottom:28,
                fontWeight: 400,
                textAlign: "justify",
                hyphens: "auto",
                transition: "text-shadow .5s ease",
              }}>
                Cada Bersaglio comienza con una conversación. Escuchamos tu historia, elegimos la gema y damos forma a una pieza que viajará contigo, te hará sentir como alguien único y se convertirá en herencia para los tuyos.
              </p>

              <div style={{display:"flex", gap:14, flexWrap:"wrap", alignItems:"center"}}>
                <button
                  onClick={()=>navigate("catalogo")}
                  className="btn-hero"
                >
                  <span className="btn-hero-bg" aria-hidden="true"/>
                  <span className="btn-hero-shimmer" aria-hidden="true"/>
                  <span className="btn-hero-label">Descubrir la colección</span>
                  <span className="btn-hero-arrow" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* SIGNATURE — esquina inferior derecha, sutil sin pill */}
          <div className="hero-signature" style={{
            position:"absolute", right:"clamp(28px, 6vw, 88px)", bottom:"clamp(28px, 5vw, 64px)",
            zIndex:3,
            display:"flex", alignItems:"center", gap:10,
            color:"oklch(100% 0 0 / 0.7)",
          }}>
            <span className="mono" style={{fontSize:9, letterSpacing:"0.28em", textTransform:"uppercase"}}>Una creación de</span>
            <span style={{width:14, height:1, background:"oklch(100% 0 0 / 0.4)"}}/>
            <span style={{
              fontFamily:"var(--font-display)", fontSize:15, fontStyle:"italic", fontWeight:300,
              color:"oklch(100% 0 0 / 0.95)", letterSpacing:"0.01em",
            }}>Kary Mendoza</span>
          </div>
        </div>
        </div>
      </div>

      <style>{`
        /* === HERO HEADLINE — claro y nítido === */
        .hero-headline {
          text-shadow:
            0 1px 2px oklch(15% 0.04 155 / 0.6),
            0 4px 16px oklch(15% 0.04 155 / 0.55),
            0 12px 40px oklch(0% 0 0 / 0.35);
        }
        .hero-headline-italic {
          /* Sombra esmeralda profunda sutil — sin halos de luz alrededor */
          filter:
            drop-shadow(0 2px 6px oklch(15% 0.04 155 / 0.5))
            drop-shadow(0 6px 16px oklch(15% 0.04 155 / 0.35));
        }

        /* === HERO MANIFESTO TEXT === */
        .hero-manifesto {
          text-shadow:
            0 2px 4px oklch(10% 0.03 155),
            0 1px 16px oklch(15% 0.04 155 / 0.95),
            0 0 32px oklch(15% 0.04 155 / 0.7);
          transition: text-shadow .5s ease;
        }
        .hero-manifesto:hover {
          text-shadow:
            /* Contorno negro suave (8 direcciones) — simula stroke sin pixelar */
            -1px -1px 0 oklch(8% 0.02 155 / 0.9),
            1px -1px 0 oklch(8% 0.02 155 / 0.9),
            -1px 1px 0 oklch(8% 0.02 155 / 0.9),
            1px 1px 0 oklch(8% 0.02 155 / 0.9),
            0 -1px 0 oklch(8% 0.02 155 / 0.9),
            0 1px 0 oklch(8% 0.02 155 / 0.9),
            -1px 0 0 oklch(8% 0.02 155 / 0.9),
            1px 0 0 oklch(8% 0.02 155 / 0.9),
            /* Halo dorado externo */
            0 0 6px oklch(85% 0.14 88 / 0.6),
            0 0 12px oklch(85% 0.14 88 / 0.4),
            /* Sombra lejana esmeralda */
            0 2px 18px oklch(15% 0.04 155 / 0.85);
        }

        @media (max-width: 920px) {
          .hero-banner {
            aspect-ratio: 4/5 !important;
            min-height: 600px !important;
            max-height: none !important;
            border-radius: 28px !important;
          }
          .hero-content {
            padding: 28px !important;
          }
          .hero-locator { display:none !important; }
          .hero-signature { right: 20px !important; bottom: 20px !important; gap: 6px !important; }
          .hero-signature .mono { font-size: 8px !important; }
          .hero-signature span:last-child { font-size: 13px !important; }
        }

        /* === HERO PREMIUM BUTTON === */
        .btn-hero {
          position: relative;
          isolation: isolate;
          padding: 18px 34px 18px 36px;
          font-size: 13px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--bj-ink-emerald);
          background: transparent;
          border: 1px solid oklch(100% 0 0 / 0.7);
          border-radius: 999px;
          cursor: pointer;
          overflow: hidden;
          display: inline-flex; align-items: center; gap: 14px;
          transition: transform .5s cubic-bezier(.2,.9,.2,1),
                      box-shadow .5s cubic-bezier(.2,.9,.2,1),
                      letter-spacing .5s cubic-bezier(.2,.9,.2,1);
          box-shadow:
            0 10px 28px oklch(0% 0 0 / 0.28),
            0 2px 6px oklch(0% 0 0 / 0.18),
            inset 0 1px 0 oklch(100% 0 0 / 0.95);
        }
        .btn-hero-bg {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, oklch(99% 0.005 100) 0%, oklch(96% 0.02 90) 50%, oklch(99% 0.005 100) 100%);
          z-index: -2;
          transition: transform .9s cubic-bezier(.2,.9,.2,1);
        }
        .btn-hero-shimmer {
          position: absolute; top: 0; bottom: 0;
          left: -60%; width: 50%;
          background: linear-gradient(105deg,
            transparent 0%,
            oklch(95% 0.14 88 / 0.0) 30%,
            oklch(95% 0.14 88 / 0.55) 50%,
            oklch(95% 0.14 88 / 0.0) 70%,
            transparent 100%);
          z-index: -1;
          transform: skewX(-20deg);
          animation: btnHeroShimmer 3.6s ease-in-out infinite;
        }
        .btn-hero-label {
          position: relative;
          background: linear-gradient(135deg, var(--bj-emerald-900), var(--bj-emerald-700) 60%, var(--bj-gold-700));
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
          transition: transform .5s cubic-bezier(.2,.9,.2,1);
        }
        .btn-hero-arrow {
          position: relative;
          width: 24px; height: 24px;
          border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          color: #fff;
          background: linear-gradient(135deg, var(--bj-emerald-700), var(--bj-emerald-900));
          box-shadow: 0 2px 8px oklch(20% 0.05 155 / 0.4), inset 0 1px 0 oklch(100% 0 0 / 0.3);
          transition: transform .5s cubic-bezier(.2,.9,.2,1), background .5s ease;
        }
        .btn-hero-arrow svg { transition: transform .5s cubic-bezier(.2,.9,.2,1); }

        .btn-hero:hover {
          transform: translateY(-3px);
          letter-spacing: 0.11em;
          box-shadow:
            0 22px 42px oklch(0% 0 0 / 0.35),
            0 4px 10px oklch(20% 0.05 155 / 0.25),
            0 0 0 4px oklch(95% 0.14 88 / 0.15),
            inset 0 1px 0 oklch(100% 0 0 / 0.95);
        }
        .btn-hero:hover .btn-hero-bg {
          transform: scale(1.05);
        }
        .btn-hero:hover .btn-hero-arrow {
          background: linear-gradient(135deg, var(--bj-gold-500), var(--bj-emerald-700));
          transform: translateX(3px) rotate(-8deg) scale(1.08);
        }
        .btn-hero:hover .btn-hero-arrow svg {
          transform: translateX(2px);
        }
        .btn-hero:active {
          transform: translateY(-1px);
          transition-duration: .15s;
        }

        @keyframes btnHeroShimmer {
          0%   { left: -60%; }
          55%  { left: 130%; }
          100% { left: 130%; }
        }
      `}</style>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MARQUEE — cinta credencial
// ═══════════════════════════════════════════════════════════════════
function HomeMarquee() {
  const items = [
    "Oro 18K · Ley 750",
    "Esmeraldas Colombianas",
    "Asesoría Personalizada",
    "Garantía Vitalicia",
    "Atelier en Cartagena",
    "Envío Asegurado Mundial",
    "Una pieza, una historia",
  ];

  return (
    <section style={{padding:"0 24px 8px", overflow:"hidden", position:"relative", marginTop:-22}}>
      <div className="hm-track" style={{
        position:"relative",
        padding:"8px 0",
        borderRadius: 999,
        background: "linear-gradient(135deg, oklch(75% 0.04 155 / 0.22) 0%, oklch(65% 0.06 155 / 0.18) 50%, oklch(75% 0.04 155 / 0.22) 100%)",
        backdropFilter: "blur(16px) saturate(150%)",
        WebkitBackdropFilter: "blur(16px) saturate(150%)",
        boxShadow: [
          "inset 0 1px 0 oklch(100% 0 0 / 0.55)",
          "inset 0 -1px 0 oklch(50% 0.06 155 / 0.25)",
          "inset 1px 0 6px -3px oklch(95% 0.03 155 / 0.35)",
          "inset -1px 0 6px -3px oklch(95% 0.03 155 / 0.35)",
          "0 0 0 0.5px oklch(70% 0.08 155 / 0.25)",
          "0 4px 12px -6px oklch(40% 0.06 155 / 0.18)",
        ].join(", "),
        overflow:"hidden",
      }}>
        {/* Fade left — cristalino verde claro */}
        <div aria-hidden="true" style={{
          position:"absolute", left:0, top:0, bottom:0, width:50,
          background:"linear-gradient(90deg, oklch(80% 0.05 155 / 0.5) 0%, transparent 100%)",
          zIndex:2, pointerEvents:"none",
        }}/>
        {/* Fade right */}
        <div aria-hidden="true" style={{
          position:"absolute", right:0, top:0, bottom:0, width:50,
          background:"linear-gradient(270deg, oklch(80% 0.05 155 / 0.5) 0%, transparent 100%)",
          zIndex:2, pointerEvents:"none",
        }}/>

        <div style={{
          display:"flex",
          animation:"hmMarquee 50s linear infinite",
          whiteSpace:"nowrap",
          width:"max-content",
        }}>
          {[...items, ...items, ...items].map((t, i) => (
            <div key={i} style={{display:"flex", alignItems:"center", gap:0}}>
              <span style={{
                fontFamily:"var(--font-display)",
                fontSize:14, fontWeight:500,
                color:"#fff",
                letterSpacing:"0.015em",
                padding:"0 28px",
                textShadow:"0 1px 2px oklch(15% 0.04 155 / 0.7), 0 0 8px oklch(15% 0.04 155 / 0.5)",
              }}>
                {t}
              </span>
              {/* Separador — diamante dorado con doble línea hairline */}
              <span aria-hidden="true" style={{
                display:"inline-flex", alignItems:"center", gap:6,
                color:"oklch(85% 0.14 88 / 0.7)",
              }}>
                <span style={{width:14, height:1, background:"currentColor"}}/>
                <svg width="6" height="6" viewBox="0 0 10 10" style={{flexShrink:0}}>
                  <rect x="2.5" y="2.5" width="5" height="5" transform="rotate(45 5 5)" fill="currentColor"/>
                </svg>
                <span style={{width:14, height:1, background:"currentColor"}}/>
              </span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes hmMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CATEGORIES — dock iOS-style
// ═══════════════════════════════════════════════════════════════════
function HomeCategories({ navigate }) {
  const cats = [
    { n:"Anillos",   count:24, img:"assets/ring-sapphire.jpg",        hue:200, pos:"center" },
    { n:"Topos",     count:18, img:"assets/earrings-travertino.png",  hue:30,  pos:"center" },
    { n:"Argollas",  count:12, img:"assets/earrings-emerald.png",     hue:155, pos:"center" },
    { n:"Dijes",     count:16, img:"assets/model-emerald.png",        hue:155, pos:"center top" },
    { n:"Pulseras",  count:9,  img:"assets/banner-hero.png",          hue:90,  pos:"center" },
    { n:"Editorial", count:6,  img:"assets/model-emerald.png",        hue:155, pos:"center" },
  ];
  return (
    <section style={{padding:"24px 0 32px"}}>
      <div className="container">
        <div style={{textAlign:"center", marginBottom:22}}>
          <div className="eyebrow" style={{marginBottom:10}}>Nuestras categorías</div>
          <h2 style={{fontSize:"clamp(38px, 5vw, 64px)", fontWeight:300, letterSpacing:"-0.025em", marginBottom:12}}>
            Un universo <span className="italic emerald-text">en cristal</span>
          </h2>
          <p style={{fontSize:16, color:"var(--bj-ink-soft)", maxWidth:520, margin:"0 auto"}}>
            Cada categoría es una exploración distinta de forma, luz y significado.
          </p>
        </div>

        <style>{`
          .cat-dock { display:grid; grid-template-columns:repeat(6,1fr); gap:18px; }
          @media (max-width: 980px){ .cat-dock { grid-template-columns:repeat(3,1fr); } }
          @media (max-width: 520px){ .cat-dock { grid-template-columns:repeat(2,1fr); } }
        `}</style>

        <div className="cat-dock">
          {cats.map((c) => (
            <button
              key={c.n}
              onClick={()=>navigate("catalogo")}
              className="glass"
              style={{
                position:"relative",
                padding:3,
                borderRadius:28,
                aspectRatio:"3/4",
                overflow:"hidden",
                cursor:"pointer",
                transition:"transform .5s cubic-bezier(.2,.9,.2,1), box-shadow .5s",
                textAlign:"left",
              }}
              onMouseEnter={e=>{
                e.currentTarget.style.transform="translateY(-8px)";
                const im = e.currentTarget.querySelector(".cat-img");
                if (im) im.style.transform = "scale(1.08)";
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.transform="";
                const im = e.currentTarget.querySelector(".cat-img");
                if (im) im.style.transform = "";
              }}
            >
              {/* imagen full-bleed dentro del cristal */}
              <div style={{position:"relative", width:"100%", height:"100%", borderRadius:25, overflow:"hidden"}}>
                <div className="cat-img" style={{
                  position:"absolute", inset:0,
                  background:`url(${c.img}) ${c.pos}/cover`,
                  transition:"transform .8s cubic-bezier(.2,.9,.2,1)",
                }}/>
                {/* gradient overlay para legibilidad del texto inferior */}
                <div style={{
                  position:"absolute", inset:0,
                  background:`linear-gradient(180deg, oklch(20% 0.04 ${c.hue} / 0.05) 0%, oklch(20% 0.04 ${c.hue} / 0.15) 45%, oklch(15% 0.06 ${c.hue} / 0.85) 100%)`,
                }}/>

                {/* contenido: nombre + piezas */}
                <div style={{
                  position:"absolute", left:14, right:14, bottom:14,
                  display:"flex", flexDirection:"column", gap:2,
                  color:"#fff",
                }}>
                  <div style={{
                    fontFamily:"var(--font-display)",
                    fontSize:"clamp(18px, 1.7vw, 22px)",
                    fontWeight:400,
                    letterSpacing:"-0.01em",
                    lineHeight:1.05,
                    textShadow:"0 2px 8px oklch(15% 0.05 155 / 0.6)",
                  }}>{c.n}</div>
                  <div className="mono" style={{
                    fontSize:10,
                    letterSpacing:"0.18em",
                    textTransform:"uppercase",
                    color:"oklch(95% 0.04 90 / 0.9)",
                    textShadow:"0 1px 4px oklch(15% 0.05 155 / 0.6)",
                  }}>{c.count} piezas</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// FEATURED — grid cristal
// ═══════════════════════════════════════════════════════════════════
function HomeFeatured({ navigate }) {
  const fmt = (n) => "$ " + n.toLocaleString("es-CO");
  return (
    <section style={{padding:"24px 0 20px"}}>
      <div className="container">
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:20, flexWrap:"wrap", gap:20}}>
          <div>
            <div className="eyebrow" style={{marginBottom:12}}>Piezas destacadas</div>
            <h2 style={{fontSize:"clamp(38px, 5vw, 64px)", fontWeight:300, letterSpacing:"-0.025em"}}>Selección <span className="italic emerald-text">curada</span></h2>
          </div>
          <button onClick={()=>navigate("catalogo")} className="btn-aqua" style={{padding:"14px 22px", fontSize:13}}>
            Ver todo el catálogo <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:22}}>
          {PRODUCTS.filter(p => p.price).map((p,i) => (
            <button key={p.id} onClick={()=>navigate("producto/" + p.id)} className="glass glass-iridescent" style={{
              padding:0, borderRadius:30, overflow:"hidden", textAlign:"left",
              display:"flex", flexDirection:"column",
              transition:"transform .5s cubic-bezier(.2,.9,.2,1), box-shadow .5s",
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-10px)"; e.currentTarget.style.boxShadow="0 1px 0 oklch(100% 0 0 / 0.9) inset, 0 40px 80px -20px oklch(42% 0.14 155 / 0.35)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="";}}>
              <div style={{position:"relative", aspectRatio:"4/5", background:`url(${p.img}) center/cover`, overflow:"hidden"}}>
                <div style={{position:"absolute", inset:0, background:"linear-gradient(180deg, oklch(92% 0.06 150 / 0.2) 0%, transparent 30%, oklch(20% 0.05 155 / 0.15))"}}/>
                {p.tag && <div style={{position:"absolute", top:14, left:14}}><div className="chip" style={{background:"oklch(20% 0.05 155 / 0.5)", color:"#fff", border:"1px solid oklch(100% 0 0 / 0.4)", backdropFilter:"blur(12px)"}}><span className="chip-dot" style={{background:"var(--bj-gold-500)"}}/>{p.tag}</div></div>}
                <div style={{position:"absolute", top:14, right:14, width:36, height:36, borderRadius:999, background:"oklch(100% 0 0 / 0.7)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid oklch(100% 0 0 / 0.7)"}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
              </div>
              <div style={{padding:"20px 22px 22px", display:"flex", flexDirection:"column", gap:6}}>
                <div style={{fontSize:10, letterSpacing:"0.25em", textTransform:"uppercase", color:"var(--bj-ink-mute)"}}>{p.cat}</div>
                <div style={{fontFamily:"var(--font-display)", fontSize:22, fontWeight:500, color:"var(--bj-ink-emerald)", lineHeight:1.2}}>{p.name}</div>
                <div style={{fontSize:12, color:"var(--bj-ink-soft)"}}>{p.stones} · {p.gold}</div>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10, paddingTop:14, borderTop:"1px solid oklch(100% 0 0 / 0.5)"}}>
                  <div className="mono" style={{fontSize:15, fontWeight:600, color:"var(--bj-emerald-800)"}}>{fmt(p.price)}</div>
                  <div style={{fontSize:11, color:"var(--bj-ink-mute)", display:"flex", alignItems:"center", gap:4}}>Ver pieza <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg></div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// EDITORIAL — imagen grande + quote
// ═══════════════════════════════════════════════════════════════════
function HomeEditorial() {
  return (
    <section style={{padding:"20px 0"}}>
      <div className="container">
        <div style={{display:"grid", gridTemplateColumns:"1.1fr 1fr", gap:28, alignItems:"stretch"}} className="edit-grid">
          <div className="glass glass-iridescent" style={{borderRadius:44, overflow:"hidden", padding:0, minHeight:500, position:"relative"}}>
            <div style={{position:"absolute", inset:0, background:`url(assets/model-emerald.png) center/cover`}}/>
            <div style={{position:"absolute", inset:0, background:"linear-gradient(180deg, transparent 40%, oklch(18% 0.05 155 / 0.65))"}}/>
            <div style={{position:"absolute", bottom:28, left:28, right:28, color:"#fff"}}>
              <div className="chip" style={{background:"oklch(100% 0 0 / 0.25)", color:"#fff", border:"1px solid oklch(100% 0 0 / 0.4)", backdropFilter:"blur(16px)", marginBottom:14}}>
                <span className="chip-dot" style={{background:"var(--bj-gold-300)"}}/>Editorial
              </div>
              <h3 style={{fontSize:38, fontWeight:300, letterSpacing:"-0.02em", fontFamily:"var(--font-display)", fontStyle:"italic"}}>La Verde, 2026</h3>
              <p style={{fontSize:14, opacity:0.9, marginTop:8, maxWidth:420}}>Seis piezas esculpidas alrededor de la luz esmeralda colombiana.</p>
            </div>
          </div>

          <div className="glass" style={{borderRadius:44, padding:"32px 28px", display:"flex", flexDirection:"column", justifyContent:"center"}}>
            <div className="eyebrow" style={{marginBottom:16}}>Nuestra filosofía</div>
            <h2 style={{fontSize:"clamp(32px, 3.6vw, 52px)", fontWeight:300, letterSpacing:"-0.025em", lineHeight:1.05, marginBottom:28}}>
              Más que vender joyas,<br/><span className="italic emerald-text">nos apasiona asesorar.</span>
            </h2>
            <p style={{fontSize:16, lineHeight:1.7, color:"var(--bj-ink-soft)", marginBottom:24}}>
              Cada pieza tiene un significado. Somos cómplices silenciosos de los momentos que definen una vida: una propuesta, una promesa, un legado.
            </p>
            <div style={{fontFamily:"var(--font-display)", fontSize:22, fontStyle:"italic", color:"var(--bj-emerald-800)", paddingLeft:20, borderLeft:"2px solid var(--bj-gold-500)", marginBottom:28}}>
              "Una joya Bersaglio no se compra. Se adopta."
            </div>
            <div style={{display:"flex", gap:40, paddingTop:24, borderTop:"1px solid oklch(100% 0 0 / 0.5)"}}>
              <div><div className="display" style={{fontSize:32, color:"var(--bj-emerald-800)"}}>12+</div><div className="eyebrow" style={{fontSize:10}}>Años</div></div>
              <div><div className="display" style={{fontSize:32, color:"var(--bj-emerald-800)"}}>800+</div><div className="eyebrow" style={{fontSize:10}}>Piezas únicas</div></div>
              <div><div className="display" style={{fontSize:32, color:"var(--bj-emerald-800)"}}>JA</div><div className="eyebrow" style={{fontSize:10}}>Certificado</div></div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:920px){.edit-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════════════
function HomeServices() {
  const svc = [
    { t:"Diseño a medida", d:"Crea la pieza de tus sueños con nuestro atelier. Desde boceto hasta entrega.", icon:"pen" },
    { t:"Asesoría privada", d:"Consulta 1:1 con nuestros gemólogos. Virtual o en nuestra casa en Cartagena.", icon:"user" },
    { t:"Certificación GIA", d:"Cada pieza con diamante incluye certificado del Gemological Institute.", icon:"check" },
    { t:"Garantía vitalicia", d:"Mantenimiento, pulido y verificación de piedras de por vida.", icon:"shield" },
  ];
  const icons = {
    pen:<path d="M12 20h9M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>,
    user:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    check:<path d="M20 6L9 17l-5-5"/>,
    shield:<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
  };
  return (
    <section style={{padding:"20px 0"}}>
      <div className="container">
        <div style={{textAlign:"center", marginBottom:22}}>
          <div className="eyebrow" style={{marginBottom:10}}>Experiencia premium</div>
          <h2 style={{fontSize:"clamp(38px, 5vw, 60px)", fontWeight:300, letterSpacing:"-0.025em"}}>Un servicio a la altura<br/><span className="italic emerald-text">de cada pieza</span></h2>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:18}}>
          {svc.map(s => (
            <div key={s.t} className="glass" style={{padding:"24px 22px", borderRadius:28, textAlign:"center"}}>
              <div style={{
                width:60, height:60, margin:"0 auto 18px",
                borderRadius:"50%",
                background:"radial-gradient(circle at 30% 30%, oklch(95% 0.08 150), oklch(65% 0.17 155) 70%)",
                boxShadow:"inset 0 2px 0 oklch(100% 0 0 / 0.9), 0 8px 24px -4px oklch(50% 0.15 155 / 0.4)",
                display:"flex", alignItems:"center", justifyContent:"center", color:"#fff",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">{icons[s.icon]}</svg>
              </div>
              <div style={{fontFamily:"var(--font-display)", fontSize:19, fontWeight:500, color:"var(--bj-ink-emerald)", marginBottom:8}}>{s.t}</div>
              <p style={{fontSize:13, color:"var(--bj-ink-soft)", lineHeight:1.6}}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ATELIER — proceso visualizado
// ═══════════════════════════════════════════════════════════════════
function HomeAtelier({ navigate }) {
  // Layout: número-tipográfico XL como protagonista. Joya central. Líneas que conectan.
  const steps = [
    { n:"01", t:"Diseño a medida",        d:"Fabricamos y diseñamos. Creamos la joya de tus sueños desde cero, con los mejores metales y gemas." },
    { n:"02", t:"Asesoría cercana",       d:"Te visitamos puerta a puerta. Esa cercanía es nuestro sello: encontramos la pieza que refleje tu esencia." },
    { n:"03", t:"Garantía certificada",   d:"Todas nuestras piezas vienen garantizadas. Diamantería con certificación internacional GIA." },
    { n:"04", t:"Cuidado de por vida",    d:"Limpieza, mantenimiento y restauración. Tus joyas brillarán como el primer día, siempre." },
  ];
  // Posiciones (desktop): cards en 4 esquinas, joya al centro
  const cornerCSS = {
    0: { top:"20px",     left:"20px",   align:"flex-start", textAlign:"left",  numAlign:"left"  },
    1: { top:"20px",     right:"20px",  align:"flex-end",   textAlign:"right", numAlign:"right" },
    2: { bottom:"20px",  left:"20px",   align:"flex-start", textAlign:"left",  numAlign:"left"  },
    3: { bottom:"20px",  right:"20px",  align:"flex-end",   textAlign:"right", numAlign:"right" },
  };

  return (
    <section style={{padding:"20px 0"}}>
      <div className="container">
        {/* Header */}
        <div style={{textAlign:"center", maxWidth:680, margin:"0 auto 20px"}}>
          <div className="chip" style={{marginBottom:18}}><span className="chip-dot" style={{background:"var(--bj-gold-500)"}}/>Atelier Bersaglio</div>
          <h2 style={{fontSize:"clamp(36px, 4vw, 56px)", fontWeight:300, letterSpacing:"-0.025em", lineHeight:1.05, marginBottom:18}}>
            El proceso detrás de <span className="italic emerald-text">una pieza única</span>
          </h2>
          <p style={{fontSize:15, color:"var(--bj-ink-soft)", lineHeight:1.7}}>
            Cuatro pasos que convierten una idea en patrimonio familiar.
          </p>
        </div>

        {/* DESKTOP STAGE */}
        <div className="glass glass-iridescent at-stage" style={{
          position:"relative", borderRadius:48, padding:"36px",
          minHeight:580, overflow:"hidden",
          background:"linear-gradient(160deg, oklch(96% 0.02 90 / 0.6), oklch(94% 0.05 150 / 0.45))",
        }}>
          {/* SVG conectores radiales hacia la joya */}
          <svg aria-hidden="true" className="at-connectors" style={{position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:1}}>
            <defs>
              <radialGradient id="connFade" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="oklch(70% 0.10 85)" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="oklch(70% 0.10 85)" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <line x1="20%" y1="20%"   x2="50%" y2="50%" stroke="url(#connFade)" strokeWidth="1" strokeDasharray="2 5"/>
            <line x1="80%" y1="20%"   x2="50%" y2="50%" stroke="url(#connFade)" strokeWidth="1" strokeDasharray="2 5"/>
            <line x1="20%" y1="80%"   x2="50%" y2="50%" stroke="url(#connFade)" strokeWidth="1" strokeDasharray="2 5"/>
            <line x1="80%" y1="80%"   x2="50%" y2="50%" stroke="url(#connFade)" strokeWidth="1" strokeDasharray="2 5"/>
          </svg>

          {/* Halo dorado */}
          <div aria-hidden="true" style={{position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:560, height:560, borderRadius:"50%", background:"radial-gradient(circle, oklch(92% 0.10 88 / 0.45), transparent 65%)", filter:"blur(30px)", pointerEvents:"none"}}/>
          <div aria-hidden="true" style={{position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:440, height:440, borderRadius:"50%", border:"1px dashed oklch(70% 0.10 85 / 0.30)", pointerEvents:"none"}}/>

          {/* JOYA CENTRAL */}
          <div className="at-jewel" style={{
            position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
            width:320, height:320, borderRadius:"50%",
            background:"radial-gradient(circle at 35% 30%, oklch(98% 0.01 150) 0%, oklch(94% 0.05 150 / 0.7) 50%, oklch(85% 0.07 150 / 0.4) 100%)",
            boxShadow:"inset 0 4px 0 oklch(100% 0 0 / 0.9), inset 0 -10px 30px oklch(70% 0.10 155 / 0.18), 0 0 0 1px oklch(100% 0 0 / 0.6), 0 0 80px oklch(85% 0.14 85 / 0.5), 0 30px 80px -10px oklch(40% 0.10 155 / 0.3)",
            display:"flex", alignItems:"center", justifyContent:"center",
            zIndex:2,
          }}>
            <img src="assets/ring-sapphire.jpg" alt="Joya Bersaglio" style={{
              width:"82%", height:"82%", objectFit:"cover", borderRadius:"50%",
              boxShadow:"0 14px 40px -8px oklch(20% 0.05 155 / 0.5)",
              filter:"saturate(1.15) contrast(1.05)",
            }}/>
            <div aria-hidden="true" style={{position:"absolute", top:"22%", left:"30%", width:18, height:18, background:"radial-gradient(circle, #fff, transparent 70%)", borderRadius:"50%", filter:"blur(2px)"}}/>
          </div>

          {/* 4 CARDS — protagonismo del numeral */}
          {steps.map((s, i) => {
            const c = cornerCSS[i];
            return (
              <div key={s.n} className="at-card" style={{
                position:"absolute", ...c,
                maxWidth:260,
                display:"flex", flexDirection:"column", alignItems:c.align,
                zIndex:3,
              }}>
                {/* Número como protagonista, tipográfico */}
                <div style={{
                  display:"flex", alignItems:"baseline", gap:10,
                  marginBottom:14,
                  flexDirection: c.numAlign==="right" ? "row-reverse" : "row",
                }}>
                  <span style={{
                    fontFamily:"var(--font-display)",
                    fontSize:64, fontWeight:300,
                    lineHeight:0.9,
                    background:"linear-gradient(180deg, oklch(75% 0.12 85), oklch(55% 0.14 80))",
                    WebkitBackgroundClip:"text", backgroundClip:"text",
                    WebkitTextFillColor:"transparent", color:"transparent",
                    letterSpacing:"-0.04em",
                  }}>{s.n}</span>
                  <span style={{
                    width:32, height:1,
                    background:"linear-gradient(90deg, oklch(70% 0.10 85), transparent)",
                    transform: c.numAlign==="right" ? "scaleX(-1)" : "none",
                  }}/>
                </div>

                <div style={{fontFamily:"var(--font-display)", fontSize:21, fontWeight:500, color:"var(--bj-ink-emerald)", marginBottom:8, textAlign:c.textAlign, lineHeight:1.2}}>{s.t}</div>
                <p style={{fontSize:13, color:"var(--bj-ink-soft)", lineHeight:1.65, textAlign:c.textAlign}}>{s.d}</p>
              </div>
            );
          })}

          {/* CTA inferior */}
          <div className="at-cta" style={{position:"absolute", bottom:24, left:"50%", transform:"translateX(-50%)", zIndex:4}}>
            <button onClick={()=>navigate("contacto")} className="btn-aqua btn-aqua-emerald" style={{padding:"14px 26px", fontSize:13}}>
              Iniciar mi pieza
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        /* Tablet: reduce paddings */
        @media(max-width:1100px){
          .at-stage{ min-height:600px !important; padding:32px !important; }
          .at-stage .at-jewel{ width:240px !important; height:240px !important; }
          .at-card{ max-width:220px !important; }
        }
        /* Mobile: timeline vertical, joya arriba */
        @media(max-width:820px){
          .at-stage{
            min-height:auto !important;
            padding:32px 24px !important;
            display:flex !important;
            flex-direction:column !important;
            align-items:center !important;
            gap:0 !important;
          }
          .at-stage .at-connectors{ display:none !important; }
          .at-stage .at-jewel{
            position:relative !important;
            top:auto !important; left:auto !important;
            transform:none !important;
            width:200px !important; height:200px !important;
            margin:0 auto 36px !important;
          }
          .at-stage .at-card{
            position:relative !important;
            top:auto !important; left:auto !important; right:auto !important; bottom:auto !important;
            max-width:100% !important; width:100% !important;
            align-items:flex-start !important;
            padding: 24px 0;
            border-top: 1px solid oklch(70% 0.10 85 / 0.2);
          }
          .at-stage .at-card:first-of-type{ border-top:none; padding-top:0; }
          .at-stage .at-card > div:first-child{ flex-direction:row !important; }
          .at-stage .at-card > div:first-child > span:last-child{ transform:none !important; }
          .at-stage .at-card *{ text-align:left !important; }
          .at-stage .at-cta{
            position:relative !important;
            bottom:auto !important; left:auto !important;
            transform:none !important;
            margin-top:24px;
          }
        }
      `}</style>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// JOURNAL — Editorial newsroom layout (NYT / Vogue / Aesop hybrid)
// ═══════════════════════════════════════════════════════════════════
function HomeJournal({ navigate }) {
  const cover = {
    issue: "Issue Nº 14",
    date: "Marzo 2026",
    section: "Reportaje",
    read: "8 min",
    kicker: "Las gemas que cambiaron Cartagena",
    title: "Esmeraldas: la historia oculta detrás del verde colombiano",
    excerpt: "Un viaje al corazón de Muzo y Coscuez, donde la geología, la herencia indígena y el oficio artesanal convergen para producir las esmeraldas más codiciadas del planeta. Conversamos con tres mineros, un gemólogo y la directora del Atelier Bersaglio.",
    author: "Por María Camila Bersaglio",
    img: "assets/ring-emerald.png",
  };
  const ticker = [
    "Nuevo: Colección Atrato 2026 disponible", "Live · Subasta privada Casa Bersaglio 14·04",
    "Guía: 7 mitos sobre las esmeralda colombianas", "Atelier abierto · Cartagena · Cita previa",
  ];
  const sideStories = [
    { sec:"Atelier", date:"12·03·26", title:"Los seis pulsos de un anillo a medida", read:"5 min" },
    { sec:"Mercado",  date:"06·03·26", title:"Por qué el oro 18K supera al 14K en patrimonio", read:"4 min" },
    { sec:"Diseño",   date:"28·02·26", title:"Trinity: la geometría que enamoró a Cartier", read:"6 min" },
    { sec:"Cuidado",  date:"19·02·26", title:"Rituales caseros para conservar el fuego de tu diamante", read:"3 min" },
  ];
  const trio = [
    { sec:"Entrevista", title:"\"La esmeralda es paciencia geológica\"", who:"Andrés Forero, gemólogo GIA", img:"assets/earrings-emerald.png" },
    { sec:"Editorial",  title:"Bodas que no se desvanecen",            who:"Ensayo · Lina Restrepo",     img:"assets/ring-sapphire.jpg" },
    { sec:"Patrimonio", title:"Joyas que cruzaron tres generaciones",  who:"Archivo familiar Bersaglio", img:"assets/earrings-travertino.png" },
  ];

  return (
    <section style={{padding:"28px 0 24px", position:"relative"}}>
      <div className="container">
        {/* Masthead estilo periódico */}
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:24, paddingBottom:18, borderBottom:"2px solid var(--bj-emerald-800)", marginBottom:6}}>
          <div style={{display:"flex", alignItems:"center", gap:18}}>
            <div className="mono" style={{fontSize:10, letterSpacing:"0.25em", color:"var(--bj-ink-soft)"}}>EST. 2014</div>
            <div style={{width:1, height:18, background:"var(--bj-gold-500)"}}/>
            <h2 style={{fontFamily:"var(--font-display)", fontSize:34, fontWeight:400, letterSpacing:"-0.02em", color:"var(--bj-ink-emerald)", lineHeight:1}}>
              The <span className="italic">Bersaglio</span> Journal
            </h2>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:14}} className="masthead-meta">
            <div className="mono" style={{fontSize:11, letterSpacing:"0.18em", color:"var(--bj-ink-soft)", textTransform:"uppercase"}}>
              {cover.issue} · {cover.date}
            </div>
            <button onClick={()=>navigate("journal")} className="btn-aqua" style={{padding:"10px 16px", fontSize:12}}>
              Archivo completo
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
        {/* Línea fina dorada bajo el masthead */}
        <div style={{height:1, background:"linear-gradient(90deg, var(--bj-gold-500), transparent)", marginBottom:24}}/>

        {/* Breaking ticker — cinta de noticias */}
        <div className="glass" style={{borderRadius:14, padding:"10px 18px", display:"flex", alignItems:"center", gap:18, marginBottom:24, overflow:"hidden"}}>
          <div className="mono" style={{fontSize:10, fontWeight:700, letterSpacing:"0.2em", color:"#fff", background:"var(--bj-emerald-800)", padding:"6px 10px", borderRadius:4, flexShrink:0, display:"flex", alignItems:"center", gap:6}}>
            <span style={{width:6, height:6, borderRadius:"50%", background:"var(--bj-gold-300)", animation:"pulse 1.6s ease-in-out infinite"}}/>
            EN VIVO
          </div>
          <div style={{flex:1, overflow:"hidden", whiteSpace:"nowrap"}}>
            <div style={{display:"inline-flex", gap:48, animation:"marquee 38s linear infinite", fontSize:13, color:"var(--bj-ink-soft)"}}>
              {[...ticker, ...ticker].map((t,i)=>(
                <span key={i} style={{display:"inline-flex", alignItems:"center", gap:14}}>
                  {t}
                  <span style={{color:"var(--bj-gold-500)"}}>◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hero portada — estilo NYT above the fold */}
        <div className="journal-fold" style={{display:"grid", gridTemplateColumns:"1.55fr 1fr", gap:36, paddingBottom:32, borderBottom:"1px solid oklch(70% 0.04 90 / 0.4)", marginBottom:28}}>
          {/* Portada */}
          <article style={{cursor:"pointer"}} onClick={()=>navigate("journal/cover")}>
            <div style={{position:"relative", aspectRatio:"16/10", borderRadius:24, overflow:"hidden", marginBottom:22, background:"linear-gradient(135deg, oklch(94% 0.04 150), oklch(80% 0.10 155))"}}>
              <img src={cover.img} alt={cover.title} style={{width:"100%", height:"100%", objectFit:"cover", filter:"saturate(1.05)"}}/>
              {/* Vignette inferior */}
              <div aria-hidden="true" style={{position:"absolute", inset:0, background:"linear-gradient(180deg, transparent 40%, oklch(20% 0.05 155 / 0.65) 100%)"}}/>
              {/* Bandera de sección */}
              <div style={{position:"absolute", top:20, left:20, display:"flex", gap:10, alignItems:"center"}}>
                <span className="mono" style={{fontSize:10, fontWeight:700, letterSpacing:"0.2em", color:"#fff", background:"var(--bj-gold-700)", padding:"6px 12px", borderRadius:4}}>{cover.section.toUpperCase()}</span>
                <span className="mono" style={{fontSize:11, color:"#fff", textShadow:"0 1px 4px oklch(20% 0.05 155 / 0.6)"}}>{cover.read} de lectura</span>
              </div>
              {/* Caption en la imagen */}
              <div style={{position:"absolute", bottom:20, left:24, right:24, color:"#fff"}}>
                <div className="mono" style={{fontSize:10, letterSpacing:"0.2em", opacity:0.9, marginBottom:6, textTransform:"uppercase"}}>{cover.kicker}</div>
              </div>
            </div>

            <h3 style={{fontFamily:"var(--font-display)", fontSize:"clamp(34px, 3.6vw, 52px)", fontWeight:400, letterSpacing:"-0.025em", lineHeight:1.05, color:"var(--bj-ink-emerald)", marginBottom:18, textWrap:"balance"}}>
              {cover.title}
            </h3>
            <p style={{fontSize:16, lineHeight:1.7, color:"var(--bj-ink-soft)", marginBottom:18, columnCount:2, columnGap:32, textAlign:"justify"}} className="cover-excerpt">
              <span style={{fontFamily:"var(--font-display)", fontSize:42, fontWeight:400, float:"left", lineHeight:0.9, marginRight:8, marginTop:6, color:"var(--bj-emerald-800)"}}>{cover.excerpt.charAt(0)}</span>
              {cover.excerpt.slice(1)}
            </p>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, paddingTop:14, borderTop:"1px solid oklch(70% 0.04 90 / 0.3)"}}>
              <div style={{display:"flex", alignItems:"center", gap:10}}>
                <div style={{width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg, var(--bj-emerald-700), var(--bj-emerald-900))", color:"var(--bj-gold-300)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-display)", fontSize:15, fontStyle:"italic"}}>MB</div>
                <div>
                  <div style={{fontSize:13, fontWeight:500, color:"var(--bj-ink-emerald)"}}>{cover.author}</div>
                  <div className="mono" style={{fontSize:10, color:"var(--bj-ink-soft)", letterSpacing:"0.15em"}}>{cover.date.toUpperCase()}</div>
                </div>
              </div>
              <div style={{display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:500, color:"var(--bj-emerald-800)"}}>
                Continuar leyendo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </div>
            </div>
          </article>

          {/* Sidebar tipo "Más leído" — lista numerada periódica */}
          <aside>
            <div style={{display:"flex", alignItems:"baseline", gap:12, paddingBottom:14, borderBottom:"1px solid var(--bj-ink-emerald)", marginBottom:4}}>
              <h4 style={{fontFamily:"var(--font-display)", fontSize:22, fontWeight:500, fontStyle:"italic", color:"var(--bj-ink-emerald)"}}>Más leídos</h4>
              <div className="mono" style={{fontSize:10, letterSpacing:"0.2em", color:"var(--bj-gold-700)", marginLeft:"auto"}}>ESTA SEMANA</div>
            </div>
            {sideStories.map((s, i) => (
              <article key={i} onClick={()=>navigate("journal/" + i)} style={{display:"grid", gridTemplateColumns:"36px 1fr", gap:14, padding:"18px 0", borderBottom: i < sideStories.length-1 ? "1px solid oklch(70% 0.04 90 / 0.3)" : "none", cursor:"pointer", alignItems:"start"}}>
                <div style={{fontFamily:"var(--font-display)", fontSize:30, fontWeight:300, fontStyle:"italic", color:"var(--bj-gold-700)", lineHeight:1, paddingTop:4}}>0{i+1}</div>
                <div>
                  <div className="mono" style={{fontSize:10, letterSpacing:"0.18em", color:"var(--bj-emerald-800)", textTransform:"uppercase", marginBottom:6, display:"flex", gap:10}}>
                    <span>{s.sec}</span>
                    <span style={{color:"var(--bj-gold-500)"}}>·</span>
                    <span style={{color:"var(--bj-ink-soft)"}}>{s.date}</span>
                  </div>
                  <h5 style={{fontFamily:"var(--font-display)", fontSize:18, fontWeight:500, lineHeight:1.2, color:"var(--bj-ink-emerald)", letterSpacing:"-0.01em", marginBottom:6, textWrap:"balance"}}>{s.title}</h5>
                  <div className="mono" style={{fontSize:10, color:"var(--bj-ink-soft)"}}>{s.read} de lectura</div>
                </div>
              </article>
            ))}

            {/* Newsletter inline */}
            <div className="glass glass-emerald" style={{marginTop:24, padding:"22px 22px", borderRadius:20, color:"#fff"}}>
              <div className="mono" style={{fontSize:10, letterSpacing:"0.22em", opacity:0.85, marginBottom:8}}>NEWSLETTER</div>
              <div style={{fontFamily:"var(--font-display)", fontSize:20, fontWeight:400, lineHeight:1.2, marginBottom:12}}>
                Una nota cada<br/><span className="italic" style={{color:"var(--bj-gold-300)"}}>luna llena</span>
              </div>
              <div style={{display:"flex", gap:6, background:"oklch(100% 0 0 / 0.15)", borderRadius:10, padding:4, border:"1px solid oklch(100% 0 0 / 0.25)"}}>
                <input placeholder="tu@correo.com" style={{flex:1, background:"transparent", border:"none", outline:"none", color:"#fff", padding:"8px 10px", fontSize:13}} />
                <button style={{background:"var(--bj-gold-500)", color:"var(--bj-emerald-900)", border:"none", padding:"8px 14px", borderRadius:7, fontSize:12, fontWeight:600, cursor:"pointer"}}>Suscribir</button>
              </div>
            </div>
          </aside>
        </div>

        {/* Trio de secciones inferior (entrevista / editorial / patrimonio) */}
        <div className="journal-trio" style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:32}}>
          {trio.map((t, i) => (
            <article key={i} onClick={()=>navigate("journal/trio-" + i)} style={{cursor:"pointer", display:"flex", flexDirection:"column", gap:14}}>
              <div style={{position:"relative", aspectRatio:"5/4", borderRadius:18, overflow:"hidden", background:"linear-gradient(135deg, oklch(94% 0.04 150), oklch(85% 0.08 155))"}}>
                <img src={t.img} alt={t.title} style={{width:"100%", height:"100%", objectFit:"cover"}}/>
                <div aria-hidden="true" style={{position:"absolute", inset:0, background:"linear-gradient(180deg, transparent 60%, oklch(20% 0.05 155 / 0.4) 100%)"}}/>
                <span className="mono" style={{position:"absolute", top:14, left:14, fontSize:10, fontWeight:700, letterSpacing:"0.2em", color:"#fff", background:"oklch(20% 0.05 155 / 0.55)", backdropFilter:"blur(10px)", padding:"5px 10px", borderRadius:4, textTransform:"uppercase"}}>{t.sec}</span>
              </div>
              <h4 style={{fontFamily:"var(--font-display)", fontSize:22, fontWeight:500, lineHeight:1.2, letterSpacing:"-0.01em", color:"var(--bj-ink-emerald)", textWrap:"balance"}}>{t.title}</h4>
              <div className="mono" style={{fontSize:11, letterSpacing:"0.12em", color:"var(--bj-ink-soft)", textTransform:"uppercase"}}>{t.who}</div>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @media(max-width:1100px){
          .cover-excerpt{ column-count:1 !important; }
        }
        @media(max-width:920px){
          .journal-fold{ grid-template-columns:1fr !important; gap:40px !important; }
          .journal-trio{ grid-template-columns:1fr !important; }
          .masthead-meta{ flex-direction:column; align-items:flex-end; gap:8px; }
        }
      `}</style>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CTA final
// ═══════════════════════════════════════════════════════════════════
function HomeCTA({ navigate }) {
  return (
    <section style={{padding:"24px 0 36px"}}>
      <div className="container">
        <div className="glass glass-iridescent" style={{padding:"48px 40px", borderRadius:48, textAlign:"center", position:"relative", overflow:"hidden"}}>
          <div style={{position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:600, height:300, background:"radial-gradient(ellipse, oklch(88% 0.13 88 / 0.5), transparent 70%)", filter:"blur(40px)"}}/>
          <div style={{position:"relative"}}>
            <div className="eyebrow" style={{marginBottom:16}}>Visita nuestra casa</div>
            <h2 style={{fontSize:"clamp(38px, 5vw, 72px)", fontWeight:300, letterSpacing:"-0.03em", lineHeight:1, marginBottom:20}}>
              Cartagena<br/><span className="italic emerald-text">de Indias</span>
            </h2>
            <p style={{fontSize:16, color:"var(--bj-ink-soft)", maxWidth:520, margin:"0 auto 32px"}}>
              Calle 36 # 6-32, Calle San Agustín Chiquita. Te esperamos con una experiencia privada.
            </p>
            <div style={{display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap"}}>
              <button onClick={()=>navigate("contacto")} className="btn-aqua btn-aqua-emerald" style={{padding:"16px 30px"}}>Agendar visita</button>
              <button onClick={()=>navigate("catalogo")} className="btn-aqua" style={{padding:"16px 30px"}}>Ver catálogo online</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Home });
