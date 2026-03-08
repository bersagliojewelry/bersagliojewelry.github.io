// ============================================
// SIMULADOR DE CRÉDITO - TABLAS DE DATOS
// ALTORRA CARS - Versión 2.0
// ============================================

// ===== SEGUROS DE VIDA (por millón) =====
const SEGUROS = {
    SUFI: 1200,
    OCCIDENTE: 1217,
    FINANDINA: 1300,
    FINANZAUTO: 1300,
    MOBILIZE: 0 // Mobilize usa 0.23% mensual fijo
};

// ===== SUFI - Tasas por riesgo y bracket de monto =====
// Bracket A: > 100.000.000
// Bracket B: > 60.000.000
// Bracket C: > 10.000.000 y <= 59.999.999
const SUFI_RATES = {
    "G1": { "A": 0.0135, "B": 0.0138, "C": 0.0141 },
    "G2": { "A": 0.0145, "B": 0.0148, "C": 0.0151 },
    "G3": { "A": 0.0155, "B": 0.0158, "C": 0.0161 },
    "G4": { "A": 0.0165, "B": 0.0168, "C": 0.0171 },
    "G5": { "A": 0.0175, "B": 0.0178, "C": 0.0181 },
    "G6": { "A": 0.0185, "B": 0.0185, "C": 0.0185 }
};

function getSufiRate(riesgo, valorFinanciar) {
    if (valorFinanciar > 100000000) return SUFI_RATES[riesgo]?.["A"] ?? null;
    if (valorFinanciar > 60000000) return SUFI_RATES[riesgo]?.["B"] ?? null;
    if (valorFinanciar > 10000000) return SUFI_RATES[riesgo]?.["C"] ?? null;
    return null; // NO APLICA
}

// ===== OCCIDENTE (Banco de Occidente / Occiauto) =====
// Tasas por riesgo y rango de plazo
const OCC_RATES = {
    "G1": { "24_36": 0.0144, "48_60": 0.0145, "72": 0.0146, "84": 0.0148 },
    "G2": { "24_36": 0.0152, "48_60": 0.0153, "72": 0.0154, "84": 0.0156 },
    "G3": { "24_36": 0.0161, "48_60": 0.0162, "72": 0.0163, "84": 0.0165 },
    "G4": { "24_36": 0.0170, "48_60": 0.0171, "72": 0.0172, "84": 0.0174 },
    "G5": { "24_36": 0.0170, "48_60": 0.0171, "72": 0.0172, "84": 0.0174 },
    "G6": { "24_36": 0.0170, "48_60": 0.0171, "72": 0.0172, "84": 0.0174 }
};

function getOccRate(riesgo, plazoMeses) {
    let key = null;
    if (plazoMeses === 24 || plazoMeses === 36) key = "24_36";
    else if (plazoMeses === 48 || plazoMeses === 60) key = "48_60";
    else if (plazoMeses === 72) key = "72";
    else if (plazoMeses === 84) key = "84";

    if (!key) return null;
    return OCC_RATES[riesgo]?.[key] ?? null;
}

// ===== FINANDINA =====
// Tasas por riesgo (sin bracket)
const FINANDINA_RATES = {
    "G1": 0.0139,
    "G2": 0.0148,
    "G3": 0.0158,
    "G4": 0.0181,
    "G5": 0.0182,
    "G6": 0.0183
};

function getFinandinaRate(riesgo) {
    return FINANDINA_RATES[riesgo] ?? null;
}

// ===== FINANZAUTO =====
// Tasas por riesgo (sin bracket)
const FINANZAUTO_RATES = {
    "G1": 0.0179,
    "G2": 0.0182,
    "G3": 0.0185,
    "G4": 0.0190,
    "G5": 0.0195,
    "G6": 0.0197
};

function getFinanzautoRate(riesgo) {
    return FINANZAUTO_RATES[riesgo] ?? null;
}

// ===== MOBILIZE =====
// Grupo por riesgo
function getMobilizeGrupo(riesgo) {
    if (riesgo === "G1" || riesgo === "G2") return "Grupo A";
    if (riesgo === "G3" || riesgo === "G4") return "Grupo B";
    if (riesgo === "G5" || riesgo === "G6") return "Grupo C";
    return null;
}

// Bucket de cuota inicial
function getMobilizeBucketInicial(porcentajeInicial) {
    const pct = porcentajeInicial * 100;
    if (pct <= 10.009) return "0 al 10";
    if (pct <= 20.009) return "10 al 20";
    if (pct <= 40.009) return "20 al 40";
    return ">40";
}

// Bucket de año modelo
function getMobilizeBucketAnio(yearModelo) {
    if (yearModelo >= 2013 && yearModelo <= 2016) return "2015-2016";
    if (yearModelo === 2017) return "2017";
    if (yearModelo === 2018) return "2018";
    if (yearModelo >= 2019 && yearModelo <= 2022) return "2019-2022";
    if (yearModelo >= 2023 && yearModelo <= 2026) return "2023-2026";
    return null; // NO APLICA
}

