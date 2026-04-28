// main.js — shared logic for all pages

document.addEventListener('DOMContentLoaded', () => {
    // ── Theme ──────────────────────────────────────────────
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') document.body.setAttribute('data-theme', 'dark');

    themeToggle?.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });

    //  Auth nav state 
    const token = localStorage.getItem('token');
    const authNav = document.getElementById('auth-nav');
    const profileLink = document.getElementById('profile-link');

    if (token) {
        if (authNav) {
            authNav.innerHTML = `<a href="#" id="logout-btn" class="nav-cta">Sign Out</a>`;
            document.getElementById('logout-btn')?.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                showToast('Signed out successfully', 'success');
                setTimeout(() => window.location.href = 'index.html', 700);
            });
        }
        if (profileLink) profileLink.style.display = 'inline-block';
    }

    //  Navbar scroll hide/show + shadow
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const st = window.scrollY;
        if (st > 80) {
            navbar?.classList.add('scrolled');
            if (st > lastScroll) navbar?.classList.add('hidden');
            else navbar?.classList.remove('hidden');
        } else {
            navbar?.classList.remove('scrolled', 'hidden');
        }
        lastScroll = st;
    }, { passive: true });

    // ── Load trending cities (home page only) ─────────────
    if (document.getElementById('trending-container')) {
        loadTrendingCities();
    }
});

// ── Toast notifications ───────────────────────────────────
function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    toast.textContent = (icons[type] || '') + '  ' + msg;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3200);
}
window.showToast = showToast;

// ── Trending Cities ───────────────────────────────────────
async function loadTrendingCities() {
    const container = document.getElementById('trending-container');
    if (!container) return;

    try {
        const res = await fetch('http://localhost:5000/api/explore/top-cities');
        if (!res.ok) throw new Error('Failed');
        const cities = await res.json();

        container.innerHTML = '';
        cities.forEach((city, i) => {
            const img = city.imageurl || `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80`;
            const card = document.createElement('div');
            card.className = 'city-card';
            card.style.animationDelay = `${i * 0.08}s`;
            card.innerHTML = `
                ${i === 0 ? '<span class="city-badge">⭐ Top Pick</span>' : ''}
                <img src="${img}" alt="${city.city}" loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80'">
                <div class="city-card-overlay">
                    <div class="city-card-name">${city.city}</div>
                    <div class="city-card-meta">
                        <span>⭐ ${city.avgRating.toFixed(1)}</span>
                        <span>·</span>
                        <span>${city.count} attractions</span>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => {
                window.location.href = `explore.html?city=${encodeURIComponent(city.city)}`;
            });
            container.appendChild(card);
        });
    } catch (err) {
        console.error('Trending cities error:', err);
        container.innerHTML = `
            <div class="empty-state" style="column-span:all;grid-column:1/-1;">
                <div class="empty-icon">🗺️</div>
                <h3>Could not load cities</h3>
                <p>Make sure the backend server is running.</p>
            </div>`;
    }
}
