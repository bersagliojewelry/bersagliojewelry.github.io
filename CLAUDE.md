# Bersaglio Jewelry - Instrucciones para Claude

## Sobre el proyecto
Sitio web de e-commerce de alta joyeria colombiana (esmeraldas, diamantes, oro 18k).
URL: https://bersagliojewelry.co/
Stack: HTML, CSS, JavaScript vanilla, Firebase (Firestore + Auth + Storage).

## Estructura del sitio
- `index.html` — Pagina principal / landing
- `colecciones.html` — Todas las colecciones
- `anillos.html`, `argollas.html`, `topos-aretes.html`, `dijes-colgantes.html` — Categorias
- `pieza.html` — Detalle de pieza individual
- `carrito.html`, `lista-deseos.html` — Carrito y wishlist
- `contacto.html`, `nosotros.html`, `servicios.html` — Paginas informativas
- `journal.html`, `entrada.html` — Blog
- `admin*.html` — Panel de administracion
- `css/` — Estilos
- `js/` — Scripts
- `img/` — Imagenes

## Diseno con Stitch
Siempre que te pida disenar algo, usa las herramientas de Stitch MCP para generar el diseno primero:
1. Usa `generate_screen_from_text` para crear disenos nuevos desde descripciones de texto.
2. Usa `edit_screens` para modificar disenos existentes.
3. Usa `generate_variants` para crear variantes de un diseno.
4. Usa `list_projects` y `list_screens` para ver los disenos existentes.
5. Despues de generar el diseno en Stitch, implementa el resultado en el codigo HTML/CSS/JS del proyecto.

## Paleta de colores
- Esmeralda oscuro: #0a1a0f, #0d2818, #1a4d2e
- Dorado: #c8a96e, #d4af37, #b8860b
- Fondo oscuro: #050a07
- Texto claro: #f5f0e8, #e8dcc8

## Estilo de diseno
- Lujo, elegancia, minimalismo
- Tipografia serif para titulos, sans-serif para cuerpo
- Animaciones sutiles (GSAP)
- Responsive / mobile-first
- Idioma: Espanol (Colombia)
