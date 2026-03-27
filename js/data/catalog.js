/**
 * Bersaglio Jewelry — Data Layer
 *
 * HOY  → carga datos locales estáticos (_local)
 * MAÑANA → load() hace await fetchFromFirestore(); el resto del código no cambia.
 *
 * Interfaz pública:
 *   await db.load()                   — inicializa la capa de datos
 *   db.getBrand()                     — info de marca
 *   db.getContact()                   — datos de contacto / redes
 *   db.getCollections(onlyFeatured?)  — colecciones
 *   db.getServices()                  — servicios
 *   db.getAll()                       — todas las piezas
 *   db.getFeatured(limit?)            — piezas con featured:true
 *   db.getByCollection(slug)          — piezas de una colección
 *   db.getBySlug(slug)                — pieza individual por slug o id
 *   db.onChange(callback)             — suscribirse a cambios → devuelve unsubscribe()
 *   db.startRealtime()                — placeholder para onSnapshot() de Firestore
 */

// ─── Datos estáticos locales ──────────────────────────────────────────────────

const _local = {

    brand: {
        name:        "Bersaglio Jewelry",
        tagline:     "Alta Joyería con Alma",
        description: "Somos una joyería nacida con una visión clara: acercar piezas únicas a quienes saben apreciar la elegancia y el valor de una joya auténtica. Más que vender joyas, nos apasiona asesorar.",
        founded:     "2024",
        origin:      "Colombia",
        philosophy:  "Antes que vender, nos dedicamos a asesorar. Queremos que cada cliente encuentre una pieza con la que realmente se identifique — una joya que refleje su estilo, su historia y su esencia."
    },

    collections: [
        {
            id:          "anillos",
            slug:        "anillos",
            name:        "Anillos",
            subtitle:    "Esmeraldas, diamantes, rubíes y amatistas",
            description: "Anillos solitarios y de diseño en oro de 18 quilates con esmeraldas colombianas, diamantes naturales, rubíes, amatistas y moissanita. Cada pieza certificada por La Verde / Jewelers of America.",
            featured:    true,
            pieces:      11
        },
        {
            id:          "topos-aretes",
            slug:        "topos-aretes",
            name:        "Topos & Aretes",
            subtitle:    "Brillo que enmarca el rostro",
            description: "Topos y aretes de alta joyería en oro de 18 quilates con diamantes naturales, esmeraldas colombianas, amatistas y topacios. Diseños exclusivos con cortes baguette, gota y flor.",
            featured:    true,
            pieces:      9
        },
        {
            id:          "dijes-colgantes",
            slug:        "dijes-colgantes",
            name:        "Dijes & Colgantes",
            subtitle:    "Elegancia que acompaña cada paso",
            description: "Dijes de alta joyería en oro amarillo de 18 quilates con diamantes naturales, esmeraldas colombianas y topacios. Piezas delicadas con diseño artesanal.",
            featured:    true,
            pieces:      4
        },
        {
            id:          "argollas",
            slug:        "argollas",
            name:        "Argollas",
            subtitle:    "Zafiros naturales en cada arco",
            description: "Argollas de alta joyería en oro amarillo de 18 quilates con zafiros naturales azules y rosados. Piezas certificadas con gemas de color intenso y homogéneo.",
            featured:    true,
            pieces:      2
        }
    ],

    pieces: [
        // ─── ANILLOS (11 piezas) ────────────────────────────────────────────
        {
            id:          "ref001",
            slug:        "anillos-solitarios-trio",
            name:        "Anillos Solitarios Trío",
            ref:         "REF.001-002-003",
            collection:  "anillos",
            description: "Tres anillos solitarios con piedras centrales: diamante, zafiro azul y esmeralda natural. Oro amarillo 18K (Ley 750). Calidad AA.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Esmeralda, Diamante, Zafiro Azul",
                carat:       "0.15 ct c/u",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "3.04 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    "Trío Exclusivo",
            featured: true
        },
        {
            id:          "ref016",
            slug:        "anillo-solitario-amatista-amarillo",
            name:        "Anillo Solitario Amatista",
            ref:         "REF.016",
            collection:  "anillos",
            description: "Anillo solitario con amatista natural central en oro amarillo 18K (Ley 750). Calidad AA. Gema de color violeta intenso.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Amatista natural",
                carat:       "0.10 ct",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "2.571 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    null,
            featured: false
        },
        {
            id:          "ref017",
            slug:        "anillo-solitario-amatista-blanco",
            name:        "Anillo Solitario Amatista Oro Blanco",
            ref:         "REF.017",
            collection:  "anillos",
            description: "Anillo solitario con amatista natural central en oro blanco 18K (Ley 750). Calidad AA. Elegancia clásica en tonos fríos.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Amatista natural",
                carat:       "0.10 ct",
                metal:       "Oro blanco 18K (Ley 750)",
                weight:      "2.456 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    null,
            featured: false
        },
        {
            id:          "ref020",
            slug:        "anillo-esmeralda-certificada-baguettes",
            name:        "Anillo Esmeralda Certificada & Baguettes",
            ref:         "REF.020",
            collection:  "anillos",
            description: "Anillo especial con esmeralda rectangular certificada de 1.152 ct y 2 diamantes baguettes de 0.50 ct. Oro blanco 18K. Claridad IF — alta pureza.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Esmeralda natural + Diamantes baguettes",
                carat:       "1.652 ct total",
                metal:       "Oro blanco 18K (Ley 750)",
                weight:      "4.3 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    "Alta Pureza",
            featured: true
        },
        {
            id:          "ref022",
            slug:        "anillo-moissanita-azul-diamantes",
            name:        "Anillo Moissanita Azul & Diamantes",
            ref:         "REF.022",
            collection:  "anillos",
            description: "Anillo con moissanita azul central de 0.92 ct rodeada de 28 diamantes naturales. Oro amarillo 18K. Azul intenso con excelente brillo.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Moissanita azul + Diamantes naturales",
                carat:       "0.92 ct (central) + 0.20 ct (diamantes)",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "4.392 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    "Diseño Exclusivo",
            featured: true
        },
        {
            id:          "ref024",
            slug:        "anillo-amatista-gota-diamantes",
            name:        "Anillo Amatista Gota & Diamantes",
            ref:         "REF.024",
            collection:  "anillos",
            description: "Anillo con amatista natural en corte de gota de 1.12 ct y 34 diamantes naturales. Oro amarillo 18K. Violeta intenso homogéneo, calidad superior.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Amatista natural (gota) + Diamantes",
                carat:       "1.12 ct (amatista) + 0.17 ct (diamantes)",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "4.363 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    "Pieza Única",
            featured: false
        },
        {
            id:          "ref025",
            slug:        "anillo-amatista-ovalada-diamantes",
            name:        "Anillo Amatista Ovalada & Diamantes",
            ref:         "REF.025",
            collection:  "anillos",
            description: "Anillo con amatista natural ovalada de 0.77 ct y 6 diamantes de 2mm. Oro blanco 18K. Violeta intenso homogéneo, calidad superior AA.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Amatista natural (ovalada) + Diamantes",
                carat:       "0.77 ct (amatista) + 0.18 ct (diamantes)",
                metal:       "Oro blanco 18K (Ley 750)",
                weight:      "3.903 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    null,
            featured: false
        },
        {
            id:          "ref035",
            slug:        "anillo-rubies-rosa-diamantes",
            name:        "Anillo Rubíes Rosa & Diamantes",
            ref:         "REF.035",
            collection:  "anillos",
            description: "Anillo con 4 rubíes ovalados de 2.65 ct en rosa vibrante y 4 diamantes. Oro amarillo 18K. Tonalidades homogéneas, calidad AA.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Rubíes naturales + Diamantes",
                carat:       "2.65 ct (rubíes) + 0.06 ct (diamantes)",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "5.262 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    "Pieza Única",
            featured: true
        },
        {
            id:          "ref039",
            slug:        "anillo-flor-diamantes-esmeraldas",
            name:        "Anillo Flor Diamantes & Esmeraldas",
            ref:         "REF.039",
            collection:  "anillos",
            description: "Anillo diseño flor con 28 diamantes y 4 esmeraldas colombianas centrales. Oro amarillo 18K. Verde esmeralda intenso, origen colombiano. Calidad AA.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Esmeraldas colombianas + Diamantes",
                carat:       "0.240 ct (esmeraldas) + 0.140 ct (diamantes)",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "3.801 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    null,
            featured: false
        },
        {
            id:          "ref046",
            slug:        "anillo-esmeralda-cabuchon-diamantes",
            name:        "Anillo Esmeralda Cabuchón & Diamantes",
            ref:         "REF.046",
            collection:  "anillos",
            description: "Anillo con esmeralda colombiana cabuchón de 4.73 ct y 14 diamantes. Oro amarillo 18K. Verde esmeralda intenso y homogéneo, calidad AA.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Esmeralda colombiana (cabuchón) + Diamantes",
                carat:       "4.73 ct (esmeralda) + 0.08 ct (diamantes)",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "4.126 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    "Alta Joyería",
            featured: true
        },
        {
            id:          "ref-trebol",
            slug:        "anillo-trebol-esmeralda-diamantes",
            name:        "Anillo Trébol Esmeralda & Diamantes",
            ref:         "S/REF",
            collection:  "anillos",
            description: "Anillo diseño trébol con 7 esmeraldas de 1.50mm, 1 esmeralda de 1.75mm y 28 diamantes. Oro amarillo 18K. Esmeraldas colombianas, calidad AA.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Esmeraldas colombianas + Diamantes",
                carat:       "0.34 ct (esmeraldas) + 0.14 ct (diamantes)",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "3.284 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    null,
            featured: false
        },

        // ─── TOPOS & ARETES (9 piezas) ─────────────────────────────────────
        {
            id:          "ref-topos-diamante-esmeralda",
            slug:        "topos-diamante-punto-esmeralda",
            name:        "Topos Diamante Punto Esmeralda",
            ref:         "S/REF",
            collection:  "topos-aretes",
            description: "Topos con 28 diamantes naturales y 2 esmeraldas colombianas centrales. Oro blanco 18K. Color G, claridad VS1.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Diamantes naturales + Esmeraldas colombianas",
                carat:       "0.46 ct total",
                metal:       "Oro blanco 18K (Ley 750)",
                weight:      "2.792 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    "Alta Joyería",
            featured: true
        },
        {
            id:          "ref-topos-amatista-gota",
            slug:        "topos-amatista-gota-diamantes",
            name:        "Topos Amatista Gota & Diamantes",
            ref:         "S/REF",
            collection:  "topos-aretes",
            description: "Topos de alta joyería con 2 amatistas en corte de gota de 0.80 ct y 40 diamantes. Oro amarillo 18K. Violeta profundo con matices púrpura. VVS2.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Amatista natural (gota) + Diamantes",
                carat:       "0.80 ct (amatistas) + 0.20 ct (diamantes)",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "4.572 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    "Alta Joyería",
            featured: false
        },
        {
            id:          "ref-topos-topacio-diamantes",
            slug:        "topos-topacio-amarillo-diamantes",
            name:        "Topos Topacio Amarillo & Diamantes",
            ref:         "S/REF",
            collection:  "topos-aretes",
            description: "Topos de alta joyería con 2 topacios naturales de 2.20 ct y 40 diamantes. Oro amarillo 18K. Amarillo intenso homogéneo, alta claridad.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Topacio natural + Diamantes",
                carat:       "2.20 ct (topacios) + diamantes",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "5.703 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    null,
            featured: false
        },
        {
            id:          "ref077",
            slug:        "topos-flor-diamante",
            name:        "Topos Flor Diamante",
            ref:         "REF.077",
            collection:  "topos-aretes",
            description: "Topos de alta joyería diseño flor con 8 diamantes naturales de 0.22 ct. Oro amarillo 18K. Color H, claridad VS1.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Diamantes naturales",
                carat:       "0.22 ct total",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "2.282 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    null,
            featured: false
        },
        {
            id:          "ref083",
            slug:        "topos-rectangulares-baguettes-esmeraldas",
            name:        "Topos Rectangulares Baguettes & Esmeraldas",
            ref:         "REF.083",
            collection:  "topos-aretes",
            description: "Topos rectangulares con 2 diamantes baguettes, 42 diamantes redondos y 4 esmeraldas. Oro amarillo 18K. Color G, claridad VS1.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Diamantes baguettes + Esmeraldas",
                carat:       "0.51 ct total",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "3.089 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    "Diseño Exclusivo",
            featured: false
        },
        {
            id:          "ref080",
            slug:        "topos-rectangulares-baguettes-diamantes",
            name:        "Topos Rectangulares Baguettes Diamante",
            ref:         "REF.080",
            collection:  "topos-aretes",
            description: "Topos rectangulares con 2 diamantes baguettes de 0.20 ct y 24 diamantes redondos. Oro amarillo 18K. Color G, claridad VS1.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Diamantes naturales baguettes + redondos",
                carat:       "0.44 ct total",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "3.931 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    null,
            featured: false
        },
        {
            id:          "ref086",
            slug:        "topos-reina-esmeralda-baguettes",
            name:        "Topos Reina Esmeralda & Baguettes",
            ref:         "REF.086",
            collection:  "topos-aretes",
            description: "Topos de alta joyería con 20 esmeraldas colombianas y 2 diamantes baguettes. Oro amarillo 18K. Color G, claridad VS1.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Esmeraldas colombianas + Diamantes baguettes",
                carat:       "0.28 ct (esmeraldas) + 0.18 ct (baguettes)",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "4.507 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    "Alta Joyería",
            featured: false
        },
        {
            id:          "ref091",
            slug:        "topos-circulos-flor-esmeralda",
            name:        "Topos Círculos Flor Esmeralda",
            ref:         "REF.091",
            collection:  "topos-aretes",
            description: "Topos diseño flor circular con 56 diamantes y 16 esmeraldas colombianas. Oro amarillo 18K. Verde esmeralda homogéneo, calidad AA.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Esmeraldas colombianas + Diamantes",
                carat:       "0.23 ct (esmeraldas) + 0.28 ct (diamantes)",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "3.33 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    null,
            featured: false
        },
        {
            id:          "ref094",
            slug:        "topos-circulo-diamante-baguettes",
            name:        "Topos Círculo Diamante & Baguettes",
            ref:         "REF.094",
            collection:  "topos-aretes",
            description: "Topos circulares con 2 diamantes baguettes, 4 diamantes redondos de 2mm y 52 diamantes de 1mm. Oro amarillo 18K. Color G, VS1.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Diamantes naturales baguettes + redondos",
                carat:       "0.63 ct total",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "4.061 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    null,
            featured: false
        },

        // ─── DIJES & COLGANTES (4 piezas) ──────────────────────────────────
        {
            id:          "ref098",
            slug:        "dije-topacio-amarillo-diamantes",
            name:        "Dije Topacio Amarillo & Diamantes",
            ref:         "REF.098",
            collection:  "dijes-colgantes",
            description: "Dije de alta joyería con topacio amarillo central de 0.45 ct y 14 diamantes. Oro amarillo 18K. Amarillo dorado, calidad AA.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Topacio natural + Diamantes",
                carat:       "0.59 ct total",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "1.161 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    null,
            featured: false
        },
        {
            id:          "ref109",
            slug:        "dije-flor-esmeralda-diamantes",
            name:        "Dije Flor Esmeralda & Diamantes",
            ref:         "REF.109",
            collection:  "dijes-colgantes",
            description: "Dije diseño flor con 7 esmeraldas, 1 esmeralda central de 1.75mm y 28 diamantes. Oro amarillo 18K. Color G-H, calidad AA.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Esmeraldas naturales + Diamantes",
                carat:       "0.16 ct total",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "1.004 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    null,
            featured: false
        },
        {
            id:          "ref111",
            slug:        "dije-redondo-diamantes-baguette",
            name:        "Dije Redondo Diamantes & Baguette",
            ref:         "REF.111",
            collection:  "dijes-colgantes",
            description: "Dije redondo con 1 diamante baguette, 2 diamantes de 2mm y 30 diamantes de 1mm. Oro amarillo 18K. Color G-H, claridad VS1.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Diamantes naturales + Baguette",
                carat:       "0.11 ct (baguette) + diamantes",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "1.405 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    null,
            featured: false
        },
        {
            id:          "ref112",
            slug:        "dije-esmeralda-colgante-diamantes",
            name:        "Dije Esmeralda Colgante & Diamantes",
            ref:         "REF.112",
            collection:  "dijes-colgantes",
            description: "Dije con esmeralda colombiana colgante, 6 diamantes redondos y 11 diamantes de 1.25mm. Oro amarillo 18K. Color F, claridad VS.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Esmeralda colombiana + Diamantes",
                carat:       "0.25 ct (diamantes) + esmeralda",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "1.659 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    null,
            featured: false
        },

        // ─── ARGOLLAS (2 piezas) ────────────────────────────────────────────
        {
            id:          "ref060-azul",
            slug:        "argollas-zafiros-azules",
            name:        "Argollas Zafiros Azules",
            ref:         "REF.060",
            collection:  "argollas",
            description: "Argollas de alta joyería con 11 zafiros naturales azules de 1.75mm. Oro amarillo 18K. Azul intenso, calidad AA.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Zafiros naturales azules",
                carat:       "0.11 ct total",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "3.04 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    "Alta Joyería",
            featured: false
        },
        {
            id:          "ref060-rosa",
            slug:        "argollas-zafiros-rosados",
            name:        "Argollas Zafiros Rosados",
            ref:         "REF.060",
            collection:  "argollas",
            description: "Argollas de alta joyería con 11 zafiros naturales rosados de 1.75mm. Oro amarillo 18K. Rosa con matices homogéneos, calidad AA.",
            price:       null,
            priceLabel:  "Consultar",
            specs: {
                stone:       "Zafiros naturales rosados",
                carat:       "0.11 ct total",
                metal:       "Oro amarillo 18K (Ley 750)",
                weight:      "3.04 g",
                certificate: "La Verde / Jewelers of America"
            },
            badge:    "Alta Joyería",
            featured: false
        }
    ],

    services: [
        {
            id:          "asesoria",
            icon:        "gem",
            title:       "Asesoría Personalizada",
            description: "Nuestros gemólogos certificados te guían para encontrar la pieza perfecta según tu ocasión, estilo y presupuesto."
        },
        {
            id:          "diseno-custom",
            icon:        "pencil",
            title:       "Diseño a Medida",
            description: "Creamos piezas exclusivas desde cero. Tú eliges la gema, el metal y el diseño. Nosotros lo hacemos realidad."
        },
        {
            id:          "certificacion",
            icon:        "certificate",
            title:       "Certificación La Verde / Jewelers of America",
            description: "Todas nuestras piezas son certificadas por La Verde / Jewelers of America — Fabio Enrique Peñuela Montañez, Master Jeweler. Garantía de autenticidad y calidad en cada gema."
        },
        {
            id:          "envio",
            icon:        "shield",
            title:       "Envío Seguro y Asegurado",
            description: "Entrega puerta a puerta con seguro completo. Empaque premium que protege y honra cada pieza."
        }
    ],

    contact: {
        whatsapp:  "+573013752592",
        email:     "info@bersagliojewelry.co",
        instagram: "@bersaglio_jewelry",
        facebook:  "https://www.facebook.com/share/1J96BT58cr/",
        address:   "Calle 36 # 6-32, Calle San Agustín Chiquita, Centro Histórico, Cartagena de Indias",
        mapUrl:    "https://maps.app.goo.gl/9p5cjFQpqMjLeXti8",
        location:  "Cartagena de Indias, Colombia"
    }
};

