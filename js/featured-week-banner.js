/**
 * Featured Week Banner — ALTORRA CARS — v8 Modelo Unificado
 * HUD Automotriz Premium | Paleta Dorada/Ámbar | Sin Azul/Cian
 *
 * Prioridad:  destacado:true (= featuredWeek) + featuredOrder  >  6 más recientes
 * Campos opt: featuredCutoutPng (PNG sin fondo), featuredOrder (1-6), precioOferta
 *
 * Modelo simplificado: destacado = banner. Un solo concepto, una sola verdad.
 * CSS .fw-car-bg eliminado — cutout mode muestra SOLO el PNG sin fondo borroso.
 */
(function () {
    'use strict';

    var FW = {
        timer:         null,
        index:         0,
        total:         0,
        vehicles:      [],
        reducedMotion: false,

        /* ─────────────────────────────────────────
           INIT
        ───────────────────────────────────────── */
        init: async function () {
            var section = document.getElementById('fw-banner');
            if (!section) return;

            FW.reducedMotion =
                !!(window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches);

            await vehicleDB.load();

            var vehicles = FW._getVehicles();
            if (!vehicles.length) { section.style.display = 'none'; return; }

            vehicles    = vehicles.slice(0, 6);
            FW.vehicles = vehicles;
            FW.total    = vehicles.length;
            FW.index    = 0;

            FW._render(vehicles);
            FW._bindEvents();
            if (!FW.reducedMotion && FW.total > 1) FW._startAutoRotate();

            section.style.display = '';
        },

        /* ─────────────────────────────────────────
           VEHICLE SELECTION
           destacado (= banner) > 6 más recientes
        ───────────────────────────────────────── */
        /* Helper: canonical "is featured" check — retrocompat con featuredWeek */
        _isFeatured: function (v) { return !!(v.destacado || v.featuredWeek); },

        _getVehicles: function () {
            var all = (vehicleDB.vehicles || []).filter(function (v) {
                return v.estado === 'disponible' || !v.estado;
            });

            /* 1) Destacados — único concepto operativo (featuredWeek = alias legacy) */
            var featured = all.filter(FW._isFeatured);
            if (featured.length) {
                return featured.sort(function (a, b) {
                    return (a.featuredOrder || 999) - (b.featuredOrder || 999);
                }).slice(0, 6);
            }

            /* 2) Fallback: 6 más recientes — año DESC, luego updatedAt DESC */
            return all.slice()
                .sort(function (a, b) {
                    var dy = (b.year || 0) - (a.year || 0);
                    if (dy !== 0) return dy;
                    var ta = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.id || 0);
                    var tb = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.id || 0);
                    return tb - ta;
                })
                .slice(0, 6);
        },

        /* ─────────────────────────────────────────
           RENDER SLIDES + DOTS
        ───────────────────────────────────────── */
        _render: function (vehicles) {
            var track  = document.getElementById('fw-track');
            var dotsEl = document.getElementById('fw-dots');
            if (!track || !dotsEl) return;

            var slidesHTML = '';
            var dotsHTML   = '';

            vehicles.forEach(function (v, i) {
                slidesHTML += FW._buildSlide(v, i);
                dotsHTML   +=
                    '<button class="fw-dot' + (i === 0 ? ' fw-dot--active' : '') + '"' +
                    ' data-index="' + i + '" role="tab"' +
                    ' aria-label="Ir al veh\u00edculo ' + (i + 1) + '"' +
                    ' aria-selected="' + (i === 0 ? 'true' : 'false') + '"></button>';
            });

            track.innerHTML  = slidesHTML;
            dotsEl.innerHTML = dotsHTML;

            /* Preload next image immediately */
            FW._preloadNext(0);
        },

        /* ─────────────────────────────────────────
           BUILD ONE SLIDE
        ───────────────────────────────────────── */
        _buildSlide: function (v, i) {
            var hasCutout  = !!v.featuredCutoutPng;
            var imgSrc     = hasCutout
                ? v.featuredCutoutPng
                : (v.imagen || 'multimedia/vehicles/placeholder-car.jpg');

            var marca  = v.marca  ? v.marca.charAt(0).toUpperCase()  + v.marca.slice(1)  : '';
            var modelo = v.modelo ? v.modelo.toUpperCase() : '';
            var title  = (marca + ' ' + modelo + (v.year ? ' ' + v.year : '')).trim();

            var price        = typeof formatPrice === 'function' ? formatPrice(v.precio) : '$' + (v.precio || '');
            var hasOffer     = !!(v.precioOferta && v.precioOferta < v.precio);
            var displayPrice = hasOffer
                ? (typeof formatPrice === 'function' ? formatPrice(v.precioOferta) : '$' + v.precioOferta)
                : price;

            var href  = typeof getVehicleDetailUrl === 'function' ? getVehicleDetailUrl(v) : '#';
            var km    = typeof formatKm === 'function' ? formatKm(v.kilometraje) : (v.kilometraje != null ? v.kilometraje + ' km' : '');
            var trans = v.transmision ? v.transmision.charAt(0).toUpperCase() + v.transmision.slice(1) : '';
            var fuel  = v.combustible ? v.combustible.charAt(0).toUpperCase() + v.combustible.slice(1) : '';

            /* ── Badge text: OFFER or DESTACADO ── */
            var badgeText  = '';
            var badgeClass = 'fw-badge';
            if (hasOffer) {
                badgeText  = FW._icoStar() + ' OFERTA DE LA SEMANA';
                badgeClass = 'fw-badge fw-badge--offer';
            } else if (FW._isFeatured(v)) {
                badgeText  = FW._icoStar() + ' DESTACADO DE LA SEMANA';
            } else {
                badgeText  = FW._icoStar() + ' SELECCI\u00d3N PREMIUM';
            }

            /* ── Spec pills (left panel) — info distinta al data rail ── */
            var pills = '';
            if (v.tipo)      pills += FW._pill(FW._icoCar(),      v.tipo.charAt(0).toUpperCase() + v.tipo.slice(1));
            if (v.ubicacion) pills += FW._pill(FW._icoLocation(), v.ubicacion);

            /* ── Old price row: only when hasOffer ── */
            var priceOldHtml = hasOffer
                ? '<span class="fw-price-old">' + price + '</span>'
                : '';

            /* ── Section label ── */
            var sectionTitle = FW._isFeatured(v)
                ? 'Destacados de la <span>Semana</span>'
                : 'Veh\u00edculos <span>Destacados</span>';

            var isActive = (i === 0);
            var imgClass = 'fw-car-img' + (hasCutout ? '' : ' fw-car-img--rect');

            /* ── Blueprint panel: static tech decoration ── */
            var blueprintTicks = '';
            for (var t = 0; t < 14; t++) {
                blueprintTicks +=
                    '<div class="fw-blueprint-tick' +
                    (t % 3 === 0 ? ' fw-blueprint-tick--major' : '') +
                    '"></div>';
            }

            return (
                '<div class="fw-slide' + (isActive ? ' fw-slide--active' : '') + '"' +
                ' data-index="' + i + '" role="tabpanel"' +
                ' aria-label="' + title.replace(/"/g, '&quot;') + '"' +
                ' aria-hidden="' + (isActive ? 'false' : 'true') + '">' +

                /* ──────────── LEFT: info + CTA ──────────── */
                '<a class="fw-info" href="' + href + '"' +
                ' tabindex="' + (isActive ? '0' : '-1') + '"' +
                ' aria-label="Ver detalle de ' + title.replace(/"/g, '&quot;') + '">' +

                '<h2 class="fw-title">' + sectionTitle + '</h2>' +

                '<p class="fw-subtitle">Financiaci\u00f3n disponible \u00b7 Entrega en Cartagena \u00b7 Verificado</p>' +

                '<hr class="fw-sep">' +

                '<span class="' + badgeClass + '">' + badgeText + '</span>' +

                '<h3 class="fw-vehicle-name">' + title + '</h3>' +

                '<span class="fw-avail-tag" aria-label="Veh\u00edculo disponible">&#9679; Disponible</span>' +

                '<div class="fw-pills">' + pills + '</div>' +

                '<div class="fw-price-box">' +
                    '<span class="fw-price-label">PRECIO</span>' +
                    '<span class="fw-price-value">' + displayPrice + '</span>' +
                    priceOldHtml +
                '</div>' +

                '<span class="fw-cta-visual" aria-hidden="true">VER DETALLES ' + FW._icoArrow() + '</span>' +

                '</a>' +

                /* ──────────── RIGHT: visual zone ──────────── */
                '<div class="fw-visual">' +

                /* Ambient glow */
                '<div class="fw-glow" aria-hidden="true"></div>' +

                /* Micro-grid blueprint overlay (radially masked to visual center) */
                '<div class="fw-hud-blueprint" aria-hidden="true"></div>' +

                /* Overlay grid: second tech grid layer, wider cell pattern */
                '<div class="fw-overlay-grid" aria-hidden="true"></div>' +

                /* Blueprint panel: technical instrument panel behind car */
                '<div class="fw-blueprint-panel" aria-hidden="true">' +
                    '<div class="fw-blueprint-ticks">' + blueprintTicks + '</div>' +
                    '<span class="fw-blueprint-label">SYS \u00b7 ALTORRA CARS</span>' +
                    FW._buildBlueprintSvg() +
                '</div>' +

                /* Blurred bg removed — cutout shows PNG only */

                /* Car scene: floor + shadow + image */
                '<div class="fw-car-scene' + (hasCutout ? ' fw-car-scene--cutout' : '') + '" aria-hidden="true">' +
                    '<div class="fw-car-floor"></div>' +
                    '<div class="fw-car-shadow"></div>' +
                    '<img class="' + imgClass + '"' +
                        ' src="' + imgSrc + '"' +
                        ' alt="' + title.replace(/"/g, '&quot;') + '"' +
                        ' loading="' + (i === 0 ? 'eager' : 'lazy') + '"' +
                        ' decoding="' + (i === 0 ? 'sync' : 'async') + '">' +
                '</div>' +

                /* HUD layer: corner brackets + scanline only — NO floating badges */
                '<div class="fw-hud-layer" aria-hidden="true">' +
                    '<div class="fw-hud-corner fw-hud-tl"></div>' +
                    '<div class="fw-hud-corner fw-hud-tr"></div>' +
                    '<div class="fw-hud-corner fw-hud-bl"></div>' +
                    '<div class="fw-hud-corner fw-hud-br"></div>' +
                    '<div class="fw-hud-scanline"></div>' +
                '</div>' +

                /* Data Rail: unified spec bar — el único componente de datos */
                FW._buildDataRail(v, km, trans, fuel) +

                '</div>' + /* .fw-visual */

                '</div>' /* .fw-slide */
            );
        },

        /* ─────────────────────────────────────────
           DATA RAIL — Componente estrella unificado
           Orden: Año | Km | Transmisión | Combustible
           CSS controla visibilidad según breakpoint.
        ───────────────────────────────────────── */
        _buildDataRail: function (v, km, trans, fuel) {
            var items = [];

            /* Item 1: Año — siempre presente si existe */
            if (v.year) {
                items.push({
                    icon:  FW._railIcon(FW._icoYear()),
                    label: 'A\u00d1O',
                    value: String(v.year)
                });
            }

            /* Item 2: Kilometraje */
            if (v.kilometraje != null && km) {
                items.push({
                    icon:  FW._railIcon(FW._icoKm()),
                    label: 'KILOMETRAJE',
                    value: km
                });
            }

            /* Item 3: Transmisión */
            if (trans) {
                items.push({
                    icon:  FW._railIcon(FW._icoTrans()),
                    label: 'TRANSMISI\u00d3N',
                    value: trans
                });
            }

            /* Item 4: Combustible */
            if (fuel) {
                items.push({
                    icon:  FW._railIcon(FW._icoFuel()),
                    label: 'COMBUSTIBLE',
                    value: fuel
                });
            }

            /* Fallback: si no hay suficientes datos, N/D para mantener alineación */
            while (items.length < 2) {
                items.push({
                    icon:  FW._railIcon(FW._icoYear()),
                    label: 'DATO',
                    value: 'N/D'
                });
            }

            var inner = '';
            items.forEach(function (item) {
                inner +=
                    '<div class="fw-data-item">' +
                        '<div class="fw-data-icon">' + item.icon + '</div>' +
                        '<div class="fw-data-meta">' +
                            '<span class="fw-data-label">' + item.label + '</span>' +
                            '<span class="fw-data-value">' + item.value + '</span>' +
                        '</div>' +
                    '</div>';
            });

            return (
                '<div class="fw-data-rail"' +
                ' aria-label="Especificaciones del veh\u00edculo">' +
                inner +
                '</div>'
            );
        },

        /* ─────────────────────────────────────────
           BLUEPRINT SVG — Technical drawing overlay
           Dimension lines, target crosshairs, traces.
           All strokes use gold palette at low opacity.
        ───────────────────────────────────────── */
        _buildBlueprintSvg: function () {
            var g   = 'rgba(212,175,55,';
            var ln  = function (x1, y1, x2, y2, op, sw, dash) {
                return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"' +
                    ' fill="none" stroke="' + g + op + ')" stroke-width="' + sw + '"' +
                    (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
            };
            var circ = function (cx, cy, r, op, sw, filled) {
                return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"' +
                    (filled
                        ? ' fill="' + g + op + ')"'
                        : ' fill="none" stroke="' + g + op + ')" stroke-width="' + sw + '"') +
                    '/>';
            };
            var txt = function (x, y, anchor, op, size, weight, content) {
                return '<text x="' + x + '" y="' + y + '" text-anchor="' + anchor + '"' +
                    ' fill="' + g + op + ')" font-size="' + size + '"' +
                    ' font-family="system-ui,sans-serif"' +
                    (weight ? ' font-weight="' + weight + '"' : '') +
                    ' letter-spacing="1.2">' + content + '</text>';
            };
            /* Crosshair helper: circle + 4 extending arms */
            var xhair = function (cx, cy) {
                return circ(cx, cy, 6, '0.38', '0.65', false) +
                    circ(cx, cy, 1.8, '0.38', '', true) +
                    ln(cx - 8, cy, cx - 14, cy, '0.38', '0.65', '') +
                    ln(cx + 8, cy, cx + 14, cy, '0.38', '0.65', '') +
                    ln(cx, cy - 8, cx, cy - 14, '0.38', '0.65', '') +
                    ln(cx, cy + 8, cx, cy + 14, '0.38', '0.65', '');
            };

            return (
                '<svg class="fw-blueprint-svg" viewBox="0 0 220 320"' +
                ' xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' +

                /* Horizontal dimension guide lines (dashed) */
                ln(18, 80,  202, 80,  '0.22', '0.5', '5 4') +
                ln(18, 160, 202, 160, '0.22', '0.5', '5 4') +
                ln(18, 240, 202, 240, '0.22', '0.5', '5 4') +

                /* Vertical center guide (very faint) */
                ln(110, 10, 110, 310, '0.09', '0.5', '8 5') +

                /* Dimension tick ends */
                ln(18, 73, 18, 87,   '0.22', '0.5', '') +
                ln(202, 73, 202, 87, '0.22', '0.5', '') +
                ln(18, 153, 18, 167,   '0.22', '0.5', '') +
                ln(202, 153, 202, 167, '0.22', '0.5', '') +

                /* Registration crosshairs at 3 corners */
                xhair(22, 22) +
                xhair(198, 22) +
                xhair(22, 298) +

                /* Angled PCB trace routing */
                '<polyline points="0,108 38,108 52,93 202,93"' +
                ' fill="none" stroke="' + g + '0.16)" stroke-width="0.65"/>' +
                '<polyline points="0,212 34,212 48,227 202,227"' +
                ' fill="none" stroke="' + g + '0.13)" stroke-width="0.65"/>' +

                /* Short horizontal accent traces */
                ln(58, 50,  162, 50,  '0.09', '0.5', '3 3') +
                ln(58, 270, 162, 270, '0.09', '0.5', '3 3') +

                /* Technical labels */
                txt(110, 77,  'middle', '0.34', '5.5', '700', 'VEH \u00b7 SYS \u00b7 REF') +
                txt(110, 157, 'middle', '0.20', '4.2', '',    'ALTORRA SPEC \u00b7 v7') +
                txt(110, 237, 'middle', '0.20', '4.2', '',    'CARTAGENA \u00b7 CO') +

                /* Measurement ref marks */
                txt(15, 78,  'end', '0.20', '4.2', '', 'A') +
                txt(15, 158, 'end', '0.20', '4.2', '', 'B') +
                txt(15, 238, 'end', '0.20', '4.2', '', 'C') +

                '</svg>'
            );
        },

        /* ─────────────────────────────────────────
           NAVIGATE TO SLIDE
        ───────────────────────────────────────── */
        _goTo: function (index) {
            FW.index = index;

            var slides = document.querySelectorAll('.fw-slide');
            var dots   = document.querySelectorAll('.fw-dot');

            slides.forEach(function (s, i) {
                var active = (i === index);
                if (active) {
                    /* Force animation restart via reflow */
                    s.classList.remove('fw-slide--active');
                    void s.offsetWidth;
                    s.classList.add('fw-slide--active');
                    s.setAttribute('aria-hidden', 'false');
                    var lnk = s.querySelector('.fw-info');
                    if (lnk) lnk.setAttribute('tabindex', '0');
                } else {
                    s.classList.remove('fw-slide--active');
                    s.setAttribute('aria-hidden', 'true');
                    var lnk2 = s.querySelector('.fw-info');
                    if (lnk2) lnk2.setAttribute('tabindex', '-1');
                }
            });

            dots.forEach(function (d, i) {
                var active = (i === index);
                d.classList.toggle('fw-dot--active', active);
                d.setAttribute('aria-selected', active ? 'true' : 'false');
            });

            FW._preloadNext(index);

            /* Live region for screen readers */
            var live = document.getElementById('fw-live');
            if (live) {
                var veh   = FW.vehicles[index] || {};
                var marca = veh.marca ? veh.marca.charAt(0).toUpperCase() + veh.marca.slice(1) : '';
                live.textContent =
                    'Veh\u00edculo ' + (index + 1) + ' de ' + FW.total +
                    ': ' + marca + ' ' + (veh.modelo || '');
            }
        },

        /* ─────────────────────────────────────────
           IMAGE PRELOAD
        ───────────────────────────────────────── */
        _preloadNext: function (currentIndex) {
            if (!FW.vehicles.length) return;
            /* Precarga siguiente + sucesor para evitar popping en swipe rápido */
            [1, 2].forEach(function (offset) {
                var v = FW.vehicles[(currentIndex + offset) % FW.total];
                if (!v) return;
                var src = v.featuredCutoutPng || v.imagen;
                if (src) { var img = new Image(); img.src = src; }
            });
        },

        /* ─────────────────────────────────────────
           AUTO-ROTATION
        ───────────────────────────────────────── */
        _startAutoRotate: function () {
            clearInterval(FW.timer);
            FW.timer = setInterval(function () {
                FW._goTo((FW.index + 1) % FW.total);
            }, 6500);
        },

        _stopAutoRotate: function () {
            clearInterval(FW.timer);
        },

        /* ─────────────────────────────────────────
           EVENT BINDINGS
        ───────────────────────────────────────── */
        _bindEvents: function () {
            var section = document.getElementById('fw-banner');
            var prev    = document.getElementById('fw-prev');
            var next    = document.getElementById('fw-next');
            var dotsEl  = document.getElementById('fw-dots');
            var track   = document.getElementById('fw-track');
            if (!section) return;

            var restart = function () {
                if (!FW.reducedMotion && FW.total > 1) FW._startAutoRotate();
            };

            /* Pause on hover */
            section.addEventListener('mouseenter', FW._stopAutoRotate);
            section.addEventListener('mouseleave', restart);

            /* Arrow buttons — JS pressed class prevents stuck :active on mobile */
            [prev, next].filter(Boolean).forEach(function (btn) {
                btn.addEventListener('touchstart', function () {
                    btn.classList.add('fw-nav--pressed');
                }, { passive: true });
                btn.addEventListener('touchend', function () {
                    btn.classList.remove('fw-nav--pressed');
                }, { passive: true });
                btn.addEventListener('touchcancel', function () {
                    btn.classList.remove('fw-nav--pressed');
                }, { passive: true });
            });

            /* Fallback: clear pressed state on global pointerup (finger released outside button) */
            window.addEventListener('pointerup', function () {
                [prev, next].filter(Boolean).forEach(function (btn) {
                    btn.classList.remove('fw-nav--pressed');
                });
            }, { passive: true });

            /* Clear pressed state when tab becomes hidden (prevents stuck state on tab switch) */
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) {
                    [prev, next].filter(Boolean).forEach(function (btn) {
                        btn.classList.remove('fw-nav--pressed');
                    });
                }
            });

            if (prev) prev.addEventListener('click', function () {
                FW._stopAutoRotate();
                FW._goTo((FW.index - 1 + FW.total) % FW.total);
                restart();
            });
            if (next) next.addEventListener('click', function () {
                FW._stopAutoRotate();
                FW._goTo((FW.index + 1) % FW.total);
                restart();
            });

            /* Page Visibility API — pause when tab hidden, resume on return */
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) {
                    FW._stopAutoRotate();
                } else {
                    restart();
                }
            });

            /* Dot clicks */
            if (dotsEl) dotsEl.addEventListener('click', function (e) {
                var dot = e.target.closest('.fw-dot');
                if (!dot) return;
                FW._stopAutoRotate();
                FW._goTo(parseInt(dot.dataset.index, 10));
                restart();
            });

            /* Keyboard: ArrowLeft / ArrowRight */
            section.addEventListener('keydown', function (e) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    FW._stopAutoRotate();
                    FW._goTo((FW.index - 1 + FW.total) % FW.total);
                    restart();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    FW._stopAutoRotate();
                    FW._goTo((FW.index + 1) % FW.total);
                    restart();
                }
            });

            /* Touch swipe — bound to full section for wider hit area on mobile */
            var txStartX = 0, txStartY = 0;
            section.addEventListener('touchstart', function (e) {
                if (e.target.closest('.fw-nav')) return;
                txStartX = e.touches[0].clientX;
                txStartY = e.touches[0].clientY;
                FW._stopAutoRotate();
            }, { passive: true });
            section.addEventListener('touchend', function (e) {
                if (e.target.closest('.fw-nav')) return;
                var dx = txStartX - e.changedTouches[0].clientX;
                var dy = txStartY - e.changedTouches[0].clientY;
                /* Only slide when horizontal swipe dominates vertical */
                if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
                    if (dx > 0) FW._goTo((FW.index + 1) % FW.total);
                    else        FW._goTo((FW.index - 1 + FW.total) % FW.total);
                }
                restart();
            }, { passive: true });
        },

        /* ─────────────────────────────────────────
           ICON HELPER — monoline SVG (stroke-width 2)
        ───────────────────────────────────────── */
        _svg: function (paths, size) {
            return (
                '<svg width="' + (size || 13) + '" height="' + (size || 13) + '"' +
                ' viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
                ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' +
                ' aria-hidden="true">' + paths + '</svg>'
            );
        },

        /* Wrapper that returns a slightly larger icon for the data rail */
        _railIcon: function (icon) {
            /* Icons are already 13px; rail needs 15px */
            return icon.replace(/width="13" height="13"/, 'width="15" height="15"');
        },

        /* ── Icon definitions ── */

        /* Calendar — Año */
        _icoYear: function () {
            return FW._svg(
                '<rect x="3" y="4" width="18" height="18" rx="2"/>' +
                '<line x1="16" y1="2" x2="16" y2="6"/>' +
                '<line x1="8"  y1="2" x2="8"  y2="6"/>' +
                '<line x1="3"  y1="10" x2="21" y2="10"/>'
            );
        },

        /* Gauge — Kilometraje */
        _icoKm: function () {
            return FW._svg(
                '<path d="M12 5a7 7 0 1 0 7 7"/>' +
                '<path d="M12 12l3.5-3.5"/>' +
                '<circle cx="12" cy="12" r="1.5"/>'
            );
        },

        /* Gear / cog — Transmisión */
        _icoTrans: function () {
            return FW._svg(
                '<circle cx="12" cy="12" r="3"/>' +
                '<path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12' +
                'M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>'
            );
        },

        /* Fuel pump — Combustible */
        _icoFuel: function () {
            return FW._svg(
                '<path d="M3 22V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17"/>' +
                '<line x1="3" y1="22" x2="14" y2="22"/>' +
                '<path d="M14 9h3a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1v5"/>' +
                '<rect x="5" y="7" width="5" height="3" rx="1"/>'
            );
        },

        /* Star — badges y premium tag */
        _icoStar: function () {
            return FW._svg(
                '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02' +
                ' 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
                11
            );
        },

        /* Arrow right — CTA */
        _icoArrow: function () {
            return FW._svg('<polyline points="9 18 15 12 9 6"/>', 14);
        },

        /* Car body — Tipo de vehículo */
        _icoCar: function () {
            return FW._svg(
                '<path d="M7 17m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/>' +
                '<path d="M17 17m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/>' +
                '<path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2"/>' +
                '<path d="M9 17h6"/>'
            );
        },

        /* Map pin — Ubicación */
        _icoLocation: function () {
            return FW._svg(
                '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>' +
                '<circle cx="12" cy="10" r="3"/>'
            );
        },

        /* Pill wrapper */
        _pill: function (icon, text) {
            return '<span class="fw-pill">' + icon + text + '</span>';
        }
    };

    /* ── Expose globally ── */
    window.initFeaturedWeekBanner = FW.init.bind(FW);
    window.FeaturedWeekBanner     = FW;

    /*
     * Backwards-compatibility shim:
     * main.js llama loadDestacadosBanner() — este alias mantiene esa interfaz.
     */
    window.loadDestacadosBanner = window.initFeaturedWeekBanner;

}());
