# Bersaglio Jewelry — Liquid Glass Design System

> Alta joyería con esmeraldas colombianas, diamantes certificados GIA y oro 18K.
> Atelier privado en el Centro Histórico de **Cartagena de Indias, Colombia**.

This design system lets a design agent produce on-brand interfaces, marketing pages,
editorial layouts and assets for **Bersaglio Jewelry** — a small, family-rooted
haute-jewelry boutique. The aesthetic is **"Liquid Glass"**: iOS 26 Aqua glassmorphism
fused with the editorial restraint of Cartier/Bulgari high-jewelry houses. Warm,
emerald-and-gold, never stark, never loud.

---

## 1 · Company & product context

**Who they are.** Bersaglio is an *atelier* (workshop-boutique), not a chain. The founder
**Kary Mendoza** "nació visitando a clientes de puerta en puerta" — the brand was built on
door-to-door closeness and trust, later anchored in a private house ("Casa San Agustín") in
the walled old city of Cartagena. Established **2014** (the Journal masthead reads *EST. 2014*);
copy cites *12+ años* and *800+ piezas únicas*.

**What they sell.** One-of-a-kind, made-to-order fine jewelry in **18-karat gold (Ley 750)**
set with **Colombian emeralds** (Muzo, Coscuez, Chivor) and **GIA-certified diamonds**.
Product categories (`slug`):
- **Anillos** (rings) · `anillos`
- **Topos / Aretes** (stud earrings) · `topos-aretes`
- **Argollas** (hoops / wedding bands) · `argollas`
- **Dijes / Colgantes** (pendants) · `dijes-colgantes`
- **Pulseras** (bracelets) · `pulseras`
- **Editorial** (campaign / lookbook pieces) · `editorial`

**Services.** Diseño a medida (bespoke), Asesoría privada 1:1 con gemólogos, Certificación GIA,
Garantía vitalicia (lifetime maintenance/polishing). Certified **JA · Jewelers of America**.

**Prices** are shown in Colombian Pesos, formatted `$ 14.800.000 COP` (es-CO grouping, `mono` font).

**The product surfaces (one real codebase).** A static, JS-hydrated e-commerce site:
- Storefront: `index.html` (home), `colecciones.html` (catalog), `pieza.html` (PDP),
  `carrito.html` (cart), `lista-deseos.html` (wishlist), `nosotros.html` (about),
  `journal.html` + `entrada.html` (editorial magazine), `contacto.html`, legal pages.
- Admin: `admin-*.html` (Firestore-backed CMS for pieces, collections, users, inquiries).
- The Journal ("*The Bersaglio Journal*", Issue Nº 14) is a NYT-style editorial magazine —
  a real differentiator, with long-form articles on emeralds, gold karat, heritage, care rituals.

### Sources (for the reader — you may not have access)
- **GitHub repo:** https://github.com/bersagliojewelry/bersagliojewelry.github.io
  (the production site — `css/liquid-glass.css` is the canonical token source; `css/home.css`,
  `css/components.css`, `js/pages/home.js`, `js/data/journal.js` carry the real copy & components.
  `.handoff/BERSAGLIO NOVO/project/js/shell.jsx` is the original React shell — header, footer,
  cart drawer, product data. **Explore this repo to build richer Bersaglio designs.**)
- **Logo source:** `uploads/LOGO BJ2.png` (provided) → `assets/logo-bj-mark.png`.
- Live domain referenced in code: `bersagliojewelry.co`.

---

## 2 · Content fundamentals (voice & copy)

**Language: Spanish (Colombia, es-CO).** All customer-facing copy is in Spanish. English appears
only as deliberate editorial flourish in one place: the masthead "*The Bersaglio Journal*".

**Person: "tú" (informal-intimate), first-person plural "nosotros" for the house.**
The house speaks as an *us* that accompanies a *you*: *"nos tomamos el tiempo para asesorarte"*,
*"Te invitamos a cruzar el umbral"*, *"Te acompañamos en cada etapa."* It is warm and personal,
never corporate "usted."

**Tone: poetic, patient, heirloom-minded — luxury as emotion, not flex.** Copy sells *time,
memory and legacy*, not carats. Signature lines:
- *"El arte de escuchar tu historia, tallado en una joya única."*
- *"Más que una joya, un legado familiar."*
- *"La esmeralda es el calendario más viejo que tenemos en las manos."*
- *"La eternidad no es estridente. Es discreta."*

**Casing.** Headlines are **sentence case** in serif display (often with an italic second clause).
**Eyebrows / kickers / meta** are `UPPERCASE` with wide letter-spacing (`0.25–0.32em`), small,
in Manrope or Space Mono — e.g. `CURADURÍA DEL ATELIER`, `EN VIVO`, `ESTA SEMANA`, `EST. 2014`.

