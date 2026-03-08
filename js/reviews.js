// ============================================
// SISTEMA DE RESEÑAS Y TESTIMONIOS - ALTORRA CARS
// Fase 20+: 100% dinámico desde Firestore (colección 'resenas')
// Sin datos estáticos — todo se gestiona desde el admin panel
// Schema: name, location, rating, vehicle, text, source,
//         verified, featured, avatar, createdAt, updatedAt
//         (title y date: legacy opcional — se muestran si existen)
// ============================================

class ReviewsSystem {
    constructor() {
        this.reviews = [];
        this._firestoreLoaded = false;
        this._callbacks = [];
        this.stats = { total: 0, average: '0.0', ratings: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
        this.loadFromFirestore();
    }

    // ===== FIRESTORE LOADING =====
    loadFromFirestore() {
        if (typeof window.firebaseReady === 'undefined' || typeof window.db === 'undefined') {
            const self = this;
            setTimeout(function() {
                if (typeof window.firebaseReady !== 'undefined' && typeof window.db !== 'undefined') {
                    self._doFirestoreLoad();
                } else {
                    // Firebase no disponible — marcar como cargado con lista vacía
                    self._firestoreLoaded = true;
                    self._notifyCallbacks();
                }
            }, 1500);
            return;
        }
        this._doFirestoreLoad();
    }

    _doFirestoreLoad() {
        const self = this;
        window.firebaseReady.then(function() {
            // Ordenar por createdAt; si el campo no existe (docs legacy) caerá gracefully
            return window.db.collection('resenas').orderBy('createdAt', 'desc').get();
        }).then(function(snap) {
            snap.forEach(function(doc) {
                var d = doc.data();
                d._docId = doc.id;
                d.rating = parseInt(d.rating) || 5;
                self.reviews.push(d);
            });
            self._firestoreLoaded = true;
            self.calculateStats();
            self._notifyCallbacks();
        }).catch(function(err) {
            console.warn('[Reviews] Firestore load failed (createdAt index?):', err.message);
            // Fallback: try without ordering
            window.db.collection('resenas').get().then(function(snap) {
                snap.forEach(function(doc) {
                    var d = doc.data();
                    d._docId = doc.id;
                    d.rating = parseInt(d.rating) || 5;
                    self.reviews.push(d);
                });
                // Sort client-side: featured first, then newest
                self.reviews.sort(function(a, b) {
                    var aTime = a.createdAt || a.date || '';
                    var bTime = b.createdAt || b.date || '';
                    return bTime < aTime ? -1 : bTime > aTime ? 1 : 0;
                });
                self._firestoreLoaded = true;
                self.calculateStats();
                self._notifyCallbacks();
            }).catch(function() {
                self._firestoreLoaded = true;
                self._notifyCallbacks();
            });
        });
    }

    _notifyCallbacks() {
        this._callbacks.forEach(function(cb) { try { cb(); } catch(e) {} });
        this._callbacks = [];
    }

    onReady(callback) {
        if (this._firestoreLoaded) {
            callback();
        } else {
            this._callbacks.push(callback);
        }
    }

    // ===== ESTADÍSTICAS =====
    calculateStats() {
        const total = this.reviews.length;
        if (total === 0) {
            this.stats = { total: 0, average: '0.0', ratings: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
            return;
        }
        const sum = this.reviews.reduce((acc, r) => acc + (parseInt(r.rating) || 0), 0);
        this.stats = {
            total: total,
            average: (sum / total).toFixed(1),
            ratings: {
                5: this.reviews.filter(r => parseInt(r.rating) === 5).length,
                4: this.reviews.filter(r => parseInt(r.rating) === 4).length,
                3: this.reviews.filter(r => parseInt(r.rating) === 3).length,
                2: this.reviews.filter(r => parseInt(r.rating) === 2).length,
                1: this.reviews.filter(r => parseInt(r.rating) === 1).length
            }
        };
    }

    getStats() { return this.stats; }
    getAllReviews() { return this.reviews; }

    getRecentReviews(limit = 3) {
        return [...this.reviews]
            .sort((a, b) => {
                // Featured first
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                // Then by createdAt or legacy date
                const aTime = a.createdAt || a.date || '';
                const bTime = b.createdAt || b.date || '';
                return bTime < aTime ? -1 : bTime > aTime ? 1 : 0;
            })
            .slice(0, limit);
    }

    // ===== RENDERIZADO =====
    renderStars(rating, size = 'small') {
        const sizeClass = size === 'large' ? 'star-large' : '';
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += `<svg class="star filled ${sizeClass}" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/></svg>`;
            } else {
                stars += `<svg class="star ${sizeClass}" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
            }
        }
        return stars;
    }

    formatDate(review) {
        // Prefer createdAt (new schema); fall back to legacy date field
        const raw = review.createdAt || review.date;
        if (!raw) return '';
        const date = new Date(raw);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    _getAvatar(review) {
        return review.avatar || (review.name || 'NN').split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase();
    }

    // ===== SECCIÓN DE TESTIMONIOS (Homepage) =====
    renderTestimonialsSection(containerId, options = {}) {
        const { limit = 3 } = options;
        const container = document.getElementById(containerId);
        if (!container) return;

        const self = this;

        const doRender = function() {
            const reviews = self.getRecentReviews(limit);
            const stats = self.getStats();

            if (reviews.length === 0) {
                container.innerHTML = '';
                return;
            }

            container.innerHTML = `
                <section class="testimonials-section">
                    <div class="container">
                        <div class="testimonials-header">
                            <div class="testimonials-title-area">
                                <h2 class="testimonials-title">Lo que dicen nuestros <span class="highlight">Clientes</span></h2>
                                <p class="testimonials-subtitle">Más de ${stats.total} clientes satisfechos confían en nosotros</p>
                            </div>
                            <div class="testimonials-summary">
                                <div class="summary-rating">
                                    <span class="rating-number">${stats.average}</span>
                                    <div class="rating-stars">${self.renderStars(Math.round(parseFloat(stats.average)), 'large')}</div>
                                    <span class="rating-count">${stats.total} reseñas</span>
                                </div>
                            </div>
                        </div>
                        <div class="testimonials-grid">
                            ${reviews.map(r => self.renderTestimonialCard(r)).join('')}
                        </div>
                        <div class="testimonials-cta">
                            <a href="resenas.html" class="btn-view-all-reviews">
                                Ver todas las reseñas
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </a>
                        </div>
                    </div>
                </section>
            `;
        };

        if (this._firestoreLoaded) {
            doRender();
        } else {
            container.innerHTML = '';
            this.onReady(doRender);
        }
    }

    renderTestimonialCard(review) {
        // Legacy support: show title if present, otherwise skip
        const titleHtml = review.title
            ? `<h5 class="testimonial-title">"${review.title}"</h5>`
            : '';
        return `
            <div class="testimonial-card">
                <div class="testimonial-header">
                    <div class="testimonial-avatar" style="background: linear-gradient(135deg, #b89658, #916652);">
                        ${this._getAvatar(review)}
                    </div>
                    <div class="testimonial-info">
                        <h4 class="testimonial-name">
                            ${review.name}
                            ${review.verified ? '<svg class="verified-badge" width="14" height="14" viewBox="0 0 24 24" fill="#10b981"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' : ''}
                        </h4>
                        <span class="testimonial-location">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            ${review.location || ''}
                        </span>
                    </div>
                    <div class="testimonial-rating">
                        ${this.renderStars(parseInt(review.rating) || 5)}
                    </div>
                </div>
                <div class="testimonial-content">
                    ${titleHtml}
                    <p class="testimonial-text">${review.text}</p>
                </div>
            </div>
        `;
    }

    // ===== PÁGINA COMPLETA DE RESEÑAS =====
    renderFullReviewsPage(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const self = this;

        const doRender = function() {
            const stats = self.getStats();
            const reviews = self.getAllReviews();

            if (reviews.length === 0) {
                container.innerHTML = `
                    <div class="reviews-page" style="text-align:center;padding:4rem 1rem;">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4b5563" stroke-width="1.5" style="margin-bottom:1rem;">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <h3 style="color:#9ca3af;margin-bottom:0.5rem;">Aún no hay reseñas</h3>
                        <p style="color:#6b7280;font-size:14px;">Las reseñas de clientes aparecerán aquí cuando se agreguen desde el panel de administración.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div class="reviews-page">
                    <div class="reviews-summary-card">
                        <div class="summary-left">
                            <div class="summary-big-rating">
                                <span class="big-number">${stats.average}</span>
                                <div class="big-stars">${self.renderStars(Math.round(parseFloat(stats.average)), 'large')}</div>
                            </div>
                            <p class="summary-text">Basado en ${stats.total} reseñas verificadas</p>
                        </div>
                        <div class="summary-right">
                            ${[5, 4, 3, 2, 1].map(rating => {
                                const count = stats.ratings[rating];
                                const percentage = stats.total > 0 ? (count / stats.total * 100).toFixed(0) : 0;
                                return `
                                    <div class="rating-bar">
                                        <span class="rating-label">${rating}</span>
                                        <svg class="star-mini filled" viewBox="0 0 24 24" width="12" height="12"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/></svg>
                                        <div class="bar-track"><div class="bar-fill" style="width: ${percentage}%"></div></div>
                                        <span class="rating-percent">${percentage}%</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    <div class="reviews-list">
                        ${reviews.map(r => self.renderFullReviewCard(r)).join('')}
                    </div>
                </div>
            `;
        };

        // Loading state
        container.innerHTML = '<div style="text-align:center;padding:3rem;"><div style="display:inline-block;width:32px;height:32px;border:3px solid #333;border-top-color:#b89658;border-radius:50%;animation:spin 0.8s linear infinite;"></div><p style="color:#9ca3af;margin-top:1rem;">Cargando reseñas...</p></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>';

        if (this._firestoreLoaded) {
            doRender();
        } else {
            this.onReady(doRender);
        }
    }

    renderFullReviewCard(review) {
        const vehicleTag = review.vehicle ? `
                <div class="review-vehicle-tag">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2"/><path d="M9 17h6"/></svg>
                    ${review.vehicle}
                </div>` : '';

        // Legacy support: show title if present
        const titleHtml = review.title
            ? `<h3 class="review-title">${review.title}</h3>`
            : '';

        const dateStr = this.formatDate(review);

        return `
            <div class="review-card-full">
                <div class="review-card-header">
                    <div class="review-author">
                        <div class="review-avatar" style="background: linear-gradient(135deg, #b89658, #916652);">
                            ${this._getAvatar(review)}
                        </div>
                        <div class="review-author-info">
                            <h4 class="review-author-name">
                                ${review.name}
                                ${review.verified ? '<span class="verified-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Compra verificada</span>' : ''}
                            </h4>
                            <span class="review-author-location">${review.location || ''}</span>
                        </div>
                    </div>
                    <div class="review-meta">
                        <div class="review-rating">${this.renderStars(parseInt(review.rating) || 5)}</div>
                        ${dateStr ? `<span class="review-date">${dateStr}</span>` : ''}
                    </div>
                </div>
                ${vehicleTag}
                <div class="review-content">
                    ${titleHtml}
                    <p class="review-text">${review.text}</p>
                </div>
            </div>
        `;
    }

    // ===== WIDGET FLOTANTE DE CALIFICACIÓN =====
    createRatingBadge() {
        if (document.getElementById('rating-badge')) return;

        const self = this;

        const doCreate = function() {
            if (self.reviews.length === 0) return;
            if (document.getElementById('rating-badge')) return;

            const stats = self.getStats();
            const badge = document.createElement('div');
            badge.id = 'rating-badge';
            badge.className = 'rating-badge';
            badge.innerHTML = `
                <a href="resenas.html" class="rating-badge-link">
                    <div class="badge-content">
                        <span class="badge-rating">${stats.average}</span>
                        <div class="badge-stars">${self.renderStars(Math.round(parseFloat(stats.average)))}</div>
                        <span class="badge-count">${stats.total} reseñas</span>
                    </div>
                </a>
            `;
            document.body.appendChild(badge);
        };

        if (this._firestoreLoaded) {
            doCreate();
        } else {
            this.onReady(doCreate);
        }
    }
}

// Crear instancia global
const reviewsSystem = new ReviewsSystem();
if (typeof window !== 'undefined') {
    window.reviewsSystem = reviewsSystem;
}
