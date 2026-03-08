// ============================================
// SIMULADOR DE CRÉDITO - MOTOR DE SIMULACIÓN
// ALTORRA CARS - Versión 2.0
// ============================================

(function() {
    'use strict';

    // Obtener dependencias (deben estar cargadas antes de este script)
    const Data = (typeof window !== 'undefined' && window.SimuladorData) ||
                 (typeof global !== 'undefined' && global.SimuladorData);
    const Finance = (typeof window !== 'undefined' && window.SimuladorFinance) ||
                    (typeof global !== 'undefined' && global.SimuladorFinance);

    if (!Data || !Finance) {
        console.error('SimuladorEngine: Dependencias no cargadas (SimuladorData, SimuladorFinance)');
        return;
    }

    const { PMT, PV, calcularSeguroMensual } = Finance;
    const { SEGUROS, getSufiRate, getOccRate, getFinandinaRate, getFinanzautoRate, getMobilizeRate, validarMobilize } = Data;

    /**
     * Función principal de simulación
     * @param {Object} inputs - Parámetros de entrada
     * @returns {Object} Resultados de simulación
     */
    function simularFinanciacion(inputs) {
        const {
            yearModelo,
            precioVenta,
            cuotaInicial,
            plazoMeses,
            riesgo,
            valorCuotaExtra,
            offsetMeses,
            opcionCompraLeasing
        } = inputs;

        // Derivados
        const valorFinanciar = precioVenta - cuotaInicial;
        const porcentajeInicial = cuotaInicial / precioVenta;

        // Calcular número de cuotas extra
        const numExtras2Anio = Math.floor(plazoMeses / 6);  // Para 2 extras/año
        const numExtras1Anio = Math.floor(plazoMeses / 12); // Para 1 extra/año

        // Resultados
        const tradicional = {};
        const cuotasExtra = {};
        const leasing = {};
        const topes = {};

        // ===== SUFI =====
        const tasaSufi = getSufiRate(riesgo, valorFinanciar);
        if (tasaSufi) {
            const seguroSufi = calcularSeguroMensual(valorFinanciar, SEGUROS.SUFI);

            // Tradicional
            const cuotaTradSufi = PMT(tasaSufi, plazoMeses, -valorFinanciar) + seguroSufi;
            tradicional.SUFI = {
                tasa: tasaSufi,
                cuota: Math.round(cuotaTradSufi),
                total: Math.round(cuotaTradSufi * plazoMeses)
            };

            // Cuotas Extra (2/año)
            const topeSufi = Math.round(PMT(tasaSufi, plazoMeses, -valorFinanciar) * 2.5);
            topes.SUFI = topeSufi;

            if (plazoMeses === 84 && porcentajeInicial < 0.20) {
                cuotasExtra.SUFI = "84M/Inicial>20%";
            } else if (valorCuotaExtra > topeSufi) {
                cuotasExtra.SUFI = "Bajar cuota extra";
            } else {
                const resultExtra = calcularCuotasExtra2Anio(tasaSufi, plazoMeses, valorFinanciar, valorCuotaExtra, offsetMeses, seguroSufi);
                cuotasExtra.SUFI = {
                    tasa: tasaSufi,
                    cuota: Math.round(resultExtra.cuota),
                    total: Math.round(resultExtra.cuota * plazoMeses + valorCuotaExtra * numExtras2Anio)
                };
            }

            // Leasing
            if (valorFinanciar < 30000000) {
                leasing.SUFI = "Crédito Minimo 30 Millones";
            } else if (plazoMeses === 12 || plazoMeses === 76) {
                leasing.SUFI = "Plazo 24 a 72";
            } else {
                const cuotaLeasingSufi = PMT(tasaSufi, plazoMeses, -valorFinanciar, precioVenta * opcionCompraLeasing) + seguroSufi;
                leasing.SUFI = {
                    tasa: tasaSufi,
                    cuota: Math.round(cuotaLeasingSufi),
                    total: Math.round(cuotaLeasingSufi * plazoMeses + precioVenta * opcionCompraLeasing)
                };
            }
        } else {
            tradicional.SUFI = "NO APLICA";
            cuotasExtra.SUFI = "NO APLICA";
            leasing.SUFI = "NO APLICA";
        }

        // ===== OCCIDENTE =====
        const tasaOcc = getOccRate(riesgo, plazoMeses);
        if (tasaOcc && plazoMeses !== 76) {
            const seguroOcc = calcularSeguroMensual(valorFinanciar, SEGUROS.OCCIDENTE);

            // Tradicional
            if (plazoMeses === 76 || plazoMeses === 84) {
                tradicional.OCCIDENTE = "Plazo 24 a 72";
            } else {
                const cuotaTradOcc = PMT(tasaOcc, plazoMeses, -valorFinanciar) + seguroOcc;
                tradicional.OCCIDENTE = {
                    tasa: tasaOcc,
                    cuota: Math.round(cuotaTradOcc),
                    total: Math.round(cuotaTradOcc * plazoMeses)
                };
            }

            // Cuotas Extra (2/año)
            const topeOcc = Math.round((valorFinanciar * 0.40) / numExtras2Anio);
            topes.OCCIDENTE = topeOcc;

            if (plazoMeses === 76 || plazoMeses === 84) {
                cuotasExtra.OCCIDENTE = "Plazo 24 a 72";
            } else if (valorCuotaExtra > topeOcc) {
                cuotasExtra.OCCIDENTE = "Bajar cuota extra";
            } else {
                const resultExtra = calcularCuotasExtra2Anio(tasaOcc, plazoMeses, valorFinanciar, valorCuotaExtra, offsetMeses, seguroOcc);
                cuotasExtra.OCCIDENTE = {
                    tasa: tasaOcc,
                    cuota: Math.round(resultExtra.cuota),
                    total: Math.round(resultExtra.cuota * plazoMeses + valorCuotaExtra * numExtras2Anio)
                };
            }

            // Leasing
            if (porcentajeInicial < 0.10) {
                leasing.OCCIDENTE = "Min 10%";
            } else if (plazoMeses === 12 || plazoMeses === 76 || plazoMeses === 84) {
                leasing.OCCIDENTE = "Plazo 24 a 72";
            } else {
                const cuotaLeasingOcc = PMT(tasaOcc, plazoMeses, -valorFinanciar, precioVenta * opcionCompraLeasing) + seguroOcc;
                leasing.OCCIDENTE = {
                    tasa: tasaOcc,
                    cuota: Math.round(cuotaLeasingOcc),
                    total: Math.round(cuotaLeasingOcc * plazoMeses + precioVenta * opcionCompraLeasing)
                };
            }
        } else {
            if (plazoMeses === 76 || plazoMeses === 84) {
                tradicional.OCCIDENTE = "Plazo 24 a 72";
                cuotasExtra.OCCIDENTE = "Plazo 24 a 72";
                leasing.OCCIDENTE = "Plazo 24 a 72";
            } else {
                tradicional.OCCIDENTE = "NO APLICA";
                cuotasExtra.OCCIDENTE = "NO APLICA";
                leasing.OCCIDENTE = "NO APLICA";
            }
        }

        // ===== FINANDINA =====
        const tasaFinandina = getFinandinaRate(riesgo);
        if (tasaFinandina) {
            const seguroFinandina = calcularSeguroMensual(valorFinanciar, SEGUROS.FINANDINA);

            // Tradicional
            if (porcentajeInicial === 0 && plazoMeses >= 72) {
                tradicional.FINANDINA = "Plazo <=60";
            } else {
                const cuotaTradFinandina = PMT(tasaFinandina, plazoMeses, -valorFinanciar) + seguroFinandina;
                tradicional.FINANDINA = {
                    tasa: tasaFinandina,
                    cuota: Math.round(cuotaTradFinandina),
                    total: Math.round(cuotaTradFinandina * plazoMeses)
                };
            }

            // Cuotas Extra (2/año)
            const topeFinandina = 2000000; // Tope fijo
            topes.FINANDINA = topeFinandina;

            if (porcentajeInicial === 0 && plazoMeses >= 72) {
                cuotasExtra.FINANDINA = "Plazo <=60";
            } else if (valorCuotaExtra > topeFinandina) {
                cuotasExtra.FINANDINA = "Bajar cuota extra";
            } else {
                const resultExtra = calcularCuotasExtra2Anio(tasaFinandina, plazoMeses, valorFinanciar, valorCuotaExtra, offsetMeses, seguroFinandina);
                cuotasExtra.FINANDINA = {
                    tasa: tasaFinandina,
                    cuota: Math.round(resultExtra.cuota),
                    total: Math.round(resultExtra.cuota * plazoMeses + valorCuotaExtra * numExtras2Anio)
                };
            }

            // Leasing
            if (porcentajeInicial < 0.10) {
                leasing.FINANDINA = "Min 10%";
            } else if (plazoMeses === 12 || plazoMeses === 76) {
                leasing.FINANDINA = "Plazo 24 a 72";
            } else if (opcionCompraLeasing !== 0.01) {
                leasing.FINANDINA = "OPC. COMPRA SOLO 1%";
            } else {
                const cuotaLeasingFinandina = PMT(tasaFinandina, plazoMeses, -valorFinanciar, precioVenta * opcionCompraLeasing) + seguroFinandina;
                leasing.FINANDINA = {
                    tasa: tasaFinandina,
                    cuota: Math.round(cuotaLeasingFinandina),
                    total: Math.round(cuotaLeasingFinandina * plazoMeses + precioVenta * opcionCompraLeasing)
                };
            }
        } else {
            tradicional.FINANDINA = "NO APLICA";
            cuotasExtra.FINANDINA = "NO APLICA";
            leasing.FINANDINA = "NO APLICA";
        }

        // ===== FINANZAUTO =====
        const tasaFinanzauto = getFinanzautoRate(riesgo);
        if (tasaFinanzauto) {
            const seguroFinanzauto = calcularSeguroMensual(valorFinanciar, SEGUROS.FINANZAUTO);

            // Tradicional
            if (plazoMeses === 76 || plazoMeses === 84) {
                tradicional.FINANZAUTO = "Plazo 24 a 72";
            } else {
                const cuotaTradFinanzauto = PMT(tasaFinanzauto, plazoMeses, -valorFinanciar) + seguroFinanzauto;
                tradicional.FINANZAUTO = {
                    tasa: tasaFinanzauto,
                    cuota: Math.round(cuotaTradFinanzauto),
                    total: Math.round(cuotaTradFinanzauto * plazoMeses)
                };
            }

            // Cuotas Extra (1/año) - Diferente a las otras entidades
            if (plazoMeses === 76 || plazoMeses === 84) {
                cuotasExtra.FINANZAUTO = "Plazo 24 a 72";
                topes.FINANZAUTO = 0;
            } else {
                const resultExtra = calcularCuotasExtra1Anio(tasaFinanzauto, plazoMeses, valorFinanciar, valorCuotaExtra, offsetMeses, seguroFinanzauto);
                const topeFinanzauto = Math.round(resultExtra.cuota * 3);
                topes.FINANZAUTO = topeFinanzauto;

                if (valorCuotaExtra > topeFinanzauto) {
                    cuotasExtra.FINANZAUTO = "Bajar cuota extra";
                } else {
                    cuotasExtra.FINANZAUTO = {
                        tasa: tasaFinanzauto,
                        cuota: Math.round(resultExtra.cuota),
                        total: Math.round(resultExtra.cuota * plazoMeses + valorCuotaExtra * numExtras1Anio)
                    };
                }
            }

            // Leasing - NO APLICA
            leasing.FINANZAUTO = "NO APLICA";
        } else {
            tradicional.FINANZAUTO = "NO APLICA";
            cuotasExtra.FINANZAUTO = "NO APLICA";
            leasing.FINANZAUTO = "NO APLICA";
        }

        // ===== MOBILIZE =====
        const validacionMobilize = validarMobilize(yearModelo, plazoMeses, valorFinanciar);
        if (validacionMobilize) {
            tradicional.MOBILIZE = validacionMobilize;
        } else {
            const tasaMobilize = getMobilizeRate(riesgo, yearModelo, porcentajeInicial, plazoMeses);
            if (tasaMobilize) {
                // Mobilize usa 0.23% mensual como "seguro" adicional
                const cuotaTradMobilize = PMT(tasaMobilize, plazoMeses, -valorFinanciar) + (valorFinanciar * 0.0023);
                tradicional.MOBILIZE = {
                    tasa: tasaMobilize,
                    cuota: Math.round(cuotaTradMobilize),
                    total: Math.round(cuotaTradMobilize * plazoMeses)
                };
            } else {
                tradicional.MOBILIZE = "NO APLICA";
            }
        }
        // Mobilize NO aplica a cuotas extra ni leasing
        cuotasExtra.MOBILIZE = "NO APLICA";
        leasing.MOBILIZE = "NO APLICA";

        return {
            tradicional,
            cuotasExtra,
            leasing,
            topes,
            meta: {
                valorFinanciar,
                porcentajeInicial,
                offsetMeses,
                numExtras2Anio,
                numExtras1Anio
            }
        };
    }

    /**
     * Calcula cuota para plan con 2 cuotas extra al año
     * Usa PV para calcular el valor presente de las cuotas extra y reducirlo del principal
     */
    function calcularCuotasExtra2Anio(tasa, plazoMeses, valorFinanciar, valorCuotaExtra, offsetMeses, seguroMensual) {
        const periodoMeses = 6;
        const iPeriodo = Math.pow(1 + tasa, periodoMeses) - 1;
        const nperPeriodo = plazoMeses / periodoMeses;

        // PV de las cuotas extra (pmt negativo porque son pagos)
        const pvExtra = PV(iPeriodo, nperPeriodo, -valorCuotaExtra);

        // Ajustar por offset (cuántos meses faltan para la primera cuota extra)
        const pvExtraAjustada = pvExtra * Math.pow(1 + tasa, periodoMeses - offsetMeses);

        // Valor a financiar ajustado (restamos el PV de las extras)
        const valorFinanciarAjustado = valorFinanciar - pvExtraAjustada;

        // Cuota mensual sobre el valor ajustado
        const cuota = PMT(tasa, plazoMeses, -valorFinanciarAjustado) + seguroMensual;

        return { cuota, valorFinanciarAjustado };
    }

    /**
     * Calcula cuota para plan con 1 cuota extra al año (FINANZAUTO)
     */
    function calcularCuotasExtra1Anio(tasa, plazoMeses, valorFinanciar, valorCuotaExtra, offsetMeses, seguroMensual) {
        const periodoMeses = 12;
        const iPeriodo = Math.pow(1 + tasa, periodoMeses) - 1;
        const nperPeriodo = plazoMeses / periodoMeses;

        // PV de las cuotas extra
        const pvExtra = PV(iPeriodo, nperPeriodo, -valorCuotaExtra);

        // Ajustar por offset
        const pvExtraAjustada = pvExtra * Math.pow(1 + tasa, periodoMeses - offsetMeses);

        // Valor a financiar ajustado
        const valorFinanciarAjustado = valorFinanciar - pvExtraAjustada;

        // Cuota mensual sobre el valor ajustado
        const cuota = PMT(tasa, plazoMeses, -valorFinanciarAjustado) + seguroMensual;

        return { cuota, valorFinanciarAjustado };
    }

    // Exportar para uso en otros módulos
    const exports = {
        simularFinanciacion,
        calcularCuotasExtra2Anio,
        calcularCuotasExtra1Anio
    };

    if (typeof window !== 'undefined') {
        window.SimuladorEngine = exports;
    }
    if (typeof global !== 'undefined') {
        global.SimuladorEngine = exports;
    }
})();
