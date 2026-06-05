# Prompt para Claude Code

Copia y pega esto en Claude Code, **con el repositorio `bersagliojewelry.github.io` abierto** y
esta carpeta `design_handoff_bersaglio_redesign/` colocada dentro (o accesible) del proyecto.

---

```
Tengo el repositorio de mi web pública (bersagliojewelry.github.io) — JavaScript vanilla con
template literals html`…` y ES modules, estilos en css/*.css, páginas en js/pages/*.js.

En la carpeta design_handoff_bersaglio_redesign/ está el rediseño completo que quiero aplicar.
Quiero que REEMPLACES el diseño actual del sitio por este rediseño, con fidelidad de pixel,
respetando la arquitectura vanilla del repo (NO introduzcas React).

Empieza así:
1. Lee design_handoff_bersaglio_redesign/MIGRACION.md de principio a fin. Es la guía maestra:
   tiene el changelog exhaustivo por página (Home, Nosotros, Contacto), los valores exactos de
   tipografía y spacing, las secciones nuevas, los SVG/logos, el copy corregido verbatim, los
   assets y un checklist.
2. Lee design_handoff_bersaglio_redesign/kit.css (fuente de TODO el CSS nuevo) y los
   components/*.jsx como REFERENCIA para liftar valores exactos y paths de SVG. NO copies el JSX
   tal cual: pórtalo a funciones render que devuelven html`…` siguiendo el patrón de js/pages/*.js.

Estrategia de CSS: como el kit usa los MISMOS nombres de clase que producción, crea
css/enhancements.css, pega ahí los bloques nuevos de kit.css (excluye el @font-face y las clases
legacy .k-* del home — producción usa .home-*, .at-*, .hj-*), ajusta rutas de imagen
../../assets/… → /img/…, y cárgalo de ÚLTIMO en el <head> para que sus overrides ganen.

Copia los assets design_handoff_bersaglio_redesign/assets/*.png a la carpeta /img/ del repo
(o /public/img/) y ajusta las rutas.

Aplica TODO el checklist de MIGRACION.md. Trabaja página por página en este orden: primero los
estándares globales (tokens de motion en :root, header, footer), luego Home, luego Nosotros,
luego Contacto. Tras cada página, muéstrame un diff resumido y un screenshot si puedes.

Reglas que NO debes romper:
- Mantén el cableado dinámico de Firestore (piezas destacadas, etc.). No lo reemplaces por data estática.
- Conserva la responsividad y agrega prefers-reduced-motion a toda animación nueva.
- Reveals: usa IntersectionObserver (no el polling del kit).
- Parallax del hero: déjalo DESACTIVADO (decisión del cliente).
- Español es-CO, “tú”, sin emoji. No inventes datos (áreas, cargos, convenios, renders 3D).
- Deja como TODO visible: sustituir reseñas/Films/Redes de ejemplo por contenido real y conectar
  sus fuentes (Google Maps, Meta Graph API, TikTok Display API).

Cuando termines, dame un resumen de qué archivos creaste/modificaste y qué quedó pendiente.
```

---

## Cómo enviárselo a Claude Code (paso a paso)

1. **Descarga el zip** de este handoff (te dejo el botón de descarga en el chat).
2. **Descomprímelo dentro de tu repo** `bersagliojewelry.github.io/` (queda la carpeta
   `design_handoff_bersaglio_redesign/` en la raíz del repo).
3. Abre el repo en **Claude Code** (`claude` en la terminal, dentro de la carpeta del repo).
4. **Pega el prompt de arriba** (el bloque entre comillas).
5. Claude Code leerá `MIGRACION.md`, aplicará los cambios página por página y te irá mostrando
   diffs. Revisa, pídele ajustes y, cuando estés conforme, haz **commit + push** (se publica solo,
   es GitHub Pages).

> Consejo: trabaja en una **rama** (`git checkout -b rediseno-liquid-glass`) para revisar todo
> antes de mandarlo a `main`. Así ves el sitio en una preview y no tocas la web en vivo hasta estar listo.