**Recurring vocabulary:** *atelier, casa/Maison, pieza, curaduría, legado, esmeralda colombiana,
Muzo/Coscuez/Chivor, oro 18K · Ley 750, a medida, garantía vitalicia, custodia, orfebrería pausada.*
Credential ribbon items: *"Oro 18K · Ley 750", "Garantía Vitalicia", "Una pieza, una historia."*

**Numerals & stats** are spare and meaningful: `12+ Años`, `800+ Piezas únicas`, `JA Certificado`.
Avoid invented statistics — keep the data restrained.

**Emoji: never.** No emoji anywhere. The only glyphs used decoratively are a **diamond ◆** (Space
Mono / inline SVG rhombus) as separators and an em-dash/middot `·` between meta items.

**The Journal voice** shifts to journalistic long-form: interviews with em-dash Q&A
(*"— ¿Qué es lo primero que mira…?"*), datelines, bylines (*"Por Kary Mendoza · Directora"*),
read-time (*"8 min de lectura"*), drop-caps. Section flags: *Reportaje, Atelier, Mercado, Diseño,
Cuidado, Entrevista, Editorial, Patrimonio.*

---

## 3 · Visual foundations

**Palette.** Three families, all authored in **OKLCH** for premium gamut:
- **Emerald** (primary) — 9-step scale, hue 155. Workhorse: `--bj-emerald-700` (buttons, links),
  deep `-900` for ink-on-light gradients.
- **Gold** (accent) — 5-step scale, hue 80-90. Used sparingly: rim lights, dividers, the italic
  headline gradient, "best seller" dots, hairline accents. Never large gold fills.
- **Neutrals** — Pearl / Ivory / Cream / Mist. **Backgrounds are never pure white.**
- **Ink** — *there is no black.* Text is `--bj-ink-emerald` (oklch 18% 0.05 155) / soft / mute.
  This emerald-tinted "black" is a core brand rule.

**Background — "luz que respira" (breathing light).** A fixed `.bj-world` layer paints the whole
page: layered radial gradients (emerald top-left, gold top-right, emerald bottom) over a vertical
pearl→mist linear gradient, plus two huge blurred color orbs that **drift on a 28s loop**. Content
floats above it. There are **no flat color sections** — everything sits on living light. A faint
SVG `grain` overlay (opacity 0.06, `mix-blend: overlay`) adds film texture on hero surfaces.

**Glassmorphism is the structural primitive.** The `.glass` class = translucent tint +
`backdrop-filter: blur(28px) saturate(180%)` + a 1px white border + a top **pinlight** highlight
(`::before`, screen blend) + a layered inset/drop shadow. Variants: `.glass-lg` (bigger radius +
shadow), `.glass-pill`, `.glass-emerald` (tinted dark-on-emerald), and **`.glass-iridescent`** —
a conic-gradient rim (emerald→gold→rose→cyan) masked to a 1.5px border for an oil-on-water edge.
Cards, header, footer, drawers, modals, search palette are all glass.

**Typography.** Serif display + clean sans pairing:
- **Cormorant Garamond** (`--font-display`) — editorial headings, light weight 300, tight tracking,
  frequent *italic*. The signature voice.
- **Fraunces** (`--font-brand`) — the BERSAGLIO wordmark and big numerals.
- **Manrope** (`--font-ui`) — all body, nav, buttons, forms.
- **Space Mono** (`--font-mono`) — prices, coordinates, eyebrows, issue numbers, tabular nums.
  All four are now self-hosted from `fonts/` via `@font-face` in `colors_and_type.css` (no CDN).

**Corner radii — soft squircles.** `12 / 18 / 24 / 34 / 48 px` + `999 pill`. Buttons & chips are
pills; cards are `24–34`; hero frame `40–42`; footer `40`. Nothing is sharp-cornered.

**Elevation.** No hard drop shadows. Shadows are *multi-layer*: an inner top white highlight +
inner bottom dark + a soft emerald-tinted ambient + a long throw. Two tiers: `--glass-shadow`,
`--glass-shadow-lg`. Elevation reads as *light catching glass*, not as a box on a floor.

**Borders & rims.** 1px translucent-white hairlines everywhere (`oklch(100% 0 0 / 0.5)`).
Premium surfaces add the iridescent conic rim or gold hairline dividers
(`linear-gradient(90deg, gold, transparent)`).

**Imagery.** Warm, cinematic, jewel-toned photography — emerald greens and 18K golds against
deep velvet/marble, often a Cartagena sunset, arches and sea behind the model. Saturated
(`filter: saturate(1.15) contrast(1.05)` on jewels), warm white balance, never B&W, never cool.
Images sit inside rounded frames with inner rim highlights and gradient *protection vignettes*
(top light → bottom emerald-ink) so white text stays legible. Responsive `avif/webp` sets.

**Layout.** Centered `.container` max 1360px, 32px gutters. Generous section rhythm (`100–110px`
vertical). Grid + flex with `gap`. **Fixed floating "Dynamic Island" header pill** (top:18px,
centered) that shrinks + raises blur on scroll. iOS-style **dock grids** (6-up category tiles).
Editorial split layouts (1.1fr / 1fr). NYT masthead grid for the Journal.