// ─── BersaglioDatabase ────────────────────────────────────────────────────────

class BersaglioDatabase {

    constructor() {
        this._data        = null;
        this._listeners   = [];
        this._unsubPieces = null;
        this._unsubCols   = null;
        this._firestoreOk = false;
    }

    // ─── Carga ─────────────────────────────────────────────────────────────────

    /**
     * Inicializa la capa de datos.
     * Estrategia: intenta Firestore → si falla, usa datos estáticos locales.
     * Siempre resuelve rápido para no bloquear el render.
     */
    async load() {
        // 1) Cargar datos estáticos como base inmediata
        this._data = {
            ..._local,
            pieces:      [..._local.pieces],
            collections: [..._local.collections],
        };

        // 2) Intentar Firestore en paralelo (no bloquea el render)
        this._tryFirestore();

        return this;
    }

    /**
     * Intenta cargar datos desde Firestore.
     * Si Firestore responde, reemplaza los datos estáticos y notifica.
     * Si falla, los datos estáticos se mantienen — la app sigue funcionando.
     */
    async _tryFirestore() {
        try {
            const { fetchPieces, fetchCollections, isFirestoreAvailable } = await import('../firestore-service.js');

            const available = await isFirestoreAvailable();
            if (!available) {
                console.info('[BersaglioDatabase] Firestore no disponible → usando datos estáticos');
                return;
            }

            const [fsPieces, fsCols] = await Promise.all([
                fetchPieces(),
                fetchCollections()
            ]);

            // Replace with Firestore data only if it has at least as much data
            // as static catalog (prevents showing partial data before seed completes)
            if (fsPieces.length >= this._data.pieces.length) {
                this._data.pieces = fsPieces;
                this._firestoreOk = true;
                console.info(`[BersaglioDatabase] Firestore: ${fsPieces.length} piezas cargadas`);
            } else if (fsPieces.length > 0) {
                // Merge: keep static pieces and add/update with Firestore pieces
                const merged = [...this._data.pieces];
                const existingIds = new Set(merged.map(p => p.id));
                for (const fp of fsPieces) {
                    if (existingIds.has(fp.id)) {
                        const idx = merged.findIndex(p => p.id === fp.id);
                        if (idx >= 0) merged[idx] = fp;
                    } else {
                        merged.push(fp);
                    }
                }
                this._data.pieces = merged;
                this._firestoreOk = true;
                console.info(`[BersaglioDatabase] Firestore: merged ${fsPieces.length} piezas con ${this._data.pieces.length} estáticas`);
            }
            if (fsCols.length >= this._data.collections.length) {
                this._data.collections = fsCols;
                console.info(`[BersaglioDatabase] Firestore: ${fsCols.length} colecciones cargadas`);
            } else if (fsCols.length > 0) {
                const merged = [...this._data.collections];
                const existingIds = new Set(merged.map(c => c.id));
                for (const fc of fsCols) {
                    if (existingIds.has(fc.id)) {
                        const idx = merged.findIndex(c => c.id === fc.id);
                        if (idx >= 0) merged[idx] = fc;
                    } else {
                        merged.push(fc);
                    }
                }
                this._data.collections = merged;
                console.info(`[BersaglioDatabase] Firestore: merged ${fsCols.length} colecciones`);
            }

            this._notify();

        } catch (err) {
            console.info('[BersaglioDatabase] Firestore no disponible → datos estáticos activos');
        }
    }

