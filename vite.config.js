import { defineConfig } from 'vite';
import { resolve }       from 'path';
import { readdirSync, cpSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * Auto-discover every *.html file in the project root as a Vite entry point.
 * Nuevo .html = cero config adicional necesaria.
 *
 * Ejemplo de resultado:
 *   {
 *     index:              'abs/path/index.html',
 *     colecciones:        'abs/path/colecciones.html',
 *     'admin-piezas':     'abs/path/admin-piezas.html',
 *     ...
 *   }
 */
function discoverHtmlEntries() {
    return Object.fromEntries(
        readdirSync(__dirname)
            .filter(f => f.endsWith('.html'))
            .map(f => [f.slice(0, -5), resolve(__dirname, f)])
    );
}

/**
 * Plugin: copia snippets/ → dist/snippets/ después del build.
 * En desarrollo Vite sirve los archivos raíz directamente,
 * así que snippets/ funciona igual en dev y en producción.
 */
function copySnippetsPlugin() {
    return {
        name: 'copy-snippets',
        closeBundle() {
            const src  = resolve(__dirname, 'snippets');
            const dest = resolve(__dirname, 'dist', 'snippets');
            mkdirSync(dest, { recursive: true });
            cpSync(src, dest, { recursive: true });
        },
    };
}

export default defineConfig({

    root:      '.',
    publicDir: 'public',   // robots.txt, sitemap.xml, manifest.json

    plugins: [copySnippetsPlugin()],

    build: {
        outDir:     'dist',
        emptyOutDir: true,

        rollupOptions: {
            input: discoverHtmlEntries(),

            output: {
                // Nombres de chunk legibles en producción
                entryFileNames:  'js/[name]-[hash].js',
                chunkFileNames:  'js/chunks/[name]-[hash].js',
                assetFileNames:  'assets/[name]-[hash][extname]',
            },
        },

        // Umbral para mostrar warnings de tamaño (kB)
        chunkSizeWarningLimit: 400,
    },

    server: {
        host:   true,   // exponer en red local para probar en móvil
        port:   5173,
        open:   true,   // abrir el navegador automáticamente
    },

    preview: {
        host: true,
        port: 4173,
    },
});