**Motion & micro-interaction.**
- **Easing:** `cubic-bezier(0.2,0.9,0.2,1)` (glass/general), `cubic-bezier(0.175,0.885,0.32,1.05)`
  (elastic — drawers, panels), `cubic-bezier(0.32,0.72,0,1)` (drawer slide).
- **Hover:** elements *lift* (`translateY(-2px…-10px)`) + shadow deepens + images scale `1.04–1.08`;
  nav/ghost surfaces brighten their white tint. Buttons translate up & scale `1.02`.
- **Press (haptic):** active state scales **down to `0.96`** with a swift `cubic-bezier(0.25,1,0.5,1)`
  — applied to every button, cart icon, pill, card. This tactile shrink is a signature.
- **Reveals:** `fade-up` (opacity 0 + translateY(24px) → in) with staggered delays.
- **Ambient loops:** background orb `drift` (28s), credential `marquee` (50s linear), journal ticker,
  hero blob float, button shimmer sweep. All gated by `prefers-reduced-motion`.

**Hover/press summary:** hover = lift + brighten + image zoom; press = shrink to 0.96; focus =
`2px gold outline, offset 3–5px`.

---

## 4 · Iconography

**System: hand-tuned inline SVG, thin stroke, no fill.** The site uses **stroke-only line icons**
drawn inline (`stroke-width: 1.6–2`, `fill: none`, `currentColor`, round caps/joins). They read as a
lightweight Feather/Lucide-style family. Recurring glyphs: location pin, cart, search, heart
(wishlist), arrow-right (`M5 12h14M13 5l7 7-7 7` — the house's "continue" arrow), hamburger,
close-X, plus/minus (qty), pen (bespoke), user (advisory), check (certification), shield (warranty),
chevron. Social: Instagram, Facebook, WhatsApp (all inline SVG).

**For new work, use [Lucide](https://lucide.dev) from CDN** — it matches the existing stroke weight
and rounded style almost exactly, so icons stay consistent. (No proprietary icon font ships with the
site; this is the documented closest match — flagged as a substitution.)

**Decorative glyphs:** a **diamond rhombus ◆ / rotated-square SVG** as separators (marquee, ticker),
and `·` middots in meta rows. **No emoji, ever.**

**Logo / wordmark.** The brand mark is a serif **"B"** (Fraunces, emerald `#0f5132`) centered in a
thin circle with a vertical construction axis — see `assets/logo-bj-mark.png` (the provided master)
and `assets/logo-bersaglio.png`. In code it is also drawn as a small inline SVG
(`circle + vertical line + serif "B"`). The lockup pairs the mark with **BERSAGLIO** (Fraunces,
letter-spacing 0.05em) over a tiny **JEWELRY** eyebrow (Manrope, 8px, 0.4em tracking, uppercase).

---

## 5 · File index (this folder)

| Path | What it is |
|------|------------|
| `README.md` | This document — context, content & visual foundations, iconography, index. |
| `MIGRACION-WEB-PUBLICA.md` | **Migration guide (Spanish)** — full changelog of every design/copy/interaction change made in the storefront kit and exactly how to mirror it into the public repo `bersagliojewelry.github.io`. **Start here to migrate.** |
| `MEJORAS-SEO-PERFORMANCE.md` | SEO & performance recommendations (actionable, with paste-ready code). |
| `SKILL.md` | Agent-Skills front-matter wrapper so this system is usable in Claude Code. |
| `colors_and_type.css` | All design tokens (color/glass/shadow/radii/spacing/motion) + semantic type roles. Import this first. |
| `assets/` | Logos (`logo-bj-mark.png`, `logo-bersaglio.png`, `logo-bj2.png`), jewelry & campaign imagery (`banner-hero`, `model-emerald`, `earrings-*`, `ring-sapphire`, `gema`, `collage`). |
| `preview/` | Design-system cards (swatches, type specimens, components) shown in the Design System tab. |
| `ui_kits/storefront/` | High-fidelity, interactive recreation of the Bersaglio storefront — `index.html` + JSX components. Start here to build pages. |

### Fonts
All four typefaces are now **self-hosted** from `fonts/` (the user supplied the brand files) via
`@font-face` rules at the top of `colors_and_type.css` — no CDN / Google Fonts link is required.
Fraunces, Cormorant Garamond and Manrope load as variable fonts; Space Mono as static weights
(400/700 + italics). The storefront kit declares the same faces in `ui_kits/storefront/css/kit.css`.

---

*Built from the production repository. To go deeper — richer components, the full Journal data,
the admin CMS, product schemas — explore
[github.com/bersagliojewelry/bersagliojewelry.github.io](https://github.com/bersagliojewelry/bersagliojewelry.github.io).*
