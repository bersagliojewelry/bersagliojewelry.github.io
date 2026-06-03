#!/usr/bin/env node
// ============================================================================
// 🧪 test-build.mjs — Prueba experimental de integridad de activos y páginas
// ============================================================================
// Lanza el servidor de previsualización local, descarga todos los HTML y verifica
// que cada script (JS), hoja de estilo (CSS) e imagen referenciada exista (200 OK).
// Evita enlaces rotos y assets extraviados antes de desplegar.
// ============================================================================

import { spawn } from 'child_process';
import http from 'http';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORT = 4173;
const HOST = '127.0.0.1';
const BASE_URL = `http://${HOST}:${PORT}`;

const PAGES = [
  '/',
  '/colecciones.html',
  '/pieza.html',
  '/contacto.html',
  '/nosotros.html',
  '/carrito.html',
  '/journal.html',
  '/entrada.html',
  '/gracias.html',
  '/terminos.html',
  '/privacidad.html',
  '/admin-login.html',
];

console.log('🧪 Iniciando prueba experimental de build e integridad...');

// Helper to fetch URL as a Promise
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
    }).on('error', reject);
  });
}

async function run() {
  // 1. Iniciar servidor vite preview en puerto 4173
  console.log(`\n1) Lanzando servidor preview local en puerto ${PORT}...`);
  const server = spawn('npx', ['vite', 'preview', '--port', PORT, '--host', HOST], {
    cwd: ROOT,
    shell: true,
  });

  server.stderr.on('data', (data) => {
    console.error(`[Server Error] ${data}`);
  });

  // Esperar 1.5s a que el servidor esté activo
  await new Promise(r => setTimeout(r, 1500));

  let errors = 0;
  const verifiedAssets = new Set();

  try {
    // 2. Probar cada página y escanear sus activos
    console.log('\n2) Escaneando páginas públicas y administrativas:');
    for (const page of PAGES) {
      const pageUrl = `${BASE_URL}${page}`;
      try {
        const { status, body } = await fetchUrl(pageUrl);
        if (status !== 200) {
          console.log(`  ❌ ${page} -> Retornó código de estado: ${status}`);
          errors++;
          continue;
        }
        console.log(`  ✅ ${page} -> 200 OK`);

        // Analizar HTML en busca de scripts, estilos e imágenes
        const regexes = {
          scripts: /<script[^>]+src=["']([^"']+)["']/g,
          styles: /<link[^>]+href=["']([^"']+\.css)["']/g,
          images: /<img[^>]+src=["']([^"']+)["']/g
        };

        const assets = [];
        let match;

        // Extraer activos referenciados
        for (const [type, regex] of Object.entries(regexes)) {
          while ((match = regex.exec(body)) !== null) {
            let assetPath = match[1];
            // Ignorar enlaces externos o URLs de datos
            if (assetPath.startsWith('http') || assetPath.startsWith('//') || assetPath.startsWith('data:')) {
              continue;
            }
            // Normalizar ruta relativa
            if (!assetPath.startsWith('/')) {
              assetPath = '/' + assetPath;
            }
            assets.push(assetPath);
          }
        }

        // Verificar cada activo
        for (const asset of assets) {
          if (verifiedAssets.has(asset)) continue;
          verifiedAssets.add(asset);

          const assetUrl = `${BASE_URL}${asset}`;
          try {
            const { status: assetStatus } = await fetchUrl(assetUrl);
            if (assetStatus !== 200) {
              console.log(`     ⚠️  Activo roto encontrado en ${page}: ${asset} (Estado: ${assetStatus})`);
              errors++;
            }
          } catch (err) {
            console.log(`     ⚠️  Error de red al verificar activo ${asset} en ${page}: ${err.message}`);
            errors++;
          }
        }
      } catch (err) {
        console.log(`  ❌ ${page} -> Falló conexión: ${err.message}`);
        errors++;
      }
    }

    console.log(`\n3) Escaneo finalizado. Activos únicos validados: ${verifiedAssets.size}`);
    if (errors === 0) {
      console.log('\n✅ PRUEBA EXPERIMENTAL EXITOSA: Todos los HTML y activos estáticos están íntegros.');
    } else {
      console.log(`\n⚠️  PRUEBA EXPERIMENTAL CON ADVERTENCIAS: Se encontraron ${errors} inconvenientes.`);
    }

  } finally {
    // 4. Detener el servidor
    console.log('\n4) Cerrando servidor preview...');
    server.kill();
  }

  process.exit(errors ? 1 : 0);
}

run().catch(err => {
  console.error('Fallo crítico en el test runner:', err);
  process.exit(1);
});
