#!/usr/bin/env node
/**
 * Bersaglio Jewelry — image optimization (Phase L).
 *
 * Convierte los assets del bundle BERSAGLIO NOVO (PNG/JPG en public/img/)
 * en variantes responsive AVIF + WebP a 3 anchos:
 *   - 800w  (mobile)
 *   - 1200w (tablet)
 *   - 1600w (desktop)
 *
 * Output: public/img/<name>-<width>.<ext> + public/img/<name>.<ext> original.
 *
 * Uso: node scripts/optimize-images.mjs
 *
 * Diseño:
 *   - AVIF: q60, effort 6 — mejor compresión, ~50% más liviano que WebP
 *   - WebP: q82, effort 5 — fallback universal
 *   - El PNG/JPG original se conserva como fallback final (sin recomprimir)
 *
 * Se ejecuta a mano (no en cada build). Los outputs se commitean al repo.
 */

import sharp from 'sharp';
import { readdirSync, statSync, existsSync } from 'fs';
import { resolve, parse, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const SRC_DIR = resolve(__dirname, '..', 'public', 'img');

// Solo los assets que vienen del bundle BERSAGLIO NOVO.
// Otros (banner-1200.avif etc del diseño anterior, gema, collage, logos)
// se quedan tal cual.
const SOURCES = [
    'banner-hero.png',
    'earrings-emerald.png',
    'earrings-travertino.png',
    'model-emerald.png',
    'ring-sapphire.jpg',
    'logo-bersaglio.png',
];

const WIDTHS = [800, 1200, 1600];

async function processFile(filename) {
    const inputPath = join(SRC_DIR, filename);
    if (!existsSync(inputPath)) {
        console.warn(`[skip] ${filename} not found`);
        return;
    }
    const { name } = parse(filename);
    const meta = await sharp(inputPath).metadata();
    console.log(`\n→ ${filename} (${meta.width}×${meta.height}, ${(statSync(inputPath).size / 1024).toFixed(1)} KB)`);

    for (const w of WIDTHS) {
        // Skip if requested width is larger than the source — would scale up.
        if (w > (meta.width || 0)) {
            console.log(`  skip ${w}w (larger than source)`);
            continue;
        }

        // AVIF
        const avifPath = join(SRC_DIR, `${name}-${w}.avif`);
        await sharp(inputPath)
            .resize({ width: w, withoutEnlargement: true })
            .avif({ quality: 60, effort: 6 })
            .toFile(avifPath);
        const avifSize = statSync(avifPath).size;
        console.log(`  ${name}-${w}.avif → ${(avifSize / 1024).toFixed(1)} KB`);

        // WebP
        const webpPath = join(SRC_DIR, `${name}-${w}.webp`);
        await sharp(inputPath)
            .resize({ width: w, withoutEnlargement: true })
            .webp({ quality: 82, effort: 5 })
            .toFile(webpPath);
        const webpSize = statSync(webpPath).size;
        console.log(`  ${name}-${w}.webp → ${(webpSize / 1024).toFixed(1)} KB`);
    }
}

(async () => {
    console.log(`Source: ${SRC_DIR}`);
    console.log(`Sources: ${SOURCES.length} files\nWidths: ${WIDTHS.join(', ')}`);
    for (const f of SOURCES) {
        try {
            await processFile(f);
        } catch (err) {
            console.error(`[error] ${f}:`, err.message);
        }
    }
    console.log('\n✓ Done.\n');
})();
