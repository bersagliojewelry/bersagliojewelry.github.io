// Main JavaScript for ALTORRA CARS
console.log('ALTORRA CARS - Sistema cargado correctamente');

// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Sticky Header
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (header) {
        if (window.scrollY > 100) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    }
});

// Favorites System
const favorites: string[] = JSON.parse(localStorage.getItem('altorra-favorites') || '[]');

function updateFavoritesCount() {
    const favCount = document.getElementById('favCount');
    if (favCount) {
        favCount.textContent = favorites.length.toString();
    }
}

function toggleFavorite(vehicleId: string) {
    const index = favorites.indexOf(vehicleId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(vehicleId);
    }
    localStorage.setItem('altorra-favorites', JSON.stringify(favorites));
    updateFavoritesCount();
}

// Add event listeners to favorite buttons
document.addEventListener('DOMContentLoaded', () => {
    updateFavoritesCount();

    const favButtons = document.querySelectorAll('.favorite-btn');
    favButtons.forEach(button => {
        const btn = button as HTMLButtonElement;
        const vehicleId = btn.getAttribute('data-id');

        if (vehicleId && favorites.includes(vehicleId)) {
            btn.textContent = '♥';
            btn.classList.add('active');
        }

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (vehicleId) {
                toggleFavorite(vehicleId);
                btn.textContent = favorites.includes(vehicleId) ? '♥' : '♡';
                btn.classList.toggle('active');
            }
        });
    });
});

// Search Form
const searchForm = document.getElementById('searchForm');
if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(searchForm as HTMLFormElement);
        const params = new URLSearchParams();

        formData.forEach((value, key) => {
            if (value) {
                params.append(key, value.toString());
            }
        });

        window.location.href = `busqueda.html?${params.toString()}`;
    });
}

// Dropdown Menu Functionality
document.querySelectorAll('.dropdown').forEach(dropdown => {
    dropdown.addEventListener('mouseenter', () => {
        dropdown.classList.add('active');
    });

    dropdown.addEventListener('mouseleave', () => {
        dropdown.classList.remove('active');
    });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const anchorEl = e.currentTarget as HTMLAnchorElement;
        const href = anchorEl.getAttribute('href');
        if (href && href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Export functions for use in other files
export { toggleFavorite, updateFavoritesCount };
