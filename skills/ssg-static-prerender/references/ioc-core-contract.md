# Contrato del Core Library (IoC) — `scripts/visibility-core/`

> El core compartido = **funciones PURAS** (entran datos, salen strings/objetos). **JAMÁS lee un template,
> jamás toca el FS de un proyecto, jamás hardcodea un nombre de proyecto.** Cada tenant ORQUESTA. Distribución
> = **D′ vendored**: el HUB (cars-operador) escribe el core canónico y lo replica byte-idéntico a cada repo
> (`scripts/visibility-core/`), con un `VERSION`; un `brain-check` extendido hashea y AVISA de drift (no aborta —
> sin lockstep: un repo puede ir atrasado). Migrar a NPM luego = re-empaque (API estable). Build node-plano,
> ESM vanilla, **cero deps pesadas**.

## API pública (estable — lo que un tenant importa)
```js
import {
  VERSION,                 // string semver del core vendored
  validateTenant,          // (config) -> void | THROW (exit 1) si vertical/campos no corresponden
  buildSchema,             // (vertical, entityOrItemData) -> string JSON-LD (ya pasado por safeJsonLd)
  buildSitemap,            // (entries:[{loc,lastmod}]) -> string XML
  buildFeed,               // (feedType, items, config) -> string (XML/TSV)  [product-feeds]
  imagePipeline,           // (srcPath, opts) -> {webp, avif, imageObject}    [image-pipeline]
  safeJsonLd,              // (obj|string) -> string seguro (neutraliza </script> + U+2028/29)
  escapeHtml, escapeAttr, escapeXml,   // por contexto
  bakeIntegrity,           // (html, minBytes) -> void | THROW (no cierra </html> o < minBytes)
} from './visibility-core/index.mjs';
```

## Lo que el tenant hace (NO el core) — `tenant-build.mjs`
```js
import cfg from '../tenant_config.json' assert { type: 'json' };
validateTenant(cfg);                               // 1. fail-fast anti-contaminación
const items = (await connectDb(cfg)).filter(i => i.status === 'published');  // 2. solo published
for (const it of items) {
  let html = readTemplate(cfg, it);                // 3. el TENANT lee SU template
  for (const a of REQUIRED_ANCHORS) if (!html.includes(a)) throw Error('ancla faltante: ' + a);
  html = html
    .replace('<!--LD-->', `<script type="application/ld+json">${buildSchema(cfg.vertical, it)}</script>`)
    .replace('<!--TITLE-->', escapeHtml(title(it)))
    .replace('<!--OG-->', ogTags(it));             // 4. el TENANT inyecta donde quiera
  bakeIntegrity(html, cfg.minBakeBytes);           // 5. guard antes de escribir
  writeOut(cfg, it, html);
}
writeFile('sitemap.xml', buildSitemap(entries));   // 6. core produce, tenant escribe
```

## Por qué IoC (la corrección de Gemini, adoptada)
Si el core leyera/manipulara el template, el template quedaría acoplado al contrato de anclas del core → cualquier
cambio en la lógica de inyección obligaría a tocar a mano los HTML de TODOS los proyectos (lockstep). Con IoC el
core solo produce piezas; el tenant decide dónde van. → templates libres por proyecto + cambios no-breaking del
core sin tocar templates. **Regla de oro**: si te ves pasando un path de template AL core, lo estás haciendo mal.

## Capas de la arquitectura HUB
| Capa | Qué | Compartido? | Distribución |
|---|---|---|---|
| **Skills** (7 + `seo-auditor`) | playbooks + plantillas (markdown) | sí | replicación de skills (global `~/.claude/skills` + `skills/` por repo) |
| **Core Library** (JS) | `visibility-core/` funciones puras | sí (byte-idéntico) | **D′ vendored** + `VERSION` + brain-check hash (sin lockstep) |
| **tenant-build.mjs** | orquestador | **NO** (por proyecto) | vive en cada repo |
| **templates HTML + tenant_config + data** | por proyecto | **NO** | vive en cada repo |
