/**
 * Bersaglio Jewelry — Journal entries (data layer).
 *
 * Fuente única de verdad para el contenido del journal. Inicialmente
 * hardcoded con los 8 entries literales del bundle BERSAGLIO NOVO.
 * Cuando admin tenga journal authoring, esta fuente se reemplaza por
 * data.getJournal() (Firestore) sin cambios en los consumers.
 *
 * Cada entry:
 *   - slug         identificador URL único
 *   - section      "Reportaje" / "Atelier" / "Mercado" / "Diseño" / etc.
 *   - kicker       línea inicial (overlay sobre la imagen)
 *   - title        título del artículo
 *   - excerpt      resumen mostrado en el grid + cover
 *   - body         texto completo (Markdown-lite con \n\n para párrafos)
 *   - date         "DD·MM·YY" formato display
 *   - dateLong     "Marzo 2026"
 *   - read         "5 min"
 *   - author       "Por María Camila Bersaglio"
 *   - authorRole   subtitle del author
 *   - image        URL relativa
 *   - featured     bool — destacar como cover
 */

export const JOURNAL_ENTRIES = [
    {
        slug: 'esmeraldas-historia-oculta',
        section: 'Reportaje',
        kicker: 'Las gemas que cambiaron Cartagena',
        title: 'Esmeraldas: la historia oculta detrás del verde colombiano',
        excerpt: 'Un viaje al corazón de Muzo y Coscuez, donde la geología, la herencia indígena y el oficio artesanal convergen para producir las esmeraldas más codiciadas del planeta. Conversamos con tres mineros, un gemólogo y la directora del Atelier Bersaglio.',
        body: `Un viaje al corazón de Muzo y Coscuez, donde la geología, la herencia indígena y el oficio artesanal convergen para producir las esmeraldas más codiciadas del planeta.

Hace cuarenta y cinco millones de años, una colisión tectónica empujó la cordillera oriental colombiana hacia arriba. En ese proceso, fluidos hidrotermales cargados de berilio, cromo y vanadio se filtraron por grietas de roca sedimentaria — y al enfriarse, cristalizaron en una de las gemas más raras de la Tierra. La esmeralda colombiana.

Conversamos con tres mineros de Muzo, un gemólogo del Instituto Gemológico de América y Kary Mendoza, directora del Atelier Bersaglio. Lo que une sus historias no es la geología, sino la paciencia: la mina avanza centímetros por mes, el corte de una piedra puede tomar semanas, y un anillo que termina en una vitrina vivió una década antes de llegar ahí.

"Cuando un cliente nos dice que la esmeralda es 'fría', le explico que ella no entiende de prisa", dice Eliécer Patiño, maestro orfebre que ha tallado más de 600 piezas en Bersaglio. "La esmeralda es el calendario más viejo que tenemos en las manos."`,
        date: '14·03·26',
        dateLong: 'Marzo 2026',
        read: '8 min',
        author: 'Por María Camila Bersaglio',
        authorRole: 'Directora editorial',
        image: '/img/earrings-emerald.png',
        featured: true,
    },
    {
        slug: 'seis-pulsos-anillo',
        section: 'Atelier',
        kicker: 'Detrás del taller',
        title: 'Los seis pulsos de un anillo a medida',
        excerpt: 'Desde el boceto hasta la entrega, así viaja una pieza por las manos de cuatro oficios. Una crónica visual del atelier en Cartagena.',
        body: `Desde el boceto hasta la entrega, así viaja una pieza por las manos de cuatro oficios.

Pulso uno: la conversación. Antes del lápiz, el café. Kary pregunta por la persona, no por el presupuesto. La gema correcta aparece cuando entendemos la ocasión.

Pulso dos: el boceto. Andrés Beltrán dibuja a mano con lápiz B6 sobre papel pergamino. Tres iteraciones, mínimo. El cliente firma la versión final.

Pulso tres: el modelado en cera. Eliécer talla un prototipo a escala real. Cada filete, cada engaste, ahí en el material blando antes del oro.

Pulso cuatro: la fundición. El oro 18K (75% puro, 25% aleación) entra al horno a 1.064°C. Sale como una pieza única que jamás existirá idéntica.

Pulso cinco: el engaste. Lucía Restrepo, gemóloga GIA, autentica la piedra una última vez. Luego va al microscopio: 40x de aumento para asegurar cada uña.

Pulso seis: el pulido. Hilo dental con pasta de diamante. Sí, hilo dental. Es la técnica más fina para llegar a las superficies internas. Cinco horas. La pieza está lista.`,
        date: '12·03·26',
        dateLong: 'Marzo 2026',
        read: '5 min',
        author: 'Por Andrés Beltrán',
        authorRole: 'Diseñador atelier',
        image: '/img/ring-sapphire.jpg',
        featured: false,
    },
    {
        slug: 'oro-18k-vs-14k',
        section: 'Mercado',
        kicker: 'Patrimonio',
        title: 'Por qué el oro 18K supera al 14K en patrimonio',
        excerpt: 'Una diferencia de 4 quilates parece menor — pero a treinta años, la prima del 18K se nota en color, en estructura y en valor de reventa.',
        body: `Una diferencia de 4 quilates parece menor — pero a treinta años, la prima del 18K se nota.

El oro 18K es 75% puro. El 14K, 58.3%. La diferencia es real: en color, el 18K tiene un amarillo más cálido y profundo; en estructura, las aleaciones del 14K oxidan más rápido (visible al microscopio); en reventa, los lingotes y joyas 18K se cotizan ~30% por encima del 14K en mercados premium.

Pero la diferencia más importante es invisible: el 18K dura. Una alianza de boda 18K usada todos los días, durante 50 años, conserva el grosor estructural. Una 14K se afina, se deforma, y a veces se quiebra cerca de las uniones.

En Bersaglio solo trabajamos 18K paladiado para piezas con piedras. Es la ley europea estándar. Es lo que se hereda.`,
        date: '06·03·26',
        dateLong: 'Marzo 2026',
        read: '4 min',
        author: 'Por Kary Mendoza',
        authorRole: 'Directora',
        image: '/img/banner-hero.png',
        featured: false,
    },
    {
        slug: 'trinity-cartier',
        section: 'Diseño',
        kicker: 'Historia del diseño',
        title: 'Trinity: la geometría que enamoró a Cartier',
        excerpt: 'Tres anillos entrelazados, tres metales, tres significados. Cómo la pieza icónica de Cartier influenció una generación de joyería contemporánea.',
        body: `Tres anillos entrelazados, tres metales, tres significados.

En 1924, Louis Cartier diseñó Trinity para Jean Cocteau. Tres anillos: uno de oro rosa (amistad), uno blanco (lealtad), uno amarillo (amor). Entrelazados topológicamente — no se pueden separar sin abrirse, pero individualmente son tres aros independientes.

Cien años después, Trinity sigue siendo una de las piezas más reproducidas. En Bersaglio la reinterpretamos: tres aros en oro 18K, cada uno con una esmeralda briolette diferente. El cliente elige los significados.`,
        date: '28·02·26',
        dateLong: 'Febrero 2026',
        read: '6 min',
        author: 'Por María Camila Bersaglio',
        authorRole: 'Directora editorial',
        image: '/img/model-emerald.png',
        featured: false,
    },
    {
        slug: 'rituales-diamante',
        section: 'Cuidado',
        kicker: 'Mantenimiento',
        title: 'Rituales caseros para conservar el fuego de tu diamante',
        excerpt: 'Una rutina mensual de tres pasos para que tu diamante mantenga el brillo del primer día. Sin químicos abrasivos, sin viajes al joyero.',
        body: `Una rutina mensual de tres pasos para que tu diamante mantenga el brillo del primer día.

Paso 1: agua tibia + jabón neutro. Un cuenco de agua tibia (no caliente) con dos gotas de jabón Castilla líquido. Sumerge la pieza durante 20 minutos.

Paso 2: cepillo suave. Un cepillo de dientes infantil (cerdas extra-suaves) limpia las facetas posteriores donde se acumula el aceite de la piel y los residuos cosméticos.

Paso 3: enjuague + pulido. Agua corriente, luego seca con un paño de microfibra dedicado solo a joyería. Cero ammonia, cero ultrasonido casero — esos ataques químicos dañan los engastes.

Una vez al año, llévalo al atelier para verificación de engaste y pulido profesional. Es gratis si la pieza salió de Bersaglio.`,
        date: '19·02·26',
        dateLong: 'Febrero 2026',
        read: '3 min',
        author: 'Por Lucía Restrepo',
        authorRole: 'Gemóloga GIA',
        image: '/img/earrings-travertino.png',
        featured: false,
    },
    {
        slug: 'paciencia-geologica',
        section: 'Entrevista',
        kicker: 'Conversaciones del atelier',
        title: '"La esmeralda es paciencia geológica"',
        excerpt: 'Andrés Forero, gemólogo GIA con 18 años de oficio, sobre cómo leer una piedra, distinguir el aceite del cedro y reconocer una Muzo Vieja de un kilómetro.',
        body: `Andrés Forero, gemólogo GIA con 18 años de oficio, sobre cómo leer una piedra.

— ¿Qué es lo primero que mira cuando recibe una esmeralda?
— El "jardín". Así llamamos a las inclusiones internas. En las esmeraldas finas hay muchas, y son normales. Lo malo no es tenerlas, es no tener trazabilidad.

— ¿Y el aceite?
— El 99.9% de las esmeraldas comerciales están aceitadas (con aceite de cedro o resinas) para mejorar claridad. No es engaño — está reconocido por GIA y reportado en cada certificado. Lo que sí es engaño es vender una esmeralda aceitada como "natural sin tratamiento" cuando no lo es.

— ¿Diferencia entre Muzo y Coscuez?
— Muzo: verde más azulado, cristalino, mejor índice de refracción. Coscuez: verde más amarillento, más opaco, más asequible. Las "Muzo Vieja" (extraídas antes de 1980) son lo más codiciado: tres veces el precio de una Muzo joven con clarity equivalente.`,
        date: '14·02·26',
        dateLong: 'Febrero 2026',
        read: '9 min',
        author: 'Por María Camila Bersaglio',
        authorRole: 'Directora editorial',
        image: '/img/earrings-emerald.png',
        featured: false,
    },
    {
        slug: 'bodas-no-se-desvanecen',
        section: 'Editorial',
        kicker: 'Ensayo',
        title: 'Bodas que no se desvanecen',
        excerpt: 'Lina Restrepo sobre por qué las alianzas de boda son la pieza más conservadora del joyero — y por qué eso es una bendición disfrazada.',
        body: `Lina Restrepo sobre por qué las alianzas de boda son la pieza más conservadora del joyero.

Las alianzas no se eligen para impresionar. Se eligen para durar. Por eso son la categoría más conservadora de toda la joyería: anillos planos, oro liso, sin piedras llamativas. Mientras tú cambias — de talla, de gusto, de ciudad — la alianza permanece.

Eso, lejos de ser una limitación, es su poder. Una alianza Bersaglio diseñada para una pareja en 2024 puede pasar a su hija en 2058 sin parecer fuera de época. Es el mismo gesto que usaba la generación de tu abuela.

La eternidad no es estridente. Es discreta.`,
        date: '07·02·26',
        dateLong: 'Febrero 2026',
        read: '5 min',
        author: 'Por Lina Restrepo',
        authorRole: 'Ensayista invitada',
        image: '/img/ring-sapphire.jpg',
        featured: false,
    },
    {
        slug: 'tres-generaciones',
        section: 'Patrimonio',
        kicker: 'Archivo familiar',
        title: 'Joyas que cruzaron tres generaciones',
        excerpt: 'Cinco piezas del archivo familiar Bersaglio que viajaron de abuela a madre a hija. Las historias detrás de cada una.',
        body: `Cinco piezas del archivo familiar Bersaglio que viajaron de abuela a madre a hija.

La primera: un broche de orquídea en oro amarillo y esmeraldas Muzo, comprado por Mercedes en 1962 al volver de su luna de miel en Bogotá. Pasó a su hija Eugenia en 1985 (regalo de quinceañera), luego a su nieta Sofía en 2018 (regalo de doctorado). Hoy lo lleva Sofía a sus conferencias.

La segunda: un par de aretes de diamante briolette, originalmente diseñados para Lorena en 1971 como regalo de bodas. Sobrevivió un divorcio, dos mudanzas internacionales, y un asalto en Bogotá. Sigue en uso.

(Las otras tres historias en la versión impresa del Journal — disponible en el atelier.)`,
        date: '01·02·26',
        dateLong: 'Febrero 2026',
        read: '7 min',
        author: 'Archivo familiar Bersaglio',
        authorRole: 'Memoria viva',
        image: '/img/earrings-travertino.png',
        featured: false,
    },
];

