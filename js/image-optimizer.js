/**
 * Bersaglio Jewelry — Image Optimizer (Client-side)
 *
 * Converts uploaded images to WebP format and resizes them
 * before uploading to Firebase Storage. Ensures minimal weight
 * without visible quality loss.
 *
 * Used by the admin panel for piece images and collection banners.
 *
 * Config:
 *   MAX_WIDTH:   1600px  (reasonable for web)
 *   MAX_HEIGHT:  1600px
 *   QUALITY:     0.82    (WebP quality — nearly lossless visually)
 *   OUTPUT_TYPE: image/webp
 */

const MAX_WIDTH  = 1600;
const MAX_HEIGHT = 1600;
const QUALITY    = 0.82;
const OUTPUT_TYPE = 'image/webp';

/**
 * Optimize an image File: resize + convert to WebP.
 *
 * @param {File} file — original image file
 * @returns {Promise<File>} — optimized WebP File object
 */
export async function optimizeImage(file) {
    // Skip non-image files
    if (!file.type.startsWith('image/')) return file;

    // Skip SVGs — they're already optimal
    if (file.type === 'image/svg+xml') return file;

    // Skip very small files (< 50KB) — already optimized
    if (file.size < 50 * 1024) return file;

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

            // Export as WebP
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        // Canvas toBlob failed (rare) — return original
                        resolve(file);
                        return;
                    }

                    // Build a new File with .webp extension
                    const baseName = file.name.replace(/\.[^.]+$/, '');
                    const webpFile = new File(
                        [blob],
                        `${baseName}.webp`,
                        { type: OUTPUT_TYPE, lastModified: Date.now() }
                    );

                    resolve(webpFile);
                },
                OUTPUT_TYPE,
                QUALITY
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            // If we can't decode, return original
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