// Tabla MOBILIZE (INDEPENDIENTE + sin seguro de cuota)
const MOBILIZE_RATES = {"Grupo A":{"2015-2016":{"0 al 10":{"24":0.0186,"36":0.0186,"48":0.0186,"60":null,"72":null,"84":null},"10 al 20":{"24":0.0184,"36":0.0184,"48":0.0184,"60":null,"72":null,"84":null},"20 al 40":{"24":0.0182,"36":0.0182,"48":0.0182,"60":null,"72":null,"84":null},">40":{"24":0.0175,"36":0.0175,"48":0.0175,"60":null,"72":null,"84":null}},"2017":{"0 al 10":{"24":0.0181,"36":0.0181,"48":0.0181,"60":0.0181,"72":null,"84":null},"10 al 20":{"24":0.0179,"36":0.0179,"48":0.0179,"60":0.0179,"72":null,"84":null},"20 al 40":{"24":0.0177,"36":0.0177,"48":0.0177,"60":0.0177,"72":null,"84":null},">40":{"24":0.017,"36":0.017,"48":0.017,"60":0.017,"72":null,"84":null}},"2018":{"0 al 10":{"24":0.0176,"36":0.0176,"48":0.0176,"60":0.0176,"72":null,"84":null},"10 al 20":{"24":0.0174,"36":0.0174,"48":0.0174,"60":0.0174,"72":null,"84":null},"20 al 40":{"24":0.0172,"36":0.0172,"48":0.0172,"60":0.0172,"72":null,"84":null},">40":{"24":0.0165,"36":0.0165,"48":0.0165,"60":0.0165,"72":null,"84":null}},"2019-2022":{"0 al 10":{"24":0.0161,"36":0.0161,"48":0.0161,"60":0.0161,"72":0.0161,"84":null},"10 al 20":{"24":0.0159,"36":0.0159,"48":0.0159,"60":0.0159,"72":0.0159,"84":null},"20 al 40":{"24":0.0157,"36":0.0157,"48":0.0157,"60":0.0157,"72":0.0157,"84":null},">40":{"24":0.015,"36":0.015,"48":0.015,"60":0.015,"72":0.015,"84":null}},"2023-2026":{"0 al 10":{"24":0.015,"36":0.015,"48":0.015,"60":0.015,"72":0.015,"84":null},"10 al 20":{"24":0.0148,"36":0.0148,"48":0.0148,"60":0.0148,"72":0.0148,"84":null},"20 al 40":{"24":0.0146,"36":0.0146,"48":0.0146,"60":0.0146,"72":0.0146,"84":null},">40":{"24":0.0139,"36":0.0139,"48":0.0139,"60":0.0139,"72":0.0139,"84":null}}},"Grupo B":{"2015-2016":{"0 al 10":{"24":0.0187,"36":0.0187,"48":0.0187,"60":null,"72":null,"84":null},"10 al 20":{"24":0.0186,"36":0.0186,"48":0.0186,"60":null,"72":null,"84":null},"20 al 40":{"24":0.0184,"36":0.0184,"48":0.0184,"60":null,"72":null,"84":null},">40":{"24":0.0181,"36":0.0181,"48":0.0181,"60":null,"72":null,"84":null}},"2017":{"0 al 10":{"24":0.0182,"36":0.0182,"48":0.0182,"60":0.0182,"72":null,"84":null},"10 al 20":{"24":0.018,"36":0.018,"48":0.018,"60":0.018,"72":null,"84":null},"20 al 40":{"24":0.0178,"36":0.0178,"48":0.0178,"60":0.0178,"72":null,"84":null},">40":{"24":0.0171,"36":0.0171,"48":0.0171,"60":0.0171,"72":null,"84":null}},"2018":{"0 al 10":{"24":0.0177,"36":0.0177,"48":0.0177,"60":0.0177,"72":null,"84":null},"10 al 20":{"24":0.0175,"36":0.0175,"48":0.0175,"60":0.0175,"72":null,"84":null},"20 al 40":{"24":0.0173,"36":0.0173,"48":0.0173,"60":0.0173,"72":null,"84":null},">40":{"24":0.0166,"36":0.0166,"48":0.0166,"60":0.0166,"72":null,"84":null}},"2019-2022":{"0 al 10":{"24":0.0172,"36":0.0172,"48":0.0172,"60":0.0172,"72":0.0172,"84":null},"10 al 20":{"24":0.017,"36":0.017,"48":0.017,"60":0.017,"72":0.017,"84":null},"20 al 40":{"24":0.0168,"36":0.0168,"48":0.0168,"60":0.0168,"72":0.0168,"84":null},">40":{"24":0.0181,"36":0.0181,"48":0.0181,"60":0.0175,"72":0.0171,"84":null}},"2023-2026":{"0 al 10":{"24":0.0166,"36":0.0166,"48":0.0166,"60":0.0166,"72":0.0166,"84":null},"10 al 20":{"24":0.0164,"36":0.0164,"48":0.0164,"60":0.0164,"72":0.0164,"84":null},"20 al 40":{"24":0.0162,"36":0.0162,"48":0.0162,"60":0.0162,"72":0.0162,"84":null},">40":{"24":0.0181,"36":0.0181,"48":0.0181,"60":0.0176,"72":0.0172,"84":null}}},"Grupo C":{"2015-2016":{"0 al 10":{"24":0.0188,"36":0.0188,"48":0.0188,"60":null,"72":null,"84":null},"10 al 20":{"24":0.0187,"36":0.0187,"48":0.0187,"60":null,"72":null,"84":null},"20 al 40":{"24":0.0185,"36":0.0185,"48":0.0185,"60":null,"72":null,"84":null},">40":{"24":0.0182,"36":0.0182,"48":0.0182,"60":null,"72":null,"84":null}},"2017":{"0 al 10":{"24":0.0183,"36":0.0183,"48":0.0183,"60":0.0183,"72":null,"84":null},"10 al 20":{"24":0.0181,"36":0.0181,"48":0.0181,"60":0.0181,"72":null,"84":null},"20 al 40":{"24":0.0179,"36":0.0179,"48":0.0179,"60":0.0179,"72":null,"84":null},">40":{"24":0.0172,"36":0.0172,"48":0.0172,"60":0.0172,"72":null,"84":null}},"2018":{"0 al 10":{"24":0.0178,"36":0.0178,"48":0.0178,"60":0.0178,"72":null,"84":null},"10 al 20":{"24":0.0176,"36":0.0176,"48":0.0176,"60":0.0176,"72":null,"84":null},"20 al 40":{"24":0.0174,"36":0.0174,"48":0.0174,"60":0.0174,"72":null,"84":null},">40":{"24":0.0167,"36":0.0167,"48":0.0167,"60":0.0167,"72":null,"84":null}},"2019-2022":{"0 al 10":{"24":0.0185,"36":0.0185,"48":0.0185,"60":0.0185,"72":0.0185,"84":null},"10 al 20":{"24":0.0183,"36":0.0183,"48":0.0183,"60":0.0183,"72":0.0183,"84":null},"20 al 40":{"24":0.0181,"36":0.0181,"48":0.0181,"60":0.0181,"72":0.0181,"84":null},">40":{"24":0.0184,"36":0.0184,"48":0.0184,"60":0.0184,"72":0.0184,"84":null}},"2023-2026":{"0 al 10":{"24":0.018,"36":0.018,"48":0.018,"60":0.018,"72":0.018,"84":null},"10 al 20":{"24":0.0178,"36":0.0178,"48":0.0178,"60":0.0178,"72":0.0178,"84":null},"20 al 40":{"24":0.0176,"36":0.0176,"48":0.0176,"60":0.0176,"72":0.0176,"84":null},">40":{"24":0.0179,"36":0.0179,"48":0.0179,"60":0.0179,"72":0.0179,"84":null}}}};