    // ─── Getters ───────────────────────────────────────────────────────────────

    getBrand()    { return this._data.brand; }
    getContact()  { return this._data.contact; }
    getServices() { return this._data.services; }

    /** @returns {boolean} true if data is coming from Firestore */
    isFirestoreConnected() { return this._firestoreOk; }

    /**
     * @param {boolean} [onlyFeatured=false]
     * @returns {Array}
     */
    getCollections(onlyFeatured = false) {
        return onlyFeatured
            ? this._data.collections.filter(c => c.featured)
            : this._data.collections;
    }

    /** Todas las piezas */
    getAll() { return this._data.pieces; }

    /**
     * Piezas con featured:true
     * @param {number} [limit=Infinity]
     */
    getFeatured(limit = Infinity) {
        const list = this._data.pieces.filter(p => p.featured);
        return Number.isFinite(limit) ? list.slice(0, limit) : list;
    }

    /**
     * Piezas de una colección (por slug de colección)
     * @param {string} slug
     */
    getByCollection(slug) {
        return this._data.pieces.filter(p => p.collection === slug);
    }

    /**
     * Pieza individual por slug de URL o id interno
     * @param {string} slug
     * @returns {Object|null}
     */
    getBySlug(slug) {
        return this._data.pieces.find(p => p.slug === slug || p.id === slug) ?? null;
    }

