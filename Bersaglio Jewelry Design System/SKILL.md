---
name: bersaglio-design
description: Use this skill to generate well-branded interfaces and assets for Bersaglio Jewelry — a Cartagena (Colombia) haute-jewelry boutique selling Colombian emeralds, GIA diamonds and 18K gold under the "Liquid Glass" design system. Use for production work or throwaway prototypes/mocks. Contains essential design guidelines, OKLCH colors, type, fonts, assets, and an interactive storefront UI kit.
user-invocable: true
---

# Bersaglio Jewelry — Liquid Glass design skill

Read the **README.md** in this skill first — it carries the full brand context, content
fundamentals (Spanish / es-CO voice, "tú", emoji-never), visual foundations (emerald + gold +
pearl, glassmorphism, soft squircles, haptic press), and iconography. Then explore the other files.

## What's here
- `README.md` — context, content & visual foundations, iconography, file index.
- `colors_and_type.css` — all design tokens (color/glass/shadow/radii/spacing/motion) + semantic
  type roles. **Import this first** in any new artifact. Fonts (Fraunces, Cormorant Garamond,
  Manrope, Space Mono) are **self-hosted** from `fonts/` via `@font-face` in this file — no CDN needed.
- `assets/` — logos (`logo-bj-mark.png`, `logo-bersaglio.png`) and warm jewel-toned imagery
  (`banner-hero`, `model-emerald`, `earrings-*`, `ring-sapphire`, `gema`, `collage`).
- `preview/` — design-system specimen cards (color, type, components) — reference, not for shipping.
- `ui_kits/storefront/` — interactive, pixel-faithful storefront (home / catalog / pieza / cart).
  Copy components from `Shell.jsx` / `Screens.jsx` and the `css/` for fast, on-brand builds.

## How to work
If creating **visual artifacts** (slides, mocks, throwaway prototypes): copy assets out and produce
static HTML the user can open. Pull `colors_and_type.css` + the kit's `liquid-glass.css` for the
real glass/button/chip primitives; lift copy & products from `ui_kits/storefront/data.jsx`.

If working on **production code**: copy assets and absorb the rules here to become an expert in
designing with this brand — match the OKLCH palette, the serif-display + Manrope pairing, the glass
primitive, soft squircles, the `scale(0.96)` haptic press, and the Spanish, heirloom-minded voice.

If the user invokes this skill with no other guidance, ask what they want to build or design, ask a
few focused questions (surface, audience, Spanish vs other language, variations), then act as an
expert designer who outputs **HTML artifacts _or_ production code** depending on the need.

## Non-negotiable brand rules
- Never pure black (use `--bj-ink-emerald`) and never pure-white backgrounds (use Pearl).
- No emoji, ever. Icons are thin stroke-only line icons (Lucide is the CDN match).
- Spanish (es-CO), informal "tú", "nosotros" for the house. Prices `$ 14.800.000 COP`.
- Gold is an accent (rims, dividers, dots) — never a large fill.
- Everything floats on glass over breathing light; corners are soft squircles; press shrinks to 0.96.
