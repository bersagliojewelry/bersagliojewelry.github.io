# Handoff: Rediseño Bersaglio Jewelry → web pública

## Qué es este paquete
Un paquete de **handoff para Claude Code** que contiene todo lo necesario para **reemplazar el
diseño actual** de la web pública `bersagliojewelry.github.io` por el rediseño que construimos en
el Design System de Bersaglio. 

> **Importante:** los archivos `.jsx` y `kit.css` de este bundle son **referencias de diseño**
> (un _UI kit_ hecho con React + Babel para prototipar look & feel). **No se copian tal cual**:
> la tarea es **recrear estos cambios dentro del repo de producción**, que usa **JavaScript vanilla
> con template literals `html\`…\``** y **ES modules** — siguiendo sus patrones existentes
> (`js/pages/*.js`, `js/core/*`, `css/*.css`). La **buena noticia**: el kit usa **los mismos
> nombres de clase CSS de producción**, así que casi todo el CSS nuevo se aplica directo.

## Fidelidad
**Alta fidelidad (hi-fi).** Colores OKLCH finales, tipografía, spacing, easings e interacciones
están definidos. Recrear con fidelidad de pixel usando los patrones del repo.

## Por dónde empezar
1. Lee **`MIGRACION.md`** — es la guía maestra: changelog exhaustivo por página (Home, Nosotros,
   Contacto), valores exactos de tipografía/spacing, secciones nuevas, SVG/logos, copy corregido,
   assets, checklist y mapa de archivos.
2. Usa **`PROMPT-PARA-CLAUDE-CODE.md`** — el prompt listo para pegar en Claude Code.
3. Consulta los **archivos de referencia** (`kit.css`, `components/*.jsx`) para liftar valores
   exactos (hex/oklch, radios, paddings, easings, paths de SVG).
4. Copia los **assets** (`assets/*.png`) a `/img/` del repo.

## Resumen de cambios (detalle completo en MIGRACION.md)
- **Estándares globales:** spacing uniforme (Home 46px · Nosotros/Contacto 72px), escala
  tipográfica editorial reducida, SVG finos de marca (sin emoji), regla del footer.
- **Home:** header “Dynamic Island” (morph al scroll), botón Favoritos con badge + ícono carrito,
  sección Atelier con joya `gema.png` (6 destacadas), **secciones nuevas** Bersaglio Films y
  feed de Redes, **dock flotante “Atajos”** (isla de agua esmeralda+oro), footer legal,
  carrito vacío con ilustración, CTA “Nuestra Maison” + dirección real, íconos de servicios,
  reveals con IntersectionObserver, count-up, shimmer del botón, **parallax del hero desactivado**.
- **Nosotros:** tipografía reducida, spacing 72px, eyebrows obvios eliminados, timeline en 1 fila,
  sección Prensa → **Reseñas de clientes (Google Maps)**, correcciones de copy (atelier, ubicación, visitas).
- **Contacto:** tipografía reducida, spacing 72px, teléfono inexistente eliminado, SVG mejorados
  (WhatsApp/Instagram/banners/mapa), proceso alineado + copy pasos 01/04, **FAQ rediseñada 2×2**,
  correcciones de copy (cita, parqueadero, idiomas).

## Pendientes que requieren al cliente
- **Datos dinámicos:** producción usa Firestore — mantener ese cableado (destacadas, etc.).
- **Reseñas / Films / Redes:** reemplazar ejemplos por contenido real (Google Maps, videos,
  Meta Graph API / TikTok Display API).

## Archivos de este paquete
| Archivo | Qué es |
|---|---|
| `MIGRACION.md` | Guía maestra de migración (changelog + valores exactos + checklist). |
| `PROMPT-PARA-CLAUDE-CODE.md` | Prompt listo para pegar en Claude Code. |
| `kit.css` | **Fuente de todo el CSS nuevo** (motion, header morph, dock, atelier, reseñas, spacing). |
| `components/Screens.jsx` | Home: hero, atelier (joya), grids, pieza, quick-view. |
| `components/Sections.jsx` | Bersaglio Films + feed de Redes (con `PlatformIcon` = logos de marca). |
| `components/Pages.jsx` | Nosotros + Contacto (markup, copy, SVG, datos). |
| `components/Overlays.jsx` | Dock “Atajos” (isla de agua) + filtro gooey + modales. |
| `components/Shell.jsx` | Header, footer, drawer carrito, logos/íconos. |
| `components/data.jsx` | Datos de ejemplo (productos, films, social, reseñas, FAQ, proceso). |
| `assets/gema.png` | Joya central de la sección Atelier (home). |
| `assets/emerald-gem.png` | Gema de la isla dinámica (dock Atajos). |
| `assets/cart-gems.png` | Ilustración del carrito vacío. |

**Carpeta `css-reference/`** — copias de los CSS de página **ya editados** (`nosotros.css`,
`contacto.css`, `components.css`, `home.css`) para que Claude haga _diff_ contra los de producción
y lifte los valores finales exactos de tipografía/spacing/copy. (Los cambios de Nosotros y Contacto
viven en estos archivos, no en `kit.css`.)
