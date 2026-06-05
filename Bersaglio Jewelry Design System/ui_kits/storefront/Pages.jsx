/* global React, IconArrow */
// Bersaglio storefront — Pages.jsx · faithful mirrors of production pages.
// Loaded after Shell.jsx, Screens.jsx, Sections.jsx, Overlays.jsx.

// ════════════════════════════════════════════════════════════════════
// NOSOTROS — mirror of js/pages/nosotros.js (11 sections)
// ════════════════════════════════════════════════════════════════════
const NOS_CHAPTERS = [
  { y: '2013', t: 'El Diálogo Inicial', d: 'El taller comenzó con un sueño, dedicación y visitas personalizadas directamente en los hogares de nuestros clientes. Este contacto íntimo nos enseñó que antes que una joya, el huésped busca sentirse seguro, asesorado y acompañado en su elección.' },
  { y: '2016', t: 'La Consagración del Espacio', d: 'Gracias a esta filosofía de servicio y cercanía, crecimos paso a paso. Abrimos las puertas de nuestro primer atelier privado en el centro histórico de Cartagena, un refugio para mantener esa atención pausada e individual.' },
  { y: '2020', t: 'Estándares y Confianza', d: 'Consolidamos nuestra reputación basándonos en la transparencia absoluta de cada gema. Cada esmeralda y diamante se entrega con trazabilidad total y certificación ética, reforzando la credibilidad y el valor real de cada inversión.' },
  { y: '2023', t: 'Una Década de Relaciones', d: 'Cumplimos diez años de trayectoria construyendo vínculos duraderos. El acompañamiento y asesoramiento personalizado se consolidan formalmente como el corazón absoluto de Bersaglio.' },
  { y: '2026', t: 'La Verde y la Esencia', d: 'Hoy, seguimos conservando intacta la misma esencia con la que iniciamos: ofrecer una experiencia cercana, elegante y completamente personalizada, donde cada cliente se siente especial y cada joya tiene un significado real.' },
];

const NOS_VALORES = [
  { n: '01', t: 'La Elegancia como Silencio', d: 'Entendemos la sofisticación no como un destello ruidoso, sino como un susurro de distinción. Una joya Bersaglio es la expresión poética de tu estilo y de tu esencia.' },
  { n: '02', t: 'El Pacto de Credibilidad', d: 'Construimos relaciones duraderas basadas en la transparencia, la credibilidad y una confianza inquebrantable que custodia tu tranquilidad.' },
  { n: '03', t: 'La Asesoría antes del Oficio', d: 'Antes que vender, nos dedicamos a guiarte y asesorarte con paciencia, asegurando que cada cliente encuentre o co-cree la pieza idónea.' },
  { n: '04', t: 'Devoción en cada Detalle', d: 'Cada milímetro esculpido y cada interacción con nosotros está cuidada con devoción, buscando hacer de tu experiencia un recuerdo memorable.' },
  { n: '05', t: 'Cómplices de tu Felicidad', d: 'Nos apasiona ser parte de tus momentos más significativos. Diseñamos con el orgullo de dar forma física a tus emociones y celebraciones sagradas.' },
  { n: '06', t: 'Valor e Inversión Eterna', d: 'Transmitimos a nuestros clientes que una joya no es un gasto efímero, sino una inversión duradera que conserva e incrementa su significado y valor en el tiempo.' },
];

const NOS_EQUIPO = [
  { n: 'Kary Mendoza',           r: 'Fundadora & Directora',     b: 'Diez años dedicada a escuchar con empatía las historias de nuestros clientes para traducirlas en obras de arte eternas. Su mirada sensible guía la selección de cada gema y supervisa el detalle final de cada pieza.' },
  { n: 'Maestro Eliécer Patiño', r: 'Orfebre principal',         b: 'Treinta y dos años de maestría y devoción orfebre. Formado bajo la tradición de la filigrana en Mompox y perfeccionado en Cartagena, domina la fundición a cera perdida y el engaste pavé de alta precisión.' },
  { n: 'Lucía Restrepo',         r: 'Gemóloga GIA',              b: 'Certificada por el prestigioso Gemological Institute of America (GIA). Es la guardiana de la excelencia gemológica de la Maison, analizando la pureza, color y procedencia de cada esmeralda y diamante.' },
  { n: 'Andrés Beltrán',         r: 'Diseño & dibujo técnico',   b: 'Traduce las conversaciones íntimas del atelier en bocetos poéticos a mano alzada, planos técnicos y modelados 3D meticulosos, sirviendo de puente entre el deseo del cliente y el crisol del orfebre.' },
];

const NOS_RESENAS = [
  { n: 'Valentina Restrepo',  t: 'Llegué sin saber muy bien qué quería y salí con la pieza de mis sueños. Kary entendió mi historia mejor que yo. El trato es de otro nivel.', loc: 'Reseña en Google Maps' },
  { n: 'Andrés Mejía',        t: 'Mandé hacer el anillo de compromiso y superó todo lo que imaginaba. Se siente el amor por el oficio en cada detalle. Mil gracias.', loc: 'Reseña en Google Maps' },
  { n: 'Camila Tordecilla',   t: 'Un lugar precioso en el Centro Histórico. Te reciben con un café y una paciencia que ya no se ve. La esmeralda quedó espectacular.', loc: 'Reseña en Google Maps' },
  { n: 'Juan Pablo Vergara',  t: 'Calidad real y honestidad. Me explicaron cada piedra con su certificado. Volveré sin duda para la próxima ocasión especial.', loc: 'Reseña en Google Maps' },
];

const NOS_FAQS = [
  { q: '¿Cuánto tarda una pieza a medida?',      a: 'Entre cuatro y seis semanas desde la aprobación del boceto. La primera conversación, los renders y los ajustes pueden sumar dos semanas adicionales. No aceleramos plazos: el oficio paciente no admite atajos.' },
  { q: '¿Trabajan con piedras del cliente?',     a: 'Sí. Recibimos gemas heredadas, las evaluamos con nuestra gemóloga, y las integramos en una pieza nueva. Si la talla original tiene daños, ofrecemos retalle previo en taller especializado.' },
  { q: '¿Hacen envíos internacionales?',         a: 'Sí, con seguro pleno declarado y entrega registrada por DHL Express o FedEx Priority. Despachamos a más de cuarenta países. Los aranceles del país destino corren por cuenta del cliente.' },
  { q: '¿Aceptan financiación?',                  a: 'Hasta tres cuotas sin interés con tarjetas locales. Para piezas sobre $50.000.000 COP estructuramos planes a seis o doce meses con entidades aliadas.' },
  { q: '¿Puedo visitar el atelier sin comprar?', a: 'Por supuesto. La cita previa es solo para garantizar que tengamos tiempo para ti. Recibirás un café, te mostraremos el taller, conocerás al maestro orfebre. Sin compromiso de compra.' },
  { q: '¿Qué garantía tienen las piezas?',       a: 'Garantía de por vida en estructura y engaste. Si una piedra se afloja, la reparamos sin costo. Si una soldadura cede, la rehacemos. Mientras Bersaglio exista, tu pieza tiene casa.' },
];

const NOS_STATS = [
  { n: '13',     l: 'años de oficio',    s: 'desde 2013' },
  { n: '+1.200', l: 'piezas entregadas', s: 'con libreta de origen' },
  { n: '40',     l: 'países alcanzados', s: 'envíos asegurados' },
  { n: '100%',   l: 'trazabilidad',      s: 'gema · oro · orfebre' },
];

const NOS_CERTS = [
  { t: 'Jewelers of America',           d: 'Miembro acreditado desde 2020' },
  { t: 'GIA',                            d: 'Reportes gemológicos en cada diamante' },
  { t: 'Muzo Origin',                   d: 'Certificación de mina en cada esmeralda' },
  { t: 'Responsible Jewellery Council', d: 'Trazabilidad de oro y prácticas éticas' },
];

const avatarInitials = (name) => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0] && parts[0][0]) || '') + ((parts[parts.length - 1] && parts[parts.length - 1][0]) || '');
};