export const JOURNAL_ISSUE = {
    number: 'Issue Nº 14',
    date: 'Marzo 2026',
    est: 'EST. 2014',
};

export const JOURNAL_TICKER = [
    'Nuevo: Colección Atrato 2026 disponible',
    'Live · Subasta privada Casa Bersaglio 14·04',
    'Guía: 7 mitos sobre las esmeraldas colombianas',
    'Atelier abierto · Cartagena · Cita previa',
];

/** Returns the featured (cover) entry, or first if none flagged. */
export function getFeatured() {
    return JOURNAL_ENTRIES.find(e => e.featured) || JOURNAL_ENTRIES[0];
}

/** Returns all entries except the featured one. */
export function getNonFeatured() {
    const feat = getFeatured();
    return JOURNAL_ENTRIES.filter(e => e.slug !== feat.slug);
}

/** Find a single entry by slug. */
export function getEntryBySlug(slug) {
    return JOURNAL_ENTRIES.find(e => e.slug === slug) || null;
}

/** Returns up to N entries from the same section, excluding the given slug. */
export function getRelated(slug, n = 3) {
    const entry = getEntryBySlug(slug);
    if (!entry) return [];
    let related = JOURNAL_ENTRIES.filter(e => e.section === entry.section && e.slug !== slug);
    if (related.length < n) {
        const fillers = JOURNAL_ENTRIES.filter(e => e.slug !== slug && !related.includes(e));
        related = [...related, ...fillers];
    }
    return related.slice(0, n);
}