    // ─── Reactividad ───────────────────────────────────────────────────────────

    /**
     * Suscribirse a cambios en los datos.
     * @param {Function} callback  — recibe (data) al actualizarse
     * @returns {Function}         — función para cancelar la suscripción
     */
    onChange(callback) {
        this._listeners.push(callback);
        return () => {
            this._listeners = this._listeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Activa la escucha en tiempo real de Firestore.
     * Cuando Firestore actualiza datos, la UI se re-renderiza automáticamente.
     * @returns {Function} unsubscribe — llamar para detener la escucha
     */
    async startRealtime() {
        try {
            const { onPiecesChange, onCollectionsChange } = await import('../firestore-service.js');

            this._unsubPieces = onPiecesChange(pieces => {
                if (pieces.length > 0) {
                    this._data.pieces = pieces;
                    this._firestoreOk = true;
                    this._notify();
                    console.info(`[BersaglioDatabase] Realtime: ${pieces.length} piezas actualizadas`);
                }
            });

            this._unsubCols = onCollectionsChange(cols => {
                if (cols.length > 0) {
                    this._data.collections = cols;
                    this._notify();
                    console.info(`[BersaglioDatabase] Realtime: ${cols.length} colecciones actualizadas`);
                }
            });

            console.info('[BersaglioDatabase] Escucha en tiempo real activada');

            return () => {
                this._unsubPieces?.();
                this._unsubCols?.();
                console.info('[BersaglioDatabase] Escucha en tiempo real detenida');
            };
        } catch (err) {
            console.info('[BersaglioDatabase] Realtime no disponible:', err.message);
            return () => {};
        }
    }

    // ─── Interno ───────────────────────────────────────────────────────────────

    _notify() {
        this._listeners.forEach(cb => cb(this._data));
    }
}

// Singleton compartido por toda la app
export const db = new BersaglioDatabase();
export default db;
