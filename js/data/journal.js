/**
 * Bersaglio Jewelry — Journal / Blog Data Layer
 * Historias de alta joyería, gemas, diseño y cultura.
 *
 * Migración futura: reemplazar _entries por Firestore collection 'journal'.
 */

export const CATEGORIES = {
    gemas:    { label: 'Gemas',      bg: '#071A10', accent: '#1A6B3A', icon: 'gem'     },
    diseno:   { label: 'Diseño',     bg: '#150F00', accent: '#8B6000', icon: 'pencil'  },
    historia: { label: 'Historia',   bg: '#140A06', accent: '#8B3A1A', icon: 'scroll'  },
    novedad:  { label: 'Novedades',  bg: '#080F1A', accent: '#1A4A8B', icon: 'spark'   },
    guia:     { label: 'Guías',      bg: '#0D0814', accent: '#5A2E8B', icon: 'compass' },
};

const _entries = [
    {
        id:            'j001',
        slug:          'origen-esmeraldas-colombianas',
        title:         'El origen de las esmeraldas colombianas: una historia de millones de años',
        excerpt:       'Las condiciones geológicas únicas de los Andes dieron origen a las gemas más codiciadas del mundo. Un viaje al corazón de la tierra que produce el verde más puro.',
        content: [
            'Colombia produce más del 70% de las esmeraldas de alta calidad del mundo. Pero ¿por qué aquí? La respuesta está en una coincidencia geológica extraordinaria que tardó 65 millones de años en gestarse.',
            'Las esmeraldas colombianas se forman en una roca sedimentaria llamada "lutita negra", a diferencia del resto del mundo donde nacen en rocas ígneas o metamórficas. Esta diferencia de origen es la razón por la que las colombianas tienen ese verde tan particular — más saturado, más cálido, con un fuego interior inconfundible.',
            'En Bersaglio, cada esmeralda que utilizamos pasa por una rigurosa selección en origen. Trabajamos directamente con mineros en las zonas de Muzo, Coscuez y Chivor — los tres cinturones esmeraldíferos de Colombia — para garantizar trazabilidad completa desde la tierra hasta la pieza final.',
            'Lo que hace única a una esmeralda colombiana no es solo su color, sino su historia. Y en Bersaglio, esa historia comienza mucho antes de que el gemólogo la vea por primera vez.',
        ],
        category:  'gemas',
        date:      '2025-02-10',
        readTime:  '5 min',
        featured:  true,
        type:      'article',
    },
    {
        id:            'j002',
        slug:          'proceso-diseno-pieza-bersaglio',
        title:         'De boceto a joya: el proceso creativo detrás de cada pieza',
        excerpt:       'Una mirada íntima al proceso que transforma una idea en alta joyería. Desde el primer trazo hasta el acabado final, cada decisión es deliberada.',
        content: [
            'El diseño de una pieza de alta joyería no comienza con materiales — comienza con una pregunta: ¿qué historia queremos contar? Cada línea que trazamos en el boceto inicial es una respuesta a esa pregunta.',
            'En Bersaglio, el proceso creativo tiene cinco etapas claramente definidas. La primera es la consulta emocional: entender al cliente, su estilo de vida, el momento que quiere conmemorar. No hay diseño genérico en nuestro taller.',
            'La segunda etapa es la selección de gemas en bruto. Antes de dibujar, elegimos las piedras. La gema dicta el diseño, nunca al revés. Su forma, peso, color y carácter guían cada decisión posterior.',
            'La tercera etapa, el boceto, puede durar días. Exploramos proporciones, equilibrios, la relación entre el metal y la gema. Usamos herramientas digitales pero también papel y lápiz — hay algo en el trazo a mano que captura la intención de forma diferente.',
            'Finalmente viene la manufactura — el momento donde el diseño toca la realidad. Nuestros artesanos trabajan con herramientas que en algunos casos tienen décadas de uso. La experiencia es irreemplazable.',
        ],
        category:  'diseno',
        date:      '2025-01-28',
        readTime:  '6 min',
        featured:  true,
        type:      'article',
    },
    {
        id:            'j003',
        slug:          'certificacion-la-verde-que-garantiza',
        title:         '¿Qué garantiza la certificación La Verde / Jewelers of America en tu joya?',
        excerpt:       'La certificación de La Verde / Jewelers of America, respaldada por un Master Jeweler, es tu garantía de autenticidad. Aquí te explicamos qué cubre y por qué importa.',
        content: [
            'La Verde / Jewelers of America es una entidad de certificación reconocida que avala la autenticidad, calidad y características técnicas de cada pieza de joyería. Nuestro certificador, Fabio Enrique Peñuela Montañez, Master Jeweler, aplica los más altos estándares de la industria.',
            'Un certificado de calidad para una pieza evalúa múltiples variables: el tipo y autenticidad de cada gema (natural vs. sintética), su peso en quilates, la calidad del color, la claridad, y el corte. Para los metales, se verifica la pureza (Ley 750 para oro 18K) y el peso total.',
            'Para las esmeraldas colombianas, el proceso incluye la verificación del origen geográfico. Una esmeralda certificada de origen colombiano tiene un valor diferencial significativo en el mercado, gracias a su color verde intenso y homogéneo único en el mundo.',
            'Cada pieza Bersaglio viene acompañada de su certificación completa. No como formalidad, sino como garantía de que cada dato técnico que describimos está respaldado por la evaluación experta de un Master Jeweler.',
        ],
        category:  'gemas',
        date:      '2025-01-14',
        readTime:  '4 min',
        featured:  false,
        type:      'article',
    },
    {
        id:            'j004',
        slug:          'colombia-alta-joyeria-mapa-mundial',
        title:         'Colombia en el mapa mundial de la alta joyería: un momento histórico',
        excerpt:       'La riqueza gemológica colombiana siempre existió. Lo que está cambiando ahora es el reconocimiento internacional de su diseño y manufactura.',
        content: [
            'Durante décadas, Colombia fue conocida en el mundo de la joyería principalmente como proveedor de materia prima. Las esmeraldas salían en bruto, eran cortadas en Israel, India o Bélgica, y engastadas en talleres de Florencia o Nueva York.',
            'Ese modelo está cambiando. Una nueva generación de diseñadores y artesanos colombianos está reclamando la cadena completa de valor — desde la mina hasta la pieza terminada — y el mundo está prestando atención.',
            'En ferias como Baselworld y JCK Las Vegas, las marcas colombianas de alta joyería están apareciendo con más frecuencia. Los compradores internacionales están descubriendo que Colombia no solo tiene las mejores esmeraldas del mundo, sino también el talento para transformarlas en arte.',
            'En Bersaglio, esta es nuestra razón de ser. No somos solo una joyería colombiana — somos la demostración de que en Colombia se puede crear alta joyería al nivel de las grandes casas europeas, con una identidad propia y auténtica.',
        ],
        category:  'historia',
        date:      '2024-12-18',
        readTime:  '7 min',
        featured:  false,
        type:      'article',
    },
    {
        id:            'j005',
        slug:          'como-cuidar-joyas-oro-esmeraldas',
        title:         'Cómo cuidar tus joyas de oro y esmeraldas para que brillen por generaciones',
        excerpt:       'La alta joyería es una inversión que trasciende. Con el cuidado correcto, una pieza puede pasar de generación en generación sin perder su esplendor.',
        content: [
            'El oro de 18 quilates es una aleación resistente, pero no invulnerable. El contacto frecuente con productos químicos — perfumes, cloro de piscina, limpiadores del hogar — puede alterar su superficie con el tiempo. La regla simple: la joya es lo último que te pones y lo primero que te quitas.',
            'Las esmeraldas requieren cuidado especial. A diferencia de los diamantes, la mayoría de las esmeraldas contienen inclusiones naturales (llamadas "jardin" en el mundo gemológico) que forman parte de su carácter. Estas inclusiones pueden hacerlas más sensibles a golpes y cambios bruscos de temperatura.',
            'Para limpiar tus joyas en casa, usa agua tibia con unas gotas de jabón neutro y un cepillo de dientes de cerdas suaves. Nunca ultrasonido para esmeraldas — las vibraciones pueden afectar las inclusiones. Seca siempre con un paño suave antes de guardar.',
            'Guarda cada pieza por separado, idealmente en su estuche original o en compartimentos individuales. El oro puede rayar otras superficies y viceversa. En Bersaglio recomendamos traer tus piezas a revisión profesional al menos una vez al año.',
        ],
        category:  'guia',
        date:      '2024-12-02',
        readTime:  '5 min',
        featured:  false,
        type:      'article',
    },
    {
        id:            'j006',
        slug:          'anillo-compromiso-guia-definitiva',
        title:         'Guía definitiva para elegir el anillo de compromiso perfecto',
        excerpt:       'Un anillo de compromiso no es solo una joya — es la primera promesa de una historia en común. Esta guía te ayuda a tomar la decisión con confianza.',
        content: [
            'El anillo de compromiso perfecto no existe en abstracto — existe en relación a la persona que lo va a usar. El primer paso es observar: ¿qué tipo de joyas usa habitualmente? ¿Prefiere el oro amarillo, blanco o rosa? ¿Va por lo clásico o por lo arquitectural?',
            'La elección de la gema central es la decisión más importante. Los diamantes son la opción tradicional por su dureza (10 en la escala Mohs) y su brillo. Pero las esmeraldas colombianas están ganando terreno como piedra central — son originales, tienen carácter y cuentan una historia.',
            'El metal importa tanto como la gema. El platino es el metal más resistente y mantiene la gema más segura a largo plazo. El oro de 18k en sus variantes (amarillo, blanco, rosa) es igualmente noble y añade calidez o modernidad según la elección.',
            'En Bersaglio, cada anillo de compromiso comienza con una consulta personalizada. No vendemos anillos de catálogo — diseñamos el tuyo. El proceso toma entre 3 y 6 semanas, y el resultado es una pieza que no existe en ningún otro lugar del mundo.',
        ],
        category:  'guia',
        date:      '2024-11-14',
        readTime:  '8 min',
        featured:  false,
        type:      'article',
    },
];

class JournalDatabase {
    getAll()     { return [..._entries]; }
    getFeatured(n = 4) { return _entries.filter(e => e.featured).concat(_entries.filter(e => !e.featured)).slice(0, n); }
    getBySlug(slug)    { return _entries.find(e => e.slug === slug) ?? null; }
    getByCategory(cat) { return _entries.filter(e => e.category === cat); }
    getRecent(n = 3)   { return [..._entries].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, n); }
}

export const journal = new JournalDatabase();
export default journal;
