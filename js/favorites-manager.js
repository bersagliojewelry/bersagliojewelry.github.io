/**
 * ALTORRA CARS - Favorites Manager System
 * Sistema unificado de gestión de favoritos con normalización garantizada
 *
 * SOLUCIÓN A PROBLEMA:
 * - IDs en JSON son números (5, 8)
 * - HTML data-* devuelven strings ("5", "8")
 * - Este sistema NORMALIZA TODO a strings para consistencia total
 */

class FavoritesManager {
    constructor() {
        this.STORAGE_KEY = 'altorra-favorites';
        this.DEBUG = false; // Activar para ver logs en consola
        this._init();
    }

    /**
     * Inicializa el sistema y valida localStorage
     */
    _init() {
        try {
            // Validar que localStorage funcione
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);

            // Normalizar datos existentes
            this._normalizeStorage();

            this._log('✅ FavoritesManager inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando FavoritesManager:', error);
        }
    }

    /**
     * Normaliza los datos en localStorage (convierte todos los IDs a strings)
     */
    _normalizeStorage() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (!raw) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
                return;
            }

            const data = JSON.parse(raw);
            if (!Array.isArray(data)) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
                return;
            }

            // Convertir todos a strings y eliminar duplicados
            const normalized = [...new Set(data.map(id => String(id)))];
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(normalized));

            this._log('🔄 Storage normalizado:', normalized);
        } catch (error) {
            console.error('Error normalizando storage:', error);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
        }
    }

    /**
     * Obtiene todos los favoritos (siempre como array de strings)
     */
    getAll() {
        try {
            const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
            // GARANTIZAR que siempre sean strings
            return Array.isArray(data) ? data.map(id => String(id)) : [];
        } catch (error) {
            console.error('Error obteniendo favoritos:', error);
            return [];
        }
    }

    /**
     * Verifica si un vehículo está en favoritos
     * @param {*} vehicleId - ID del vehículo (string o number)
     * @returns {boolean}
     */
    has(vehicleId) {
        const normalizedId = String(vehicleId);
        const favorites = this.getAll();
        const result = favorites.includes(normalizedId);

        this._log(`🔍 has(${vehicleId}) -> ${result}`, favorites);
        return result;
    }

    /**
     * Agrega un vehículo a favoritos
     * @param {*} vehicleId - ID del vehículo
     * @returns {boolean} - true si se agregó, false si ya existía
     */
    add(vehicleId) {
        const normalizedId = String(vehicleId);
        const favorites = this.getAll();

        // Si ya existe, no hacer nada
        if (favorites.includes(normalizedId)) {
            this._log(`⚠️ add(${vehicleId}) -> Ya existe`);
            return false;
        }

        // Agregar y guardar
        favorites.push(normalizedId);
        this._save(favorites);
        this._dispatchEvent('added', normalizedId);

        this._log(`✅ add(${vehicleId}) -> Agregado`, favorites);
        return true;
    }

    /**
     * Elimina un vehículo de favoritos
     * @param {*} vehicleId - ID del vehículo
     * @returns {boolean} - true si se eliminó, false si no existía
     */
    remove(vehicleId) {
        const normalizedId = String(vehicleId);
        const favorites = this.getAll();
        const index = favorites.indexOf(normalizedId);

        // Si no existe, no hacer nada
        if (index === -1) {
            this._log(`⚠️ remove(${vehicleId}) -> No existe`);
            return false;
        }

        // Eliminar y guardar
        favorites.splice(index, 1);
        this._save(favorites);
        this._dispatchEvent('removed', normalizedId);

        this._log(`🗑️ remove(${vehicleId}) -> Eliminado`, favorites);
        return true;
    }

    /**
     * Toggle favorito (agrega si no existe, elimina si existe)
     * @param {*} vehicleId - ID del vehículo
     * @returns {boolean} - true si se AGREGÓ, false si se ELIMINÓ
     */
    toggle(vehicleId) {
        const normalizedId = String(vehicleId);
        const wasInFavorites = this.has(normalizedId);

        if (wasInFavorites) {
            this.remove(normalizedId);
            return false; // Se ELIMINÓ
        } else {
            this.add(normalizedId);
            return true; // Se AGREGÓ
        }
    }

    /**
     * Elimina todos los favoritos
     */
    clear() {
        this._save([]);
        this._dispatchEvent('cleared', null);
        this._log('🗑️ clear() -> Todos eliminados');
    }

    /**
     * Obtiene el número de favoritos
     * @returns {number}
     */
    count() {
        return this.getAll().length;
    }

    /**
     * Guarda favoritos en localStorage
     * @private
     */
    _save(favorites) {
        try {
            // GARANTIZAR que todos sean strings antes de guardar
            const normalized = favorites.map(id => String(id));
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(normalized));
        } catch (error) {
            console.error('Error guardando favoritos:', error);
        }
    }

    /**
     * Dispara evento personalizado cuando cambian los favoritos
     * @private
     */
    _dispatchEvent(action, vehicleId) {
        const event = new CustomEvent('favoritesChanged', {
            detail: {
                action: action, // 'added', 'removed', 'cleared'
                vehicleId: vehicleId,
                count: this.count(),
                favorites: this.getAll()
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Log para debugging
     * @private
     */
    _log(...args) {
        if (this.DEBUG) {
            console.log('[FavoritesManager]', ...args);
        }
    }

    /**
     * Actualiza todos los contadores en la UI
     */
    updateAllCounters() {
        const count = this.count();
        const countStr = count.toString();

        // Actualizar contador desktop
        const favCount = document.getElementById('favCount');
        if (favCount) {
            favCount.textContent = countStr;
        }

        // Actualizar contador móvil
        const favCountMobile = document.getElementById('favCountMobile');
        if (favCountMobile) {
            favCountMobile.textContent = countStr;
        }

        // Actualizar contador en página de favoritos
        const favoritesCount = document.getElementById('favoritesCount');
        if (favoritesCount) {
            favoritesCount.textContent = countStr;
        }

        this._log(`🔄 Contadores actualizados: ${count}`);

        // Retry después de 100ms por si el header no ha cargado
        setTimeout(() => {
            const favCountRetry = document.getElementById('favCount');
            if (favCountRetry) favCountRetry.textContent = countStr;

            const favCountMobileRetry = document.getElementById('favCountMobile');
            if (favCountMobileRetry) favCountMobileRetry.textContent = countStr;
        }, 100);

        // Otro retry después de 300ms
        setTimeout(() => {
            const favCountRetry2 = document.getElementById('favCount');
            if (favCountRetry2) favCountRetry2.textContent = countStr;

            const favCountMobileRetry2 = document.getElementById('favCountMobile');
            if (favCountMobileRetry2) favCountMobileRetry2.textContent = countStr;
        }, 300);
    }

    /**
     * Actualiza el estado visual de un botón de favorito
     */
    updateButtonState(button, vehicleId) {
        const normalizedId = String(vehicleId);
        const isFav = this.has(normalizedId);

        if (isFav) {
            button.textContent = '♥';
            button.classList.add('active');
        } else {
            button.textContent = '♡';
            button.classList.remove('active');
        }

        this._log(`🔄 Botón actualizado para ID ${vehicleId}: ${isFav}`);
    }
}

// Crear instancia global SINGLETON
const favoritesManager = new FavoritesManager();

// Escuchar cambios en favoritos para actualizar contadores automáticamente
window.addEventListener('favoritesChanged', (e) => {
    favoritesManager.updateAllCounters();
});

// Exponer globalmente para uso en otros scripts
window.favoritesManager = favoritesManager;

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FavoritesManager, favoritesManager };
}