function NosotrosScreen({ navigate }) {
  const [activeChapter, setActiveChapter] = React.useState(0);
  const [openFaq, setOpenFaq] = React.useState(0);
  const c = NOS_CHAPTERS[activeChapter];
  return (
    <div className="container abt-page">
      {/* 1. HERO */}
      <section className="abt-hero">
        <div className="abt-hero-text">
          <div className="mono abt-eyebrow">CAPÍTULO 00 · NUESTRA ALMA</div>
          <h1 className="abt-hero-title">
            Un legado<br />
            <span className="italic emerald-text abt-hero-title-em">se susurra,</span><br />
            no se compra.
          </h1>
          <p className="abt-hero-lead">Nacimos con una visión clara: acercar piezas únicas a quienes aprecian la elegancia y el valor de una joya auténtica. Nuestro viaje comenzó desde cero, visitando a nuestros clientes en la calidez de sus hogares, construyendo relaciones basadas en la confianza y en una cercanía que hoy se mantiene como el alma del atelier.</p>
          <p className="abt-hero-italic">Más que vender joyas, nos apasiona asesorar. Diseñamos con la convicción de que una pieza no es un simple accesorio, sino un reflejo de tu esencia, una emoción duradera y una inversión que trasciende en el tiempo.</p>
          <div className="abt-hero-actions">
            <button className="btn-aqua btn-aqua-emerald" onClick={() => navigate('contacto')}>
              Agendar una visita <IconArrow size={14} />
            </button>
            <button className="btn-aqua" onClick={() => navigate('catalogo')}>Ver colecciones</button>
          </div>
        </div>
        <div className="glass glass-iridescent abt-hero-image">
          <div className="abt-hero-image-bg" />
          <div className="abt-hero-image-shade" />
          <div className="abt-hero-image-content">
            <div className="mono abt-hero-image-eyebrow">ATELIER · CARTAGENA DE INDIAS</div>
            <div className="abt-hero-quote">"Nuestra casa es tu casa."</div>
            <div className="mono abt-hero-quote-author">— KARY MENDOZA</div>
          </div>
        </div>
      </section>

      {/* 2. STATS */}
      <section className="glass abt-stats">
        {NOS_STATS.map((k, i) => (
          <div key={i} className={'abt-stat' + (i > 0 ? ' abt-stat--bordered' : '')}>
            <div className="display abt-stat-num">{k.n}</div>
            <div className="abt-stat-label">{k.l}</div>
            <div className="mono abt-stat-sub">{k.s}</div>
          </div>
        ))}
      </section>

      {/* 3. MANIFIESTO */}
      <section className="abt-manifiesto">
        <h2 className="abt-manifiesto-title">
          Sostenemos que el lujo auténtico carece de estridencias.{' '}
          <span className="italic emerald-text">Es un secreto compartido entre dos personas</span>, esbozado en la calidez de nuestro atelier, donde el tiempo se detiene para dar vida a una creación que trascenderá nuestra propia existencia.
        </h2>
        <div className="abt-manifiesto-divider" />
        <div className="mono abt-manifiesto-foot">MAISON BERSAGLIO · CARTAGENA DE INDIAS</div>
      </section>

      {/* 4. FILOSOFÍA — Misión / Visión */}
      <section className="abt-section">
        <div className="filosofia-grid">
          <div className="glass glass-iridescent val-card">
            <div className="mono val-card-num">MISIÓN</div>
            <h3 className="val-card-title">Nuestra Promesa</h3>
            <p className="val-card-desc">Concebir piezas exclusivas mediante una asesoría íntima y cercana. Acompañamos a nuestros clientes en la elección de joyas que representen su distinción y los instantes más valiosos de su vida, asegurando siempre una experiencia de confianza, calidad y emotividad perdurable.</p>
          </div>
          <div className="glass glass-iridescent val-card">
            <div className="mono val-card-num">VISIÓN</div>
            <h3 className="val-card-title">El Horizonte</h3>
            <p className="val-card-desc">Ser el atelier de alta joyería personalizada de referencia en excelencia y discreción, consolidando un acompañamiento generacional que perpetúa el legado emocional de nuestros clientes a través de piezas de autor únicas que vencen al tiempo.</p>
          </div>
        </div>
      </section>

      {/* 5. VALORES */}
      <section className="abt-section">
        <div className="abt-section-header">
          <div className="mono abt-eyebrow">NUESTROS PRINCIPIOS</div>
          <h2 className="abt-section-title">Seis cosas en las que <span className="italic emerald-text">no negociamos</span></h2>
        </div>
        <div className="val-grid">
          {NOS_VALORES.map((v) => (
            <div key={v.n} className="glass glass-iridescent val-card">
              <div className="val-card-num-row">
                <div className="mono val-card-num">{v.n}</div>
                <div className="val-card-line" />
              </div>
              <div className="val-card-title">{v.t}</div>
              <p className="val-card-desc">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TIMELINE */}
      <section className="abt-section">
        <div className="abt-section-header">
          <h2 className="abt-section-title">Trece años en <span className="italic emerald-text">cinco capítulos</span></h2>
        </div>
        <div className="glass abt-timeline">
          <div className="abt-timeline-tabs">
            {NOS_CHAPTERS.map((ch, i) => (
              <button key={ch.y} type="button" className={'abt-timeline-tab' + (i === activeChapter ? ' is-active' : '')}
                onClick={() => setActiveChapter(i)}>
                <span className="mono abt-timeline-tab-year">{ch.y}</span>{ch.t}
              </button>
            ))}
          </div>
          <div className="abt-timeline-content tl-content">
            <div className="abt-timeline-side">
              <div className="display abt-timeline-year">{c.y}</div>
              <div className="abt-timeline-divider" />
            </div>
            <div className="abt-timeline-body">
              <div className="abt-timeline-title">{c.t}</div>
              <p className="abt-timeline-desc">{c.d}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ATELIER split */}
      <section className="atl-split">
        <div className="glass glass-iridescent atl-image">
          <div className="atl-image-bg" />
          <div className="chip glass-pill atl-chip">El Atelier</div>
        </div>
        <div className="glass atl-text">
          <h3 className="atl-text-title">Donde el oficio<br /><span className="italic emerald-text">toma forma</span></h3>
          <p className="atl-text-p">En el corazón del Centro Histórico de Cartagena tenemos nuestra casa: un espacio abierto al público donde te recibimos con calma y una atención cálida y personalizada. Aquí se conversa, se diseña y se crea — porque en Bersaglio no revendemos: fabricamos cada pieza.</p>
          <p className="atl-text-p">Kary y su equipo acompañan cada paso: desde la primera conversación y el boceto a mano, hasta dar vida a la joya y entregarla firmada. Un proceso cercano, sin prisas y hecho a la medida de tu historia.</p>
          <div className="atl-stats">
            <div>
              <div className="mono atl-stat-key">UBICACIÓN</div>
              <div className="atl-stat-val">Cartagena de Indias<br />Calle 36 # 6-32<br />San Agustín Chiquita · Centro Histórico<br />Bolívar, Colombia</div>
            </div>
            <div>
              <div className="mono atl-stat-key">VISITAS</div>
              <div className="atl-stat-val">Con o sin cita previa<br />Lun–Sáb · 10:00–19:00</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. EQUIPO */}
      <section className="abt-section">
        <div className="abt-section-header">
          <h2 className="abt-section-title">El equipo <span className="italic emerald-text">detrás del atelier</span></h2>
        </div>
        <div className="team-grid">
          {NOS_EQUIPO.map((p, i) => (
            <div key={p.n} className="glass glass-iridescent team-card">
              <div className="team-avatar" style={{ '--ti': i }}>
                <span className="team-avatar-letter">{avatarInitials(p.n)}</span>
              </div>
              <div className="team-name">{p.n}</div>
              <div className="mono team-role">{p.r}</div>
              <p className="team-bio">{p.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 9. CERTIFICACIONES */}
      <section className="glass glass-emerald cert-section" id="certificaciones">
        <div className="cert-grid">
          <div className="cert-side">
            <div className="mono cert-eyebrow">RESPALDOS Y CERTIFICACIONES</div>
            <h3 className="cert-title">Cada pieza viene con <span className="italic cert-title-em">papel y palabra</span></h3>
          </div>
          <div className="cert-list">
            {NOS_CERTS.map((c2) => (
              <div key={c2.t} className="cert-card">
                <div className="cert-card-title">{c2.t}</div>
                <div className="cert-card-desc">{c2.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. PRENSA */}
      <section className="abt-section">
        <div className="abt-section-header">
          <div className="mono abt-eyebrow">EN SUS PALABRAS</div>
          <h2 className="abt-section-title">Historias que <span className="italic emerald-text">nos confiaron</span></h2>
        </div>
        <div className="resena-grid">
          {NOS_RESENAS.map((p) => (
            <div key={p.n} className="glass glass-iridescent resena-card">
              <div className="resena-stars" aria-label="5 de 5 estrellas">
                {[0,1,2,3,4].map((i) => (
                  <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z" /></svg>
                ))}
              </div>
              <p className="resena-quote">{p.t}</p>
              <div className="resena-foot">
                <span className="resena-name">{p.n}</span>
                <span className="mono resena-src">{p.loc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="abt-section">
        <div className="abt-section-header">
          <h2 className="abt-section-title">Lo que <span className="italic emerald-text">suelen preguntarnos</span></h2>
        </div>
        <div className="glass faq-wrap">
          {NOS_FAQS.map((f, i) => (
            <div key={i} className={'faq-item' + (i < NOS_FAQS.length - 1 ? ' faq-item--bordered' : '')}>
              <button type="button" className="faq-trigger"
                aria-expanded={openFaq === i}
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                <span className="faq-q">{f.q}</span>
                <span className={'faq-toggle' + (openFaq === i ? ' is-open' : '')} aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                </span>
              </button>
              {openFaq === i && (
                <div className="faq-answer"><p>{f.a}</p></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 12. CTA final */}
      <section className="glass glass-iridescent abt-cta">
        <div className="abt-cta-glow" aria-hidden="true" />
        <div className="abt-cta-content">
          <div className="mono abt-eyebrow">EMPEZAMOS POR UNA CONVERSACIÓN</div>
          <h3 className="abt-cta-title">Tu próxima joya<br /><span className="italic emerald-text">comienza con un café</span></h3>
          <p className="abt-cta-lead">Agenda una visita al atelier o escríbenos. Sin compromiso, sin guion, sin prisas. Solo una conversación.</p>
          <div className="abt-cta-actions">
            <button className="btn-aqua btn-aqua-emerald" onClick={() => navigate('contacto')}>
              Hablemos <IconArrow size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// CONTACTO — mirror of js/pages/contacto.js (3-tab form + sidebar)
// ════════════════════════════════════════════════════════════════════
const CT_CANALES = [
  { k: 'whatsapp',  t: 'WhatsApp',         v: '+57 301 375 2592',           d: 'Respuesta inmediata · 09:00–20:00', href: 'https://wa.me/573013752592' },
  { k: 'email',     t: 'Correo',           v: 'info@bersagliojewelry.co',   d: 'Respondemos en < 24h',               href: 'mailto:info@bersagliojewelry.co' },
  { k: 'instagram', t: 'Instagram',        v: '@bersagliojewelry',          d: 'Mensaje directo',                    href: 'https://instagram.com/bersagliojewelry' },
];
const CT_CANAL_ICON = {
  whatsapp:  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.737-.979zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>,
  telefono:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
  email:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  instagram: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.4-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z" /></svg>,
};
const CT_HORAS = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const CT_HORARIOS = [
  { d: 'Lunes',     h: '10:00 – 19:00',         abierto: true },
  { d: 'Martes',    h: '10:00 – 19:00',         abierto: true },
  { d: 'Miércoles', h: '10:00 – 19:00',         abierto: true },
  { d: 'Jueves',    h: '10:00 – 19:00',         abierto: true },
  { d: 'Viernes',   h: '10:00 – 20:00',         abierto: true },
  { d: 'Sábado',    h: '10:00 – 18:00',         abierto: true },
  { d: 'Domingo',   h: 'Solo con cita previa',  abierto: false },
];
const CT_FAQS = [
  { q: '¿Necesito cita previa?',         a: 'No es obligatoria: puedes acercarte directamente o reservar una cita para una atención más dedicada. Ambas son bienvenidas.' },
  { q: '¿Hay parqueadero?',              a: 'En el Centro Histórico encuentras varios parqueaderos privados y seguros a pocos pasos del atelier.' },
  { q: '¿Puedo llevar acompañantes?',    a: 'Hasta tres personas. Indícalo al agendar para preparar el espacio.' },
  { q: '¿Atienden en otro idioma?',      a: 'Español e inglés. Francés e italiano con cita previa, informándolo al agendar.' },
];
const CT_MOTIVOS = [
  { k: 'asesoria',    t: 'Asesoría general',     d: 'Quiero conocer las colecciones' },
  { k: 'pieza',       t: 'Pieza a medida',       d: 'Tengo una idea o una historia' },
  { k: 'compromiso',  t: 'Anillo de compromiso', d: 'Asesoría privada y discreta' },
  { k: 'herencia',    t: 'Pieza heredada',       d: 'Restauración o reinterpretación' },
  { k: 'prensa',      t: 'Prensa & medios',      d: 'Editoriales y entrevistas' },
  { k: 'otro',        t: 'Otro motivo',          d: 'Cuéntame en el mensaje' },
];
const CT_PRESUPS = ['Definiendo', '< $5M', '$5M–$15M', '$15M–$50M', '> $50M'];
const CT_VISITA_MOTIVOS = [['asesoria', 'Asesoría general'], ['pieza', 'Pieza a medida'], ['compromiso', 'Anillo de compromiso'], ['evento', 'Evento especial'], ['otro', 'Otro']];
const CT_FRANJAS = [{ k: 'manana', t: 'Mañana', h: '09:00–12:00' }, { k: 'tarde', t: 'Tarde', h: '14:00–17:00' }, { k: 'noche', t: 'Final de tarde', h: '17:00–19:00' }];
const CT_URGENCIAS = [['normal', 'Sin prisa'], ['semana', 'Esta semana'], ['urgente', 'Hoy mismo']];
const CT_PROCESO = [
  { n: '01', t: 'Lectura Personal',     d: 'Tu mensaje es leído directamente por Kary Mendoza y su equipo. Prescindimos de respuestas automáticas o chatbots; valoramos el contacto humano desde el primer segundo.', tiempo: 'En el día' },
  { n: '02', t: 'Primer Diálogo',       d: 'Nos pondremos en contacto para entender mejor el contexto de tu joya: la historia detrás del encargo, el tipo de gema preferida y las expectativas de entrega.',                                tiempo: '< 24 horas' },
  { n: '03', t: 'Encuentro Pausado',    d: 'Agendamos una llamada de voz, chat directo o un café en nuestra Maison en el centro histórico de Cartagena. Una conversación íntima, sin presiones comerciales.',                              tiempo: 'A tu ritmo' },
  { n: '04', t: 'Manos a la Obra',      d: 'Si decides que Bersaglio sea el custodio de tu legado, damos vida a tu pieza paso a paso: del primer boceto a mano alzada hasta la creación final en nuestro taller, siempre con tu aprobación.',                  tiempo: 'A medida' },
];

const minDate = () => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split('T')[0]; };
const todayIdx = () => (new Date().getDay() + 6) % 7;

function ContactoScreen() {
  const [tab, setTab] = React.useState('mensaje');
  const [sent, setSent] = React.useState(false);
  const [form, setForm]   = React.useState({ n: '', e: '', tel: '', t: 'asesoria', presup: '', m: '' });
  const [visit, setVisit] = React.useState({ n: '', e: '', tel: '', fecha: '', hora: '10:00', personas: '1', motivo: 'asesoria', notas: '' });
  const [call, setCall]   = React.useState({ n: '', tel: '', franja: 'manana', urgencia: 'normal' });

  const updF = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const updV = (k, v) => setVisit((p) => ({ ...p, [k]: v }));
  const updC = (k, v) => setCall((p) => ({ ...p, [k]: v }));

  const onSubmit = (e) => { e.preventDefault(); setSent(true); };
  const today = CT_HORARIOS[todayIdx()];
  const TABS = [{ k: 'mensaje', t: 'Enviar mensaje' }, { k: 'visita', t: 'Agendar visita' }, { k: 'llamada', t: 'Pedir llamada' }];

  const successName = (tab === 'mensaje' ? form.n : tab === 'visita' ? visit.n : call.n) || 'distinguido huésped';
  const successMsg = tab === 'visita'
    ? `Confirmaremos los detalles de tu cita privada por canales directos para el ${visit.fecha || 'día solicitado'} a las ${visit.hora}. El atelier estará reservado exclusivamente para ti.`
    : tab === 'llamada'
      ? 'Nos comunicaremos contigo telefónicamente en la franja horaria establecida. Esperamos conversar pronto.'
      : 'Agradecemos tu confidencia. Kary Mendoza o un gemólogo del atelier se pondrá en contacto contigo en las próximas horas.';

  return (
    <div className="container ct-page">
      {/* HERO */}
      <section className="ct-hero">
        <div className="mono ct-hero-eyebrow">CONSERJERÍA PRIVADA</div>
        <h1 className="ct-hero-title">
          Un encuentro pausado,<br />
          <span className="italic emerald-text ct-hero-title-em">una esmeralda única,</span> un legado eterno.
        </h1>
        <p className="ct-hero-lead">Te invitamos a dar el primer paso. Elige la vía de comunicación que te resulte más cómoda; cada mensaje es atendido de manera directa y confidencial por Kary Mendoza y su equipo.</p>
      </section>

      {/* CANALES */}
      <section className="ct-canales canales-grid">
        {CT_CANALES.map((c) => (
          <a key={c.k} className="glass glass-iridescent canal-card" href={c.href}
            target={c.k === 'instagram' || c.k === 'whatsapp' ? '_blank' : undefined}
            rel={c.k === 'instagram' || c.k === 'whatsapp' ? 'noopener' : undefined}>
            <div className={'canal-icon canal-icon--' + c.k}>{CT_CANAL_ICON[c.k]}</div>
            <div>
              <div className="canal-title">{c.t}</div>
              <div className="mono canal-value">{c.v}</div>
              <div className="canal-desc">{c.d}</div>
            </div>
          </a>
        ))}
      </section>

      {/* MAIN ROW: form + sidebar */}
      <section className="contact-grid ct-mainrow">
        <div className="glass glass-iridescent ct-form-card">
          <div className="ct-tabbar" role="tablist">
            {TABS.map((opt) => (
              <button key={opt.k} type="button"
                className={'ct-tab' + (tab === opt.k ? ' is-active' : '')}
                role="tab" aria-selected={tab === opt.k}
                onClick={() => { setTab(opt.k); setSent(false); }}>{opt.t}</button>
            ))}
          </div>

          {sent ? (
            <div className="ct-success">
              <div className="ct-success-check" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
              <h3 className="ct-success-title">Recibido, <span className="italic emerald-text">{successName}</span></h3>
              <p className="ct-success-msg">{successMsg}</p>
              <button type="button" className="btn-aqua ct-success-again" onClick={() => setSent(false)}>Enviar otro</button>
            </div>
          ) : tab === 'mensaje' ? (
            <form className="ct-form" onSubmit={onSubmit} noValidate>
              <div className="ct-form-row ct-form-row--2">
                <label className="ct-field"><span className="eyebrow">Nombre completo<span className="ct-field-required">*</span></span>
                  <input className="ct-field-input" value={form.n} onChange={(e) => updF('n', e.target.value)} required /></label>
                <label className="ct-field"><span className="eyebrow">Email<span className="ct-field-required">*</span></span>
                  <input type="email" className="ct-field-input" value={form.e} onChange={(e) => updF('e', e.target.value)} required /></label>
              </div>
              <label className="ct-field"><span className="eyebrow">Teléfono / WhatsApp (opcional)</span>
                <input type="tel" className="ct-field-input" value={form.tel} onChange={(e) => updF('tel', e.target.value)} /></label>

              <div>
                <div className="eyebrow ct-section-label">¿Sobre qué quieres hablar?</div>
                <div className="motivo-grid">
                  {CT_MOTIVOS.map((mt) => (
                    <button key={mt.k} type="button"
                      className={'ct-motivo-card' + (form.t === mt.k ? ' is-active' : '')}
                      onClick={() => updF('t', mt.k)}>
                      <div className="ct-motivo-title">{mt.t}</div>
                      <div className="ct-motivo-desc">{mt.d}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="eyebrow ct-section-label">Rango de presupuesto (opcional)</div>
                <div className="ct-presup-row">
                  {CT_PRESUPS.map((p) => (
                    <button key={p} type="button"
                      className={'ct-presup-pill' + (form.presup === p ? ' is-active' : '')}
                      onClick={() => updF('presup', p)}>{p}</button>
                  ))}
                </div>
              </div>

              <label className="ct-field"><span className="eyebrow">Describe el motivo de tu inspiración</span>
                <textarea className="ct-field-input" rows={5} value={form.m}
                  placeholder="¿Qué historia o momento desea conmemorar? ¿Tiene alguna preferencia por una gema en particular?"
                  onChange={(e) => updF('m', e.target.value)} /></label>

              <div className="ct-form-foot">
                <div className="ct-discreto">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  Tus datos se tratan con discreción absoluta.
                </div>
                <button type="submit" className="btn-aqua btn-aqua-emerald ct-submit">Enviar mensaje
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </button>
              </div>
            </form>
          ) : tab === 'visita' ? (
            <form className="ct-form" onSubmit={onSubmit} noValidate>
              <div className="ct-banner ct-banner--visit">
                <div className="ct-banner-icon" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" /><path d="M6 1v3M10 1v3M14 1v3" /></svg></div>
                <div>
                  <div className="ct-banner-title">Cita Privada en la Maison</div>
                  <div className="ct-banner-desc">Centro Histórico, Cartagena · 60–90 min · Un espacio consagrado a tus ideas</div>
                </div>
              </div>
              <div className="ct-form-row ct-form-row--2">
                <label className="ct-field"><span className="eyebrow">Nombre completo<span className="ct-field-required">*</span></span>
                  <input className="ct-field-input" value={visit.n} onChange={(e) => updV('n', e.target.value)} required /></label>
                <label className="ct-field"><span className="eyebrow">Email<span className="ct-field-required">*</span></span>
                  <input type="email" className="ct-field-input" value={visit.e} onChange={(e) => updV('e', e.target.value)} required /></label>
              </div>
              <label className="ct-field"><span className="eyebrow">Teléfono / WhatsApp<span className="ct-field-required">*</span></span>
                <input type="tel" className="ct-field-input" value={visit.tel} onChange={(e) => updV('tel', e.target.value)} required /></label>
              <div className="ct-form-row visit-row">
                <label className="ct-field"><span className="eyebrow">Fecha preferida<span className="ct-field-required">*</span></span>
                  <input type="date" className="ct-field-input" min={minDate()} value={visit.fecha} onChange={(e) => updV('fecha', e.target.value)} required /></label>
                <label className="ct-field"><span className="eyebrow">Hora</span>
                  <select className="ct-field-input" value={visit.hora} onChange={(e) => updV('hora', e.target.value)}>
                    {CT_HORAS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select></label>
                <label className="ct-field"><span className="eyebrow">Personas</span>
                  <select className="ct-field-input" value={visit.personas} onChange={(e) => updV('personas', e.target.value)}>
                    {['1','2','3','4'].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select></label>
              </div>
              <div>
                <div className="eyebrow ct-section-label">Motivo de la visita</div>
                <div className="ct-pills">
                  {CT_VISITA_MOTIVOS.map(([k, l]) => (
                    <button key={k} type="button"
                      className={'ct-pill' + (visit.motivo === k ? ' is-active' : '')}
                      onClick={() => updV('motivo', k)}>{l}</button>
                  ))}
                </div>
              </div>
              <label className="ct-field"><span className="eyebrow">Notas (alergias, idioma preferido, accesibilidad...)</span>
                <textarea className="ct-field-input" rows={5} value={visit.notas}
                  placeholder="Cualquier detalle que nos ayude a recibirte mejor."
                  onChange={(e) => updV('notas', e.target.value)} /></label>
              <button type="submit" className="btn-aqua btn-aqua-emerald ct-submit ct-submit--start">Reservar mi visita
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </button>
            </form>
          ) : (
            <form className="ct-form" onSubmit={onSubmit} noValidate>
              <div className="ct-banner ct-banner--call">
                <div className="ct-banner-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg></div>
                <div>
                  <div className="ct-banner-title">Llamada Confidencial</div>
                  <div className="ct-banner-desc">Establezcamos una conversación telefónica en el horario de tu preferencia.</div>
                </div>
              </div>
              <div className="ct-form-row ct-form-row--2">
                <label className="ct-field"><span className="eyebrow">Nombre<span className="ct-field-required">*</span></span>
                  <input className="ct-field-input" value={call.n} onChange={(e) => updC('n', e.target.value)} required /></label>
                <label className="ct-field"><span className="eyebrow">Teléfono<span className="ct-field-required">*</span></span>
                  <input type="tel" className="ct-field-input" value={call.tel} onChange={(e) => updC('tel', e.target.value)} required /></label>
              </div>
              <div>
                <div className="eyebrow ct-section-label">Mejor franja horaria</div>
                <div className="ct-franja-grid">
                  {CT_FRANJAS.map((f) => (
                    <button key={f.k} type="button"
                      className={'ct-franja-card' + (call.franja === f.k ? ' is-active' : '')}
                      onClick={() => updC('franja', f.k)}>
                      <div className="ct-franja-title">{f.t}</div>
                      <div className="mono ct-franja-hour">{f.h}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="eyebrow ct-section-label">Urgencia</div>
                <div className="ct-pills">
                  {CT_URGENCIAS.map(([k, l]) => (
                    <button key={k} type="button"
                      className={'ct-pill' + (call.urgencia === k ? ' is-active' : '')}
                      onClick={() => updC('urgencia', k)}>{l}</button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-aqua btn-aqua-emerald ct-submit ct-submit--start">Pedir llamada
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </button>
            </form>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="ct-sidebar">
          <div className="glass glass-emerald ct-atelier">
            <div className="ct-map">
              <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className="ct-map-svg">
                <g stroke="oklch(85% 0.14 90)" strokeWidth="0.7" fill="none" opacity="0.5" strokeLinecap="round">
                  <path d="M-10 52 H410" /><path d="M-10 96 H410" /><path d="M-10 140 H410" />
                  <path d="M60 -10 V210" /><path d="M150 -10 V210" /><path d="M250 -10 V210" /><path d="M330 -10 V210" />
                  <path d="M-10 74 L410 124" opacity="0.35" />
                </g>
                <path d="M-10 176 Q120 160 240 178 T410 168" stroke="oklch(72% 0.09 220)" strokeWidth="3" fill="none" opacity="0.4" strokeLinecap="round" />
                <g fill="oklch(85% 0.14 90)" opacity="0.16">
                  <rect x="70" y="104" width="68" height="30" rx="2" /><rect x="160" y="58" width="78" height="32" rx="2" /><rect x="260" y="104" width="58" height="30" rx="2" />
                </g>
              </svg>
              <div className="ct-map-pin" aria-hidden="true">
                <div className="ct-map-pin-bubble"><div className="ct-map-pin-dot" /></div>
                <div className="ct-map-pin-label">Atelier</div>
              </div>
              <div className="ct-map-flag">CENTRO HISTÓRICO</div>
            </div>
            <div className="ct-atelier-body">
              <div className="mono ct-atelier-eyebrow">CASA BERSAGLIO</div>
              <div className="ct-atelier-title">Cartagena de Indias</div>
              <p className="ct-atelier-addr">Calle 36 # 6-32<br />San Agustín Chiquita · Centro Histórico<br />Bolívar, Colombia</p>
              <a href="https://maps.google.com/?q=Cartagena+Centro+Hist%C3%B3rico" target="_blank" rel="noopener" className="ct-atelier-mapbtn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                Abrir en mapas
              </a>
            </div>
          </div>

          <div className="glass ct-horarios">
            <div className="mono ct-horarios-eyebrow">HORARIOS DE ATENCIÓN</div>
            <ul className="ct-horarios-list">
              {CT_HORARIOS.map((h, i) => (
                <li key={h.d} className={'ct-horario-row' + (i < CT_HORARIOS.length - 1 ? ' ct-horario-row--bordered' : '') + (h.abierto ? '' : ' ct-horario-row--closed')}>
                  <span className="ct-horario-day">{h.d}</span>
                  <span className="mono ct-horario-hour">{h.h}</span>
                </li>
              ))}
            </ul>
            {today.abierto && (
              <div className="ct-horarios-status"><span className="ct-status-dot" /><span>Abierto hoy · {today.h}</span></div>
            )}
          </div>

          <div className="glass ct-respuesta">
            <div className="mono ct-respuesta-eyebrow">RESPUESTA GARANTIZADA</div>
            <div className="ct-respuesta-num">&lt; 24h</div>
            <div className="ct-respuesta-sub">en días hábiles</div>
          </div>
        </aside>
      </section>

      {/* PROCESO */}
      <section className="glass ct-proceso">
        <div className="ct-proceso-header">
          <div className="mono ct-proceso-eyebrow">QUÉ ESPERAR DE NOSOTROS</div>
          <h2 className="ct-proceso-title">Después de que <span className="italic emerald-text">nos escribes</span></h2>
        </div>
        <div className="ct-proceso-grid proc-grid">
          {CT_PROCESO.map((p) => (
            <div key={p.n} className="ct-proceso-step">
              <div className="ct-proceso-num">{p.n}</div>
              <div className="ct-proceso-stepname">{p.t}</div>
              <p className="ct-proceso-stepdesc">{p.d}</p>
              <div className="mono ct-proceso-time">{p.tiempo}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ rápido */}
      <section className="ct-faq-section">
        <div className="ct-faq-header">
          <div className="mono ct-faq-eyebrow">ANTES DE TU VISITA</div>
          <h3 className="ct-faq-title">Lo que necesitas <span className="italic emerald-text">saber</span></h3>
          <p className="ct-faq-lead">Cuatro respuestas rápidas para que llegues con todo claro. Si te queda alguna duda, escríbenos por WhatsApp.</p>
          <a href="https://wa.me/573013752592" target="_blank" rel="noopener" className="btn-aqua btn-aqua-emerald ct-faq-cta">
            Preguntar por WhatsApp
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </a>
        </div>
        <div className="ct-faq-grid">
          {CT_FAQS.map((f, i) => (
            <div key={i} className="glass glass-iridescent ct-faq-card">
              <div className="ct-faq-q">{f.q}</div>
              <p className="ct-faq-a">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// CARRITO — mirror of js/pages/carrito.js (3-step checkout stepper)
// ════════════════════════════════════════════════════════════════════
const CK_STEPS = ['Carrito', 'Envío', 'Pago'];
const CK_PAYMENT_OPTIONS = [
  { k: 'whatsapp',      t: 'Coordinar por WhatsApp',  d: 'Hablas directo con Kary, eliges el método de pago y los plazos.',         icon: <React.Fragment><path d="M20.5 3.5A11 11 0 0 0 3.4 17l-1.4 5.1 5.2-1.4A11 11 0 1 0 20.5 3.5z" /><path d="M8 10.5c.3 2 2 3.7 4 4.2 1 .3 1.9.1 2.5-.5" /></React.Fragment> },
  { k: 'transferencia', t: 'Transferencia bancaria',  d: 'Bancolombia o Davivienda. Te enviamos los datos por correo.',             icon: <React.Fragment><path d="M3 9h18v11H3z" /><path d="M3 9l9-6 9 6" /></React.Fragment> },
  { k: 'asesor',        t: 'Que un asesor me llame',  d: 'Preferimos hablar antes de avanzar. Te llamamos en menos de 4 horas hábiles.', icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /> },
];

function CarritoScreen({ items, onQty, onRemove, navigate }) {
  const [step, setStep] = React.useState(1);
  const [payment, setPayment] = React.useState('whatsapp');
  const [ship, setShip] = React.useState({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', country: 'Colombia', zip: '' });
  const updS = (k, v) => setShip((p) => ({ ...p, [k]: v }));
  const subtotal = items.reduce((s, i) => s + Number(i.price || 0) * (i.qty || 1), 0);
  const totalQty = items.reduce((s, i) => s + (i.qty || 1), 0);
  const empty = items.length === 0;
  const go = (n) => { if (empty && n > 1) return; setStep(Math.max(1, Math.min(3, n))); window.scrollTo({ top: 0, behavior: 'instant' }); };
  const onShipSubmit = (e) => { e.preventDefault(); if (!e.target.checkValidity()) { e.target.reportValidity(); return; } go(3); };

  return (
    <div className="container ck-page">
      <header className="ck-header">
        <div className="eyebrow">Checkout</div>
        <h1 className="ck-title">Finalizar <span className="italic emerald-text">compra</span></h1>
      </header>

      <nav className="glass ck-stepper" role="tablist" aria-label="Pasos del checkout">
        {CK_STEPS.map((s, i) => {
          const idx = i + 1;
          const disabled = empty && idx > 1;
          return (
            <button key={s} type="button"
              className={'ck-step' + (step === idx ? ' is-active' : '') + (disabled ? ' is-disabled' : '')}
              role="tab" aria-selected={step === idx} disabled={disabled}
              onClick={() => go(idx)}>
              <span className="mono ck-step-num">0{idx}</span>{s}
            </button>
          );
        })}
      </nav>

      <div className="ck-grid">
        <div className="glass ck-card">
          {/* STEP 1 — CART */}
          {step === 1 && (empty ? (
            <div className="ck-empty">
              <div className="ck-empty-icon" aria-hidden="true">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M6 2l-2 5v15h16V7l-2-5H6z" /><path d="M4 7h16M10 11a2 2 0 0 0 4 0" /></svg>
              </div>
              <h3 className="ck-empty-title">Tu carrito espera la primera pieza</h3>
              <p className="ck-empty-sub">Explora la colección. Cada pieza Bersaglio se elige con tiempo, con calma y con un café.</p>
              <div className="ck-empty-actions">
                <button className="btn-aqua btn-aqua-emerald" onClick={() => navigate('catalogo')}>Ver el catálogo</button>
                <button className="btn-aqua" onClick={() => navigate('contacto')}>Hablar con un asesor</button>
              </div>
            </div>
          ) : (
            <div className="ck-step-body">
              <h3 className="ck-step-title">Tus piezas</h3>
              <div className="ck-items">
                {items.map((i) => (
                  <article key={i.id} className="ck-item">
                    <a className="ck-item-img" style={{ background: `url('${i.img}') center/cover` }} />
                    <div className="ck-item-body">
                      <a className="ck-item-name">{i.name}</a>
                      <div className="mono ck-item-price">{fmt$(i.price)}</div>
                      <div className="ck-item-controls">
                        <div className="ck-qty">
                          <button type="button" className="ck-qty-btn" onClick={() => onQty(i.id, i.qty - 1)} aria-label="Restar uno">−</button>
                          <span className="mono ck-qty-val">{i.qty}</span>
                          <button type="button" className="ck-qty-btn" onClick={() => onQty(i.id, i.qty + 1)} aria-label="Sumar uno">+</button>
                        </div>
                        <button type="button" className="ck-item-remove" onClick={() => onRemove(i.id)}>Quitar</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="ck-step-footer">
                <button type="button" className="btn-aqua btn-aqua-emerald ck-cta" onClick={() => go(2)}>
                  Continuar al envío
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          ))}

          {/* STEP 2 — SHIPPING */}
          {step === 2 && (
            <div className="ck-step-body">
              <h3 className="ck-step-title">Información de envío</h3>
              <form className="ck-shipping" onSubmit={onShipSubmit} noValidate>
                <div className="ck-field-row ck-field-row--2">
                  <label className="ck-field"><span className="eyebrow">Nombre<span className="ck-field-required">*</span></span>
                    <input className="ck-field-input" value={ship.firstName} autoComplete="given-name" required onChange={(e) => updS('firstName', e.target.value)} /></label>
                  <label className="ck-field"><span className="eyebrow">Apellido<span className="ck-field-required">*</span></span>
                    <input className="ck-field-input" value={ship.lastName} autoComplete="family-name" required onChange={(e) => updS('lastName', e.target.value)} /></label>
                </div>
                <div className="ck-field-row ck-field-row--2">
                  <label className="ck-field"><span className="eyebrow">Email<span className="ck-field-required">*</span></span>
                    <input type="email" className="ck-field-input" value={ship.email} autoComplete="email" required onChange={(e) => updS('email', e.target.value)} /></label>
                  <label className="ck-field"><span className="eyebrow">Teléfono / WhatsApp<span className="ck-field-required">*</span></span>
                    <input type="tel" className="ck-field-input" value={ship.phone} autoComplete="tel" required onChange={(e) => updS('phone', e.target.value)} /></label>
                </div>
                <label className="ck-field"><span className="eyebrow">Dirección<span className="ck-field-required">*</span></span>
                  <input className="ck-field-input" value={ship.address} autoComplete="street-address" required onChange={(e) => updS('address', e.target.value)} /></label>
                <div className="ck-field-row ck-field-row--3">
                  <label className="ck-field"><span className="eyebrow">Ciudad<span className="ck-field-required">*</span></span>
                    <input className="ck-field-input" value={ship.city} autoComplete="address-level2" required onChange={(e) => updS('city', e.target.value)} /></label>
                  <label className="ck-field"><span className="eyebrow">País<span className="ck-field-required">*</span></span>
                    <input className="ck-field-input" value={ship.country} autoComplete="country-name" required onChange={(e) => updS('country', e.target.value)} /></label>
                  <label className="ck-field"><span className="eyebrow">Código postal</span>
                    <input className="ck-field-input" value={ship.zip} autoComplete="postal-code" onChange={(e) => updS('zip', e.target.value)} /></label>
                </div>
                <div className="ck-step-footer">
                  <button type="button" className="btn-aqua ck-back" onClick={() => go(1)}>← Volver</button>
                  <button type="submit" className="btn-aqua btn-aqua-emerald ck-cta">
                    Continuar al pago
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3 — PAYMENT */}
          {step === 3 && (
            <div className="ck-step-body">
              <h3 className="ck-step-title">Cómo quieres avanzar</h3>
              <p className="ck-step-lead">Las piezas Bersaglio son únicas y de alto valor: cerramos cada compra en conversación. Elige cómo prefieres coordinar.</p>
              <div className="ck-payment-list">
                {CK_PAYMENT_OPTIONS.map((opt) => (
                  <label key={opt.k}
                    className={'glass ck-payment' + (payment === opt.k ? ' is-active' : '')}
                    onClick={() => setPayment(opt.k)}>
                    <input type="radio" name="payment" value={opt.k} checked={payment === opt.k} readOnly className="ck-payment-radio" />
                    <div className="ck-payment-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{opt.icon}</svg>
                    </div>
                    <div className="ck-payment-body">
                      <div className="ck-payment-title">{opt.t}</div>
                      <div className="ck-payment-desc">{opt.d}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="ck-step-footer">
                <button type="button" className="btn-aqua ck-back" onClick={() => go(2)}>← Volver</button>
                <button type="button" className="btn-aqua btn-aqua-emerald ck-cta ck-confirm" onClick={() => navigate('gracias')}>
                  Confirmar · {fmt$(subtotal)}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {!empty && (
          <aside className="glass glass-emerald ck-summary">
            <div className="eyebrow ck-summary-eyebrow">Resumen</div>
            <div className="ck-summary-lines">
              <div className="ck-summary-row"><span>Subtotal · {totalQty} {totalQty === 1 ? 'pieza' : 'piezas'}</span><span className="mono">{fmt$(subtotal)}</span></div>
              <div className="ck-summary-row"><span>Envío asegurado</span><span className="mono">Cotizar</span></div>
              <div className="ck-summary-row"><span>IVA</span><span className="mono">incluido</span></div>
            </div>
            <div className="ck-summary-divider" />
            <div className="ck-summary-total">
              <span className="ck-summary-total-label">Total</span>
              <span className="mono ck-summary-total-val">{fmt$(subtotal)}</span>
            </div>
            <div className="ck-summary-note">Los precios se confirman al cierre con Kary. El envío internacional se cotiza por DHL Express o FedEx Priority.</div>
          </aside>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// JOURNAL — mirror of js/pages/journal.js (masthead · ticker · cover · archive)
// ════════════════════════════════════════════════════════════════════
const jrAuthorInitials = (author) => {
  const clean = String(author || '').replace(/^Por\s+/i, '').trim();
  const parts = clean.split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase();
};
const jrTruncate = (t, n) => { t = String(t || ''); return t.length <= n ? t : t.slice(0, n).replace(/\s+\S*$/, '') + '…'; };

function JournalScreen({ navigate, openEntrada }) {
  const feat = JOURNAL.find((e) => e.featured) || JOURNAL[0];
  const rest = JOURNAL.filter((e) => e !== feat);
  const side = rest.slice(0, 4);
  const ticker = [...JOURNAL_TICKER, ...JOURNAL_TICKER];
  const [subscribed, setSubscribed] = React.useState(false);
  const openE = (slug) => openEntrada ? openEntrada(slug) : navigate('entrada');
  return (
    <div className="container jr-page">
      <div className="jr-masthead">
        <div className="jr-masthead-brand">
          <div className="mono jr-est">{JOURNAL_ISSUE.est}</div>
          <div className="jr-est-divider" />
          <h1 className="jr-masthead-title">The <span className="italic">Bersaglio</span> Journal</h1>
        </div>
        <div className="jr-masthead-meta">
          <div className="mono jr-issue">{JOURNAL_ISSUE.number} · {feat.dateLong}</div>
        </div>
      </div>
      <div className="jr-masthead-line" />

      <div className="glass jr-ticker">
        <div className="mono jr-ticker-tag"><span className="jr-ticker-pulse" />EN VIVO</div>
        <div className="jr-ticker-clip">
          <div className="jr-ticker-track">
            {ticker.map((t, i) => (
              <span key={i} className="jr-ticker-item">{t}<span className="jr-ticker-diamond">◆</span></span>
            ))}
          </div>
        </div>
      </div>

      <div className="jr-fold">
        <article className="jr-cover">
          <a className="jr-cover-link" onClick={() => openE(feat.slug)}>
            <div className="jr-cover-imgwrap">
              <img src={feat.img} alt={feat.title} className="jr-cover-img" loading="eager" decoding="async" />
              <div aria-hidden="true" className="jr-cover-vignette" />
              <div className="jr-cover-flag-row">
                <span className="mono jr-cover-flag">{feat.section.toUpperCase()}</span>
                <span className="mono jr-cover-read">{feat.read} de lectura</span>
              </div>
              <div className="jr-cover-caption">
                <div className="mono jr-cover-kicker">{feat.kicker}</div>
              </div>
            </div>
            <h2 className="jr-cover-title">{feat.title}</h2>
            <p className="jr-cover-excerpt">
              <span className="jr-cover-dropcap">{feat.excerpt.charAt(0)}</span>{feat.excerpt.slice(1)}
            </p>
            <div className="jr-cover-meta">
              <div className="jr-cover-author-row">
                <div className="jr-cover-avatar">{jrAuthorInitials(feat.author)}</div>
                <div>
                  <div className="jr-cover-author">{feat.author}</div>
                  <div className="mono jr-cover-date">{(feat.dateLong || '').toUpperCase()}</div>
                </div>
              </div>
              <div className="jr-cover-continue">
                Continuar leyendo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </div>
            </div>
          </a>
        </article>

        <aside className="jr-side">
          <div className="jr-side-header">
            <h3 className="jr-side-title">Más leídos</h3>
            <div className="mono jr-side-week">ESTA SEMANA</div>
          </div>
          {side.map((s, i) => (
            <article key={s.slug} className="jr-side-row">
              <a className="jr-side-link" onClick={() => openE(s.slug)}>
                <div className="jr-side-num">0{i + 1}</div>
                <div>
                  <div className="mono jr-side-meta">
                    <span>{s.section}</span><span className="jr-side-meta-dot">·</span><span className="jr-side-meta-date">{s.date}</span>
                  </div>
                  <h4 className="jr-side-headline">{s.title}</h4>
                  <div className="mono jr-side-read">{s.read} de lectura</div>
                </div>
              </a>
            </article>
          ))}

          <div className="glass glass-emerald jr-newsletter">
            <div className="mono jr-newsletter-tag">NEWSLETTER</div>
            <div className="jr-newsletter-title">Una nota cada<br /><span className="italic jr-newsletter-italic">luna llena</span></div>
            {subscribed ? (
              <div className="hj-newsletter-thanks">Gracias. Te escribiremos pronto.</div>
            ) : (
              <form className="jr-newsletter-form" onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }}>
                <input type="email" name="email" placeholder="tu@correo.com" className="jr-newsletter-input" autoComplete="email" required />
                <button type="submit" className="jr-newsletter-btn">Suscribir</button>
              </form>
            )}
          </div>
        </aside>
      </div>

      {rest.length > 0 && (
        <section className="jr-archive">
          <div className="jr-archive-header">
            <div className="mono jr-archive-eyebrow">EL ARCHIVO COMPLETO</div>
            <h2 className="jr-archive-title">Todas las entradas <span className="italic emerald-text">del Journal</span></h2>
          </div>
          <div className="jr-archive-grid">
            {rest.map((e) => (
              <article key={e.slug} className="glass jr-archive-card">
                <a className="jr-archive-link" onClick={() => openE(e.slug)}>
                  <div className="jr-archive-imgwrap">
                    <img src={e.img} alt={e.title} className="jr-archive-img" loading="lazy" decoding="async" />
                    <div aria-hidden="true" className="jr-archive-vignette" />
                    <span className="mono jr-archive-flag">{e.section.toUpperCase()}</span>
                  </div>
                  <div className="jr-archive-body">
                    <div className="mono jr-archive-meta">
                      <span>{e.date}</span><span className="jr-archive-meta-dot">·</span><span>{e.read} de lectura</span>
                    </div>
                    <h3 className="jr-archive-headline">{e.title}</h3>
                    <p className="jr-archive-excerpt">{jrTruncate(e.excerpt, 140)}</p>
                    <div className="jr-archive-foot">
                      <span className="mono jr-archive-author">{e.author}</span>
                      <span className="jr-archive-arrow">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                      </span>
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="glass glass-iridescent jr-cta">
        <div className="jr-cta-glow" aria-hidden="true" />
        <div className="jr-cta-content">
          <div className="mono jr-cta-eyebrow">DETRÁS DE CADA TEXTO HAY UNA PIEZA</div>
          <h3 className="jr-cta-title">Cuéntanos qué te <span className="italic emerald-text">inspira</span></h3>
          <p className="jr-cta-lead">Si una entrada te movió, escríbenos. Nuestras mejores piezas nacen de conversaciones que empiezan así.</p>
          <div className="jr-cta-actions">
            <button className="btn-aqua btn-aqua-emerald" onClick={() => navigate('contacto')}>Hablemos</button>
            <button className="btn-aqua" onClick={() => navigate('catalogo')}>Ver colecciones</button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ENTRADA — mirror of js/pages/entrada.js (single journal post)
// ════════════════════════════════════════════════════════════════════
function EntradaScreen({ entrySlug, navigate, openEntrada }) {
  const entry = JOURNAL.find((e) => e.slug === entrySlug);
  const [copied, setCopied] = React.useState(false);
  const openE = (slug) => openEntrada ? openEntrada(slug) : navigate('journal');
  if (!entry) {
    return (
      <div className="container en-page">
        <nav className="en-breadcrumb">
          <a className="en-crumb" onClick={() => navigate('home')}>Inicio</a>
          <span className="en-crumb-sep" aria-hidden="true">→</span>
          <a className="en-crumb" onClick={() => navigate('journal')}>Journal</a>
        </nav>
        <div className="glass en-notfound">
          <div className="en-notfound-icon" aria-hidden="true">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="en-notfound-title">Esta entrada se mudó del archivo</h1>
          <p className="en-notfound-sub">Quizá la retiramos o el enlace cambió. Explora el resto del Journal.</p>
          <button className="btn-aqua btn-aqua-emerald" onClick={() => navigate('journal')}>Ver todas las entradas</button>
        </div>
      </div>
    );
  }
  const body = entry.body || entry.excerpt;
  const paragraphs = String(body).split(/\n\s*\n/).filter(Boolean);
  const related = JOURNAL.filter((e) => e.slug !== entry.slug && e.section === entry.section).slice(0, 3);
  while (related.length < 3) {
    const filler = JOURNAL.find((e) => e.slug !== entry.slug && !related.includes(e));
    if (!filler) break;
    related.push(filler);
  }
  const copy = () => {
    const url = `https://bersagliojewelry.co/entrada.html?e=${encodeURIComponent(entry.slug)}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2200);
  };
  return (
    <div className="container en-page">
      <nav className="en-breadcrumb" aria-label="Migas de pan">
        <a className="en-crumb" onClick={() => navigate('home')}>Inicio</a>
        <span className="en-crumb-sep" aria-hidden="true">→</span>
        <a className="en-crumb" onClick={() => navigate('journal')}>Journal</a>
        <span className="en-crumb-sep" aria-hidden="true">→</span>
        <span className="en-crumb en-crumb-current">{entry.section}</span>
      </nav>

      <header className="en-hero">
        <div className="en-hero-flags">
          <span className="mono en-flag-section">{entry.section.toUpperCase()}</span>
          <span className="en-flag-divider" />
          <span className="mono en-flag-kicker">{entry.kicker}</span>
        </div>
        <h1 className="en-title">{entry.title}</h1>
        <div className="en-hero-meta">
          <div className="en-hero-author-row">
            <div className="en-hero-avatar">{jrAuthorInitials(entry.author)}</div>
            <div>
              <div className="en-hero-author">{entry.author}</div>
              <div className="mono en-hero-role">{entry.authorRole || ''}</div>
            </div>
          </div>
          <div className="en-hero-meta-right">
            <span className="mono en-hero-date">{entry.dateLong || entry.date}</span>
            <span className="en-hero-meta-divider" />
            <span className="mono en-hero-read">{entry.read} de lectura</span>
          </div>
        </div>
      </header>

      <figure className="glass glass-iridescent en-featured">
        <img src={entry.img} alt={entry.title} className="en-featured-img" loading="eager" decoding="async" />
      </figure>

      <div className="en-layout">
        <article className="en-body">
          {paragraphs.map((p, i) => i === 0 ? (
            <p key={i} className="en-body-p en-body-p--lede">
              <span className="en-dropcap">{p.charAt(0)}</span>{p.slice(1)}
            </p>
          ) : (
            <p key={i} className="en-body-p">{p}</p>
          ))}
        </article>

        <aside className="en-share" aria-label="Compartir entrada">
          <div className="mono en-share-label">COMPARTIR</div>
          <div className="en-share-btns">
            <a className="en-share-btn" href={`https://wa.me/?text=${encodeURIComponent(entry.title)}%20${encodeURIComponent('https://bersagliojewelry.co/entrada.html?e=' + entry.slug)}`} target="_blank" rel="noopener" aria-label="Compartir por WhatsApp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 3.4 17l-1.4 5.1 5.2-1.4A11 11 0 1 0 20.5 3.5zM12 20c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3.1-.2-.3C4.4 14.9 4 13.5 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8z" /></svg>
            </a>
            <a className="en-share-btn" href={`mailto:?subject=${encodeURIComponent(entry.title)}&body=${encodeURIComponent('https://bersagliojewelry.co/entrada.html?e=' + entry.slug)}`} aria-label="Enviar por correo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            </a>
            <button className="en-share-btn" type="button" onClick={copy} aria-label="Copiar enlace">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            </button>
            <span className="en-share-feedback">{copied ? '✓ Enlace copiado' : ''}</span>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="en-related">
          <div className="en-related-header">
            <div className="mono en-related-eyebrow">SEGUIR LEYENDO</div>
            <h2 className="en-related-title">Más de <span className="italic emerald-text">{entry.section}</span></h2>
          </div>
          <div className="en-related-grid">
            {related.map((r) => (
              <article key={r.slug} className="glass en-related-card">
                <a className="en-related-link" onClick={() => openE(r.slug)}>
                  <div className="en-related-imgwrap">
                    <img src={r.img} alt={r.title} className="en-related-img" loading="lazy" decoding="async" />
                  </div>
                  <div className="en-related-body">
                    <div className="mono en-related-meta">
                      <span>{r.section}</span><span className="en-related-meta-dot">·</span><span>{r.read}</span>
                    </div>
                    <h3 className="en-related-headline">{r.title}</h3>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="en-back">
        <button className="btn-aqua en-back-btn" onClick={() => navigate('journal')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          Volver al Journal
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// LISTA DE DESEOS — mirror of js/pages/lista-deseos.js (.wl-* classes)
// ════════════════════════════════════════════════════════════════════
function ListaDeseosScreen({ wishlist: wl, items, onToggleWish, onAddCart, onClear, navigate }) {
  const rows = wl.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  const shareURL = (() => {
    const lines = rows.map((p) => `• ${p.name}\n  https://bersagliojewelry.co/pieza.html?p=${p.slug || p.id}`);
    const msg = `Hola Bersaglio, me interesan estas piezas de mi lista:\n\n${lines.join('\n\n')}`;
    return `https://wa.me/573013752592?text=${encodeURIComponent(msg)}`;
  })();
  return (
    <div className="container wl-page">
      <section className="wl-hero">
        <div className="eyebrow wl-hero-eyebrow">Tus favoritas · {rows.length}</div>
        <h1 className="wl-hero-title">Lista de <span className="italic emerald-text">deseos</span></h1>
        <p className="wl-hero-lead">Las piezas que te detuvieron. Vuelve cuando quieras, comparte con quien quieras, agrega al carrito cuando estés lista.</p>
      </section>

      {rows.length === 0 ? (
        <div className="wl-empty">
          <div className="wl-empty-icon" aria-hidden="true">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h2 className="wl-empty-title">Tu lista está vacía</h2>
          <p className="wl-empty-sub">Guarda piezas que te inspiren tocando el corazón en cualquier ficha.</p>
          <button className="btn-aqua btn-aqua-emerald" onClick={() => navigate('catalogo')}>Explorar el catálogo</button>
        </div>
      ) : (
        <React.Fragment>
          <div className="wl-grid">
            {rows.map((p) => {
              const inCart = items.some((i) => i.id === p.id);
              return (
                <article key={p.id} className="glass glass-iridescent wl-card">
                  <a className="wl-card-imglink">
                    <div className="wl-card-img" style={{ background: `url('${p.img}') center/cover` }} />
                    <div className="wl-card-vignette" aria-hidden="true" />
                  </a>
                  <div className="wl-card-body">
                    <a className="wl-card-name">{p.name}</a>
                    <div className="mono wl-card-price">{fmt$(p.price)}</div>
                    <div className="wl-card-actions">
                      <button type="button"
                        className={'wl-card-cart' + (inCart ? ' is-in-cart' : '')}
                        onClick={() => onAddCart(p)}>{inCart ? 'En carrito' : 'Al carrito'}</button>
                      <button type="button" className="wl-card-remove" aria-label="Quitar de favoritos"
                        onClick={() => onToggleWish(p.id)}>Quitar</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="wl-actions">
            <a href={shareURL} target="_blank" rel="noopener noreferrer" className="btn-aqua btn-aqua-emerald wl-share-btn">
              Consultar lista por WhatsApp
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </a>
            <button type="button" className="btn-aqua wl-clear-btn" onClick={() => { if (confirm('¿Vaciar toda la lista de deseos?')) onClear(); }}>Vaciar la lista</button>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// GRACIAS — mirror of js/pages/gracias.js (confirmation, .lg-page--gracias)
// ════════════════════════════════════════════════════════════════════
const GR_MESSAGES = {
  transferencia: { eyebrow: 'TRANSFERENCIA BANCARIA', title: <React.Fragment>Una elección excepcional. Iniciamos la creación de tu <span className="italic emerald-text">pieza</span>.</React.Fragment>, body: 'En las próximas horas te enviaremos el detalle y la confirmación de tu encargo por correo privado. Al confirmarse la transferencia bancaria, nuestro atelier dará inicio a la confección y coordinaremos el envío asegurado.', nextLabel: 'Bitácora enviada en menos de 24 horas hábiles' },
  asesor:        { eyebrow: 'ASESOR PRIVADO', title: <React.Fragment>Un encuentro en la distancia. Te <span className="italic emerald-text">llamamos</span> pronto.</React.Fragment>, body: 'Kary Mendoza o un gemólogo del atelier se comunicará contigo de forma confidencial en menos de cuatro horas. Compartiremos referencias, responderemos tus dudas y agendaremos, si lo deseas, una videollamada o cita presencial.', nextLabel: 'Contacto en menos de 4 horas hábiles' },
  visita:        { eyebrow: 'CITA PRIVADA CONCERTADA', title: <React.Fragment>Cartagena de Indias te espera. El café <span className="italic emerald-text">estará listo</span>.</React.Fragment>, body: 'Confirmaremos tu cita privada de forma directa. El atelier estará cerrado exclusivamente para ti; Kary Mendoza te recibirá personalmente en Casa San Agustín.', nextLabel: 'Confirmación directa en pocas horas' },
  llamada:       { eyebrow: 'LLAMADA CONFIDENCIAL RESERVADA', title: <React.Fragment>Conversación de <span className="italic emerald-text">intención</span>.</React.Fragment>, body: 'Nos comunicaremos en el horario solicitado para iniciar un diálogo pausado. Si prefieres reprogramar por WhatsApp o cambiar de vía de contacto, estamos enteramente a tu disposición.', nextLabel: 'Te llamamos en el horario solicitado' },
  mensaje:       { eyebrow: 'CONFIDENCIA RECIBIDA', title: <React.Fragment>Agradecemos tu confianza. Te <span className="italic emerald-text">respondemos</span> en persona.</React.Fragment>, body: 'Tu mensaje es atendido de forma confidencial y directa por Kary Mendoza o un especialista del atelier. Prescindimos de asistentes virtuales; valoramos el tiempo y el trato humano.', nextLabel: 'Respuesta en menos de 24 horas hábiles' },
  default:       { eyebrow: 'CORTESÍA BERSAGLIO', title: <React.Fragment>Te <span className="italic emerald-text">escribimos</span> de manera directa.</React.Fragment>, body: 'Hemos recibido tu solicitud. Un gemólogo de nuestro atelier se pondrá en contacto contigo a la brevedad. Mientras tanto, te invitamos a explorar el catálogo o leer el Journal.', nextLabel: 'Contacto en menos de 24 horas hábiles' },
};

function GraciasScreen({ method = 'default', navigate }) {
  const msg = GR_MESSAGES[method] || GR_MESSAGES.default;
  return (
    <div className="container lg-page lg-page--gracias">
      <section className="lg-hero">
        <div className="lg-check" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <div className="mono lg-eyebrow">{msg.eyebrow}</div>
        <h1 className="lg-title">{msg.title}</h1>
        <p className="lg-body">{msg.body}</p>
        <div className="lg-pill" aria-label="Tiempo estimado">
          <span className="lg-pill-dot" />{msg.nextLabel}
        </div>
        <div className="lg-actions">
          <button className="btn-aqua btn-aqua-emerald" onClick={() => navigate('catalogo')}>Ver colecciones</button>
          <button className="btn-aqua" onClick={() => navigate('journal')}>Leer el Journal</button>
        </div>
      </section>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// LEGAL — shared layout for Términos & Privacidad (mirror of legal.css .lg-*)
// ════════════════════════════════════════════════════════════════════
function LegalScreen({ eyebrow, title, sub, sections, lastUpdate, foot, navigate }) {
  return (
    <div className="container lg-page">
      <header className="lg-pagehero">
        <div className="mono lg-eyebrow">DOCUMENTACIÓN LEGAL</div>
        <h1 className="lg-pagehero-title">{eyebrow} <span className="italic emerald-text">{title}</span></h1>
        <p className="lg-pagehero-sub">{sub}</p>
        <div className="mono lg-update">Última actualización · {lastUpdate}</div>
      </header>
      <div className="lg-layout">
        <aside className="lg-toc" aria-label="Tabla de contenidos">
          <div className="mono lg-toc-eyebrow">EN ESTA PÁGINA</div>
          <ol className="lg-toc-list">
            {sections.map((s) => (
              <li key={s.id}><a className="lg-toc-link" href={`#${s.id}`}>
                <span className="mono lg-toc-num">{s.n}</span>{s.title}
              </a></li>
            ))}
          </ol>
        </aside>
        <article className="lg-prose">
          {sections.map((s) => {
            const paragraphs = String(s.body).split(/\n\s*\n/).filter(Boolean);
            return (
              <section key={s.id} id={s.id} className="lg-section">
                <div className="lg-section-head">
                  <span className="mono lg-section-num">{s.n}</span>
                  <h2 className="lg-section-title">{s.title}</h2>
                </div>
                <div className="lg-section-body">
                  {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </section>
            );
          })}
        </article>
      </div>
      <div className="lg-foot">
        <p>{foot}</p>
        <button className="btn-aqua lg-back-btn" onClick={() => navigate('home')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

const TERMINOS_SECTIONS = [
  { id: 'objeto',         n: '01', title: 'Objeto',                       body: `Estos términos regulan la relación entre Bersaglio Jewelry (en adelante, "el Atelier") y la persona que adquiere productos o servicios a través del sitio web bersagliojewelry.co, del atelier físico en Cartagena de Indias o de cualquier canal directo (WhatsApp, correo electrónico, llamada telefónica).\n\nAl usar el sitio o iniciar una compra, aceptas estos términos en su totalidad. Si no estás de acuerdo, te pedimos cerrar la pestaña y no proceder.` },
  { id: 'productos',      n: '02', title: 'Productos y precios',          body: `Cada pieza Bersaglio es única o producida en series muy limitadas. Las fotografías son fieles; sin embargo, debido a variaciones de luz, calibración de pantalla y la naturaleza misma de las gemas naturales, el color real puede presentar diferencias mínimas respecto a la imagen.\n\nLos precios se expresan en pesos colombianos (COP) y ya incluyen el IVA del 19%. Los envíos internacionales pueden generar aranceles y trámites aduaneros del país destino que corren por cuenta del comprador. Los precios pueden variar sin previo aviso, pero una vez confirmada una compra el precio queda bloqueado.` },
  { id: 'cierre-compra',  n: '03', title: 'Cierre de compra',             body: `Por la naturaleza de alta gama de cada pieza, todas las compras se cierran en conversación con un asesor: WhatsApp, correo, llamada o visita al atelier. No procesamos pagos automáticos directos en el sitio web.\n\nMétodos de pago aceptados: transferencia bancaria (Bancolombia, Davivienda), tarjetas Visa/Mastercard procesadas presencial o vía link de pago, financiación hasta 12 meses con entidades aliadas para piezas superiores a $50.000.000 COP.` },
  { id: 'envios',         n: '04', title: 'Envíos',                       body: `Despachos nacionales (Colombia): envío gratuito con seguro pleno por Servientrega Premium, 2-5 días hábiles dependiendo de la ciudad.\n\nDespachos internacionales: DHL Express o FedEx Priority con seguro declarado por el valor total de la pieza, 5-8 días hábiles, entrega registrada con firma. Aranceles e impuestos del país destino son responsabilidad del comprador.\n\nCada pieza viaja en estuche de presentación Bersaglio, con libreta de origen (mina de la gema, oficio del orfebre, certificación GIA si aplica) y certificado de garantía de por vida.` },
  { id: 'garantia',       n: '05', title: 'Garantía',                     body: `Toda pieza Bersaglio cuenta con garantía de por vida en estructura y engaste. Esto incluye: reparación gratuita si una piedra se afloja, restauración si una soldadura cede, redimensionado de anillos hasta dos tallas arriba/abajo (un servicio por pieza), limpieza profesional y pulido (un servicio anual sin costo).\n\nLa garantía no cubre: daño por golpe directo (caída sobre piedra), exposición prolongada a químicos abrasivos (cloro, ammonia, blanqueador), modificación realizada por terceros ajenos al Atelier, robo o pérdida.` },
  { id: 'devoluciones',   n: '06', title: 'Devoluciones y cambios',       body: `Piezas a medida: por su naturaleza única, las piezas diseñadas a medida no admiten devolución. Sí admitimos cambios en boceto y prototipo de cera previo a la fundición, sin costo adicional, hasta tres iteraciones.\n\nPiezas de catálogo: aceptamos cambio (no reembolso en efectivo) dentro de los 15 días hábiles siguientes a la entrega, siempre que la pieza llegue en condiciones impecables, con estuche, libreta y certificado. El cliente cubre el costo de envío del cambio.` },
  { id: 'propiedad',      n: '07', title: 'Propiedad intelectual',        body: `Todas las imágenes, textos, diseños y videos publicados en bersagliojewelry.co son propiedad de Bersaglio Jewelry o se usan bajo licencia. Está prohibida su reproducción total o parcial sin autorización expresa por escrito.\n\nLos diseños de joyas Bersaglio están protegidos por derecho de autor. Está prohibida la reproducción industrial o artesanal de las piezas, incluyendo aquellas hechas a medida para clientes específicos.` },
  { id: 'modificaciones', n: '08', title: 'Modificaciones',               body: `Podemos actualizar estos términos en cualquier momento. La versión vigente es siempre la publicada en esta página, con la fecha de última actualización al inicio. Te recomendamos revisarlos periódicamente.` },
  { id: 'jurisdiccion',   n: '09', title: 'Ley aplicable y jurisdicción', body: `Estos términos se rigen por la ley colombiana. Cualquier controversia se someterá a los tribunales competentes de Cartagena de Indias, salvo cuando la ley de protección al consumidor disponga otra cosa.` },
];

const PRIVACIDAD_SECTIONS = [
  { id: 'compromiso',        n: '01', title: 'Nuestro compromiso',          body: `Bersaglio Jewelry trata tus datos personales con el mismo cuidado con el que tratamos una esmeralda Muzo Vieja: con paciencia, con discreción, y con la certeza de que cada decisión sobre tu información debe pasar primero por la pregunta "¿esto es necesario para servirte mejor?".\n\nEsta política explica qué datos recolectamos, por qué, cómo los protegemos y qué derechos tienes sobre ellos.` },
  { id: 'responsable',       n: '02', title: 'Responsable del tratamiento', body: `Bersaglio Jewelry S.A.S., NIT en proceso de actualización, con domicilio en Calle 36 # 6-32, San Agustín Chiquita, Centro Histórico, Cartagena de Indias, Bolívar, Colombia.\n\nContacto del responsable: info@bersagliojewelry.co · WhatsApp +57 301 375 2592.` },
  { id: 'datos-recolectados',n: '03', title: 'Datos que recolectamos',      body: `Datos de contacto: nombre, apellido, correo electrónico, número de teléfono o WhatsApp, dirección postal.\n\nDatos de pedido: piezas que has consultado o adquirido, métodos de pago utilizados (procesados por terceros, nunca almacenamos números de tarjeta), historial de conversaciones por WhatsApp o correo.\n\nDatos de navegación: páginas visitadas en bersagliojewelry.co, tiempo en cada página, dispositivo y navegador usados, IP aproximada (recolectados vía cookies y Google Analytics si has aceptado el consentimiento de cookies).\n\nDatos opcionales: cualquier información adicional que decidas compartir al contactarnos (presupuesto orientativo, ocasión, gemas de tu interés, gemas heredadas que quieras integrar).` },
  { id: 'finalidad',         n: '04', title: 'Finalidad del tratamiento',   body: `Atender tus solicitudes de información, asesoría o compra. Procesar pedidos y coordinar envíos. Enviarte el newsletter mensual del Atelier si te has suscrito (con derecho a cancelar en cualquier momento desde el enlace en cada correo).\n\nMejorar nuestro servicio: analizamos datos agregados de navegación para entender qué piezas atraen más interés, qué páginas se leen más, qué dudas suelen surgir. Nunca usamos datos individuales para perfilamiento publicitario.` },
  { id: 'compartir',         n: '05', title: 'Con quién compartimos tus datos', body: `Nunca vendemos ni cedemos tus datos a terceros con fines comerciales.\n\nCompartimos información estrictamente necesaria con: empresas de mensajería (DHL, FedEx, Servientrega) para coordinar envíos; pasarelas de pago (Wompi, link de pago bancario) cuando realizas una compra; servicios técnicos (Firebase de Google, Brevo para correo transaccional) que alojan o procesan datos bajo acuerdos de confidencialidad y conformidad con regulación de protección de datos.\n\nEn el caso de autoridades judiciales o regulatorias, cumpliremos con cualquier solicitud formal y debidamente notificada por estos canales.` },
  { id: 'derechos',          n: '06', title: 'Tus derechos',                body: `Tienes derecho a conocer, actualizar, rectificar y suprimir tus datos personales en cualquier momento. Para ejercer estos derechos, escribe a info@bersagliojewelry.co con asunto "Datos personales" y te responderemos en máximo 10 días hábiles.\n\nTambién puedes solicitar una copia de toda la información que tenemos sobre ti, oponerte al uso de cookies analíticas, o revocar tu suscripción al newsletter desde cualquier correo que recibas. Ningún ejercicio de derechos afecta el servicio que prestamos.` },
  { id: 'cookies',           n: '07', title: 'Cookies',                     body: `Usamos cookies estrictamente necesarias (para que el sitio funcione, recordar tu carrito y lista de deseos) y cookies analíticas opcionales (Google Analytics) que solo se activan tras tu consentimiento explícito en el banner.\n\nPuedes rechazar las cookies opcionales sin afectar tu experiencia. El banner aparece en tu primera visita; tu decisión queda guardada localmente en tu navegador.` },
  { id: 'seguridad',         n: '08', title: 'Seguridad',                   body: `Todos los datos viajan cifrados (HTTPS / TLS 1.3) y se almacenan en infraestructura de Google Cloud con cifrado en reposo. Los accesos al panel administrativo requieren autenticación multifactor.\n\nNunca almacenamos números completos de tarjetas de crédito; las pasarelas de pago manejan esa información bajo certificación PCI-DSS.` },
  { id: 'menores',           n: '09', title: 'Menores de edad',             body: `Nuestros servicios están dirigidos a personas mayores de 18 años. No recolectamos conscientemente datos de menores de edad. Si detectamos información de un menor, la eliminamos de inmediato.` },
  { id: 'cambios',           n: '10', title: 'Cambios a esta política',     body: `Podemos actualizar esta política para reflejar cambios legales, técnicos o de negocio. La versión vigente es siempre la publicada en esta página, con la fecha de última actualización al inicio. Si hacemos un cambio sustantivo (por ejemplo, agregar un nuevo destinatario de datos), te avisaremos por correo electrónico si te has suscrito.` },
];

function TerminosScreen({ navigate }) {
  return (
    <LegalScreen
      eyebrow="Términos y" title="condiciones"
      sub="Cómo funcionan las compras, los envíos, la garantía y los cambios en Bersaglio Jewelry. Texto plano, sin trampas."
      sections={TERMINOS_SECTIONS}
      lastUpdate="2026-04-12"
      foot={<React.Fragment>¿Una duda específica? Escríbenos a <a href="mailto:info@bersagliojewelry.co">info@bersagliojewelry.co</a> o por <a href="https://wa.me/573013752592" target="_blank" rel="noopener">WhatsApp</a>.</React.Fragment>}
      navigate={navigate}
    />
  );
}

function PrivacidadScreen({ navigate }) {
  return (
    <LegalScreen
      eyebrow="Política de" title="privacidad"
      sub="Cómo cuidamos tu información personal. Sin tecnicismos innecesarios. Sin trampas."
      sections={PRIVACIDAD_SECTIONS}
      lastUpdate="2026-04-12"
      foot={<React.Fragment>¿Quieres ejercer un derecho sobre tus datos? Escríbenos a <a href="mailto:info@bersagliojewelry.co">info@bersagliojewelry.co</a>.</React.Fragment>}
      navigate={navigate}
    />
  );
}

Object.assign(window, { NosotrosScreen, ContactoScreen, CarritoScreen, JournalScreen, EntradaScreen, ListaDeseosScreen, GraciasScreen, TerminosScreen, PrivacidadScreen });