function getMobilizeRate(riesgo, yearModelo, porcentajeInicial, plazoMeses) {
    const grupo = getMobilizeGrupo(riesgo);
    if (!grupo) return null;

    const bucketAnio = getMobilizeBucketAnio(yearModelo);
    if (!bucketAnio) return null;

    const bucketInicial = getMobilizeBucketInicial(porcentajeInicial);

    const plazoKey = String(plazoMeses);

    return MOBILIZE_RATES[grupo]?.[bucketAnio]?.[bucketInicial]?.[plazoKey] ?? null;
}

// Validaciones Mobilize
function validarMobilize(yearModelo, plazoMeses, valorFinanciar) {
    if (yearModelo < 2013) return "NO APLICA";
    if (plazoMeses === 84) return "Plazo Max. 72M";
    if (yearModelo === 2016 && plazoMeses > 60) return "Plazo 12 a 60";
    if (valorFinanciar < 30000000 && plazoMeses > 48) return "Plazo 12 a 48";
    return null; // OK
}

// Exportar para uso en otros módulos
const exports = {
    SEGUROS,
    getSufiRate,
    getOccRate,
    getFinandinaRate,
    getFinanzautoRate,
    getMobilizeRate,
    getMobilizeGrupo,
    getMobilizeBucketInicial,
    getMobilizeBucketAnio,
    validarMobilize
};

if (typeof window !== 'undefined') {
    window.SimuladorData = exports;
}
if (typeof global !== 'undefined') {
    global.SimuladorData = exports;
}
