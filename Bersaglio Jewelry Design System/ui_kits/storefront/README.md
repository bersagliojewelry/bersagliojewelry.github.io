# Bersaglio Storefront — UI Kit

A high-fidelity, interactive recreation of the **Bersaglio Jewelry** storefront, built on the
Liquid Glass design system. Open `index.html` — it's a working click-through prototype (fake data,
real interactions).

## Screens & flow
- **Home** — Dynamic-Island header pill, cinematic hero, credentials marquee, iOS category dock,
  featured curaduría grid, editorial split, services, and the "Casa San Agustín" CTA.
- **Colecciones (Catalog)** — filterable product grid (Todas / Aretes / Anillos / …).
- **Pieza (Product detail)** — gallery + thumbnails, specs table, add-to-cart, wishlist, trust row.
- **Nosotros / Contacto** — lightweight on-brand placeholder panels.
- **Cart drawer** — slide-in glass drawer with qty controls, subtotal, checkout (mirrors `shell.jsx`).

### Interactions that work
Navigate via the header pill · open any piece · **add to cart** (drawer opens + toast) · adjust qty /
remove · **wishlist toggle** (heart fills, toast) · filter the catalog · scrolled header shrinks &
raises blur.

## Files
| File | Role |
|------|------|
| `index.html` | App shell + router state, cart/wishlist state, toast. Load this. |
| `data.jsx` | `PRODUCTS`, `CATEGORIES`, `MARQUEE`, `SERVICES`, `fmt$` (es-CO COP). |
| `Shell.jsx` | `BersaglioLogo`, line-icon set, `Header`, `CartDrawer`, `Footer`. |
| `Screens.jsx` | `HomeScreen`, `CatalogScreen`, `PiezaScreen`, shared `ProductCard`. |
| `css/liquid-glass.css` | Design-system source of truth (tokens, `.glass`, `.btn-aqua`, `.chip`). Copied verbatim from the production repo. |
| `css/components.css` | Header pill, footer, drawers, modals, search palette. Copied verbatim. |
| `css/kit.css` | Layout for hero / marquee / dock / grid / pieza / editorial. |

## How it's wired
React 18 + inline Babel JSX. Components export to `window` at the end of each file
(`Object.assign(window, {...})`) so the separate `<script type="text/babel">` files share scope.
All imagery resolves to the shared `../../assets/` folder.

## Fidelity notes
Component implementations are simplified/cosmetic recreations — they reproduce the *look and
interactions* of the real site, not its Firestore/auth/checkout logic. Copy, prices (COP),
category names and the founder signature ("Kary Mendoza") are lifted from the production bundle.
The real site is Spanish-only; so is this kit.
