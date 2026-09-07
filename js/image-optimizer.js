/**
 * Bersaglio Jewelry — Image Optimizer (Client-side)
 *
 * Converts uploaded images to AVIF format (if supported by the browser)
 * or WebP format (as fallback) and resizes them before uploading to Firebase Storage.
 * Ensures minimal weight without visible quality loss for jewelry items.
 *
 * Config:
 *   MAX_WIDTH:   1600px  (excellent for web display)
 *   MAX_HEIGHT:  1600px
 *   WEBP_QUALITY: 0.82   (WebP quality — nearly lossless visually)
 *   AVIF_QUALITY: 0.76   (AVIF quality — matches WebP 0.82 detail at 20-30% smaller size)
 */

const MAX_WIDTH    = 1600;
const MAX_HEIGHT   = 1600;
const WEBP_QUALITY = 0.82;
const AVIF_QUALITY = 0.76;

let _avifSupported = null;

/**
 * Check if the browser's canvas supports exporting to image/avif.
 * @returns {Promise<boolean>}
 */
async function checkAvifSupport() {
    if (_avifSupported !== null) return _avifSupported;
    return new Promise((resolve) => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            canvas.toBlob((blob) => {
                _avifSupported = !!(blob && blob.type === 'image/avif');
                resolve(_avifSupported);
            }, 'image/avif');
        } catch (e) {
            _avifSupported = false;
            resolve(false);
        }
    });
}

/**
 * Optimize an image File: resize + convert to AVIF (or WebP fallback).
 *
 * @param {File} file — original image file
 * @returns {Promise<File>} — optimized File object (AVIF or WebP)
 */
export async function optimizeImage(file) {
    // Skip non-image files
    if (!file.type.startsWith('image/')) return file;

    // Skip SVGs — they're already vector/optimal
    if (file.type === 'image/svg+xml') return file;

    // Skip very small files (< 50KB) — already lightweight
    if (file.size < 50 * 1024) return file;

    // Check support for AVIF export
    const useAvif = await checkAvifSupport();
    const outputType = useAvif ? 'image/avif' : 'image/webp';
    const ext = useAvif ? 'avif' : 'webp';
    const quality = useAvif ? AVIF_QUALITY : WEBP_QUALITY;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            // Calculate new dimensions (maintain aspect ratio)
            let { width, height } = img;

            if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                width  = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            // Draw to canvas
            const canvas = document.createElement('canvas');
            canvas.width  = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            // Bicubic-quality scaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Export as Blob
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        // If canvas conversion failed, resolve with original file
                        resolve(file);
                        return;
                    }

                    // Build a new File with corrected extension
                    const baseName = file.name.replace(/\.[^.]+$/, '');
                    const optimizedFile = new File(
                        [blob],
                        `${baseName}.${ext}`,
                        { type: outputType, lastModified: Date.now() }
                    );

                    resolve(optimizedFile);
                },
                outputType,
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            // If decoding fails, resolve with original file
            resolve(file);
        };

        img.src = url;
    });
}

/**
 * Optimize multiple files in parallel.
 *
 * @param {FileList|File[]} files
 * @returns {Promise<File[]>}
 */
export async function optimizeImages(files) {
    return Promise.all(Array.from(files).map(optimizeImage));
}

// ─── LQIP (placeholder difuso, §103 F1) ─────────────────────────────────────
const LQIP_MAX_PX   = 40;     // lado mayor del placeholder (≈1-3 KB en data-URI)
const LQIP_QUALITY  = 0.5;    // calidad baja: se ve borroso de todos modos
const LQIP_MAX_CHARS = 6000;  // guard: nunca persistir un LQIP anómalo (espejo de safeLqip)

/**
 * Genera un LQIP (Low-Quality Image Placeholder): un data-URI base64 MINÚSCULO del
 * mismo cuadro, para pintar un fondo borroso al instante (blur-up §103). Se guarda
 * junto a la URL en Firestore y se valida en el render con safeLqip().
 *
 * Self-contained (decodifica su propia copia): el camino del admin no es crítico en
 * rendimiento (Kary sube ocasionalmente) y así NO altera la firma de optimizeImage().
 * Degrada a '' ante cualquier fallo → el sistema sigue con el comportamiento actual.
 *
 * @param {File} file imagen original
 * @returns {Promise<string>} data-URI (webp/jpeg) o '' si no aplica/falla
 */
export async function makeLqip(file) {
    if (!file || typeof file.type !== 'string') return '';
    if (!file.type.startsWith('image/')) return '';
    if (file.type === 'image/svg+xml') return '';   // vector: no tiene sentido un LQIP raster

    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            const { width, height } = img;
            if (!width || !height) { resolve(''); return; }

            // Reducir al lado mayor LQIP_MAX_PX (sin agrandar imágenes ya pequeñas).
            const ratio = Math.min(LQIP_MAX_PX / width, LQIP_MAX_PX / height, 1);
            const w = Math.max(1, Math.round(width * ratio));
            const h = Math.max(1, Math.round(height * ratio));

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'low';
            ctx.drawImage(img, 0, 0, w, h);

            try {
                // WebP si el canvas lo soporta (casi universal); si no, JPEG. Ambos pasan safeLqip.
                let uri = canvas.toDataURL('image/webp', LQIP_QUALITY);
                if (!uri.startsWith('data:image/webp')) {
                    uri = canvas.toDataURL('image/jpeg', LQIP_QUALITY);
                }
                resolve(uri.length <= LQIP_MAX_CHARS ? uri : '');
            } catch (e) {
                resolve('');
            }
        };

        img.onerror = () => { URL.revokeObjectURL(url); resolve(''); };
        img.src = url;
    });
}
