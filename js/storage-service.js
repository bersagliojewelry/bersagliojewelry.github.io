/**
 * Bersaglio Jewelry — Firebase Storage Service
 *
 * Handles image uploads for:
 *   - Piece photos (main + gallery)
 *   - Collection banners
 *   - General assets
 *
 * Images are stored in Firebase Cloud Storage and served via CDN.
 */

import { storage } from './firebase-config.js';
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    listAll,
} from 'firebase/storage';

// ─── Piece Images ───────────────────────────────────────────────────────────

/**
 * Upload a piece image to Storage.
 * Path: pieces/{pieceId}/{filename}
 *
 * @param {string} pieceId
 * @param {File} file - image file
 * @param {Function} [onProgress] - receives 0-100
 * @returns {Promise<string>} download URL
 */
export function uploadPieceImage(pieceId, file, onProgress) {
    const ext      = file.name.split('.').pop().toLowerCase();
    const filename = `${Date.now()}.${ext}`;
    const path     = `pieces/${pieceId}/${filename}`;
    return _upload(path, file, onProgress);
}

/**
 * Upload the main image for a piece. Replaces any existing main image.
 * Path: pieces/{pieceId}/main.{ext}
 */
export function uploadPieceMainImage(pieceId, file, onProgress) {
    const ext  = file.name.split('.').pop().toLowerCase();
    const path = `pieces/${pieceId}/main.${ext}`;
    return _upload(path, file, onProgress);
}

/**
 * Get all image URLs for a piece.
 * @returns {Promise<string[]>} array of download URLs
 */
export async function getPieceImages(pieceId) {
    const folderRef = ref(storage, `pieces/${pieceId}`);
    try {
        const result = await listAll(folderRef);
        const urls = await Promise.all(
            result.items.map(item => getDownloadURL(item))
        );
        return urls;
    } catch {
        return [];
    }
}

/**
 * Delete a specific piece image by its full download URL or storage path.
 *
 * Firebase download URLs look like:
 *   https://firebasestorage.googleapis.com/v0/b/BUCKET/o/ENCODED_PATH?alt=media&token=...
 *
 * ref(storage, fullUrl) does NOT work reliably — we must extract the
 * storage path from the URL and create a ref from that path.
 */
export async function deletePieceImage(imageUrl) {
    const storagePath = extractStoragePath(imageUrl);
    const imageRef = ref(storage, storagePath);
    await deleteObject(imageRef);
}

/**
 * Extract the storage path from a Firebase download URL.
 * If the input is already a path (no "http"), returns it as-is.
 */
function extractStoragePath(url) {
    if (!url.startsWith('http')) return url;

    try {
        const urlObj = new URL(url);
        // Firebase Storage URLs encode the path in the /o/ segment
        // e.g. /v0/b/bucket/o/pieces%2Fp123%2F1234.webp
        const match = urlObj.pathname.match(/\/o\/(.+)/);
        if (match) {
            return decodeURIComponent(match[1]);
        }
    } catch { /* fallback below */ }

    // Fallback: try using ref directly (works in some SDK versions)
    return url;
}

/**
 * Delete all images for a piece (when deleting the piece).
 */
export async function deleteAllPieceImages(pieceId) {
    const folderRef = ref(storage, `pieces/${pieceId}`);
    try {
        const result = await listAll(folderRef);
        await Promise.all(result.items.map(item => deleteObject(item)));
    } catch {
        // Folder doesn't exist or already empty
    }
}

// ─── Collection Banners ─────────────────────────────────────────────────────

/**
 * Upload a collection banner image.
 * Path: collections/{colId}/banner.{ext}
 */
export function uploadCollectionBanner(colId, file, onProgress) {
    const ext  = file.name.split('.').pop().toLowerCase();
    const path = `collections/${colId}/banner.${ext}`;
    return _upload(path, file, onProgress);
}

/**
 * Get the banner URL for a collection.
 */
export async function getCollectionBannerUrl(colId) {
    try {
        return await getDownloadURL(ref(storage, `collections/${colId}/banner.webp`));
    } catch {
        try {
            return await getDownloadURL(ref(storage, `collections/${colId}/banner.jpg`));
        } catch {
            return null;
        }
    }
}

// ─── General Assets ─────────────────────────────────────────────────────────

/**
 * Upload a general asset.
 * Path: assets/{filename}
 */
export function uploadAsset(file, onProgress) {
    const ext      = file.name.split('.').pop().toLowerCase();
    const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '_')}`;
    const path     = `assets/${filename}`;
    return _upload(path, file, onProgress);
}

// ─── Internal upload helper ─────────────────────────────────────────────────

/**
 * Upload a file with progress tracking.
 * @param {string} path - Storage path
 * @param {File} file
 * @param {Function} [onProgress] - receives 0-100
 * @returns {Promise<string>} download URL
 */
function _upload(path, file, onProgress) {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, path);
        const task = uploadBytesResumable(storageRef, file, {
            contentType: file.type,
            customMetadata: {
                uploadedBy: 'admin-panel',
                originalName: file.name
            }
        });

        task.on('state_changed',
            (snapshot) => {
                const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                onProgress?.(pct);
            },
            (error) => {
                console.error('[Storage] Upload failed:', error.code);
                reject(error);
            },
            async () => {
                const url = await getDownloadURL(task.snapshot.ref);
                resolve(url);
            }
        );
    });
}
