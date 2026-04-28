// explore.js

const API_URL = 'http://localhost:5000/api/explore';
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';

let currentQuery    = '';
let currentType     = 'all';
let currentCity     = '';
let currentCategory = '';
let fetchTimer      = null;

document.addEventListener('DOMContentLoaded', () => {
    // Pre-fill city from URL params (linked from home page trending cards)
    const params = new URLSearchParams(window.location.search);
    if (params.get('city')) {
        currentCity = params.get('city');
    }

    loadCities();
    fetchResults();

    // Search on Enter or button click
    document.getElementById('search-btn')?.addEventListener('click', () => {
        currentQuery = document.getElementById('search-input').value.trim();
        currentCategory = '';
        unchipAll();
        fetchResults();
    });

    document.getElementById('search-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            currentQuery = e.target.value.trim();
            currentCategory = '';
            unchipAll();
            fetchResults();
        }
    });

    document.getElementById('type-filter')?.addEventListener('change', (e) => {
        currentType = e.target.value;
        fetchResults();
    });

    document.getElementById('city-filter')?.addEventListener('change', (e) => {
        currentCity = e.target.value;
        fetchResults();
    });

    // Category chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const isActive = chip.classList.contains('active');
            unchipAll();
            if (!isActive) {
                chip.classList.add('active');
                currentCategory = chip.dataset.category;
                currentType = currentCategory === 'food' ? 'restaurants' : 'monuments';
                document.getElementById('type-filter').value = currentType;
            } else {
                currentCategory = '';
                currentType = 'all';
                document.getElementById('type-filter').value = 'all';
            }
            fetchResults();
        });
    });
});

function unchipAll() {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
}

async function loadCities() {
    try {
        const res = await fetch(`${API_URL}/cities`);
        const cities = await res.json();
        const select = document.getElementById('city-filter');
        cities.forEach(city => {
            const opt = document.createElement('option');
            opt.value = city;
            opt.textContent = city;
            if (city === currentCity) opt.selected = true;
            select.appendChild(opt);
        });
        if (currentCity) select.value = currentCity;
    } catch (err) {
        console.error('Cities load error:', err);
    }
}

async function fetchResults() {
    const container = document.getElementById('results-container');
    const countEl   = document.getElementById('results-count');
    container.innerHTML = `<div class="loading" style="column-span:all;"><div class="spinner"></div><span>Finding places...</span></div>`;

    try {
        const params = new URLSearchParams();
        if (currentQuery)    params.append('query',    currentQuery);
        if (currentType !== 'all') params.append('type', currentType);
        if (currentCity)     params.append('city',     currentCity);
        if (currentCategory) params.append('category', currentCategory);

        const res  = await fetch(`${API_URL}?${params.toString()}`);
        const data = await res.json();

        const restaurants = data.restaurants || [];
        const monuments   = data.monuments   || [];
        const items = [...restaurants, ...monuments];

        const total = items.length;
        countEl.innerHTML = `Showing <strong>${total}</strong> result${total !== 1 ? 's' : ''}${currentCity ? ` in <strong>${currentCity}</strong>` : ''}`;

        container.innerHTML = '';

        if (total === 0) {
            container.innerHTML = `
                <div class="empty-state" style="column-span:all;grid-column:1/-1;">
                    <div class="empty-icon">🔍</div>
                    <h3>Nothing found</h3>
                    <p>Try a different search or remove some filters.</p>
                </div>`;
            return;
        }

        items.forEach((item, i) => {
            const card = buildCard(item);
            card.style.animationDelay = `${Math.min(i, 12) * 0.04}s`;
            card.style.animation = 'cardIn 0.4s ease both';
            container.appendChild(card);
        });

        // Save button listeners
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', handleSave);
        });

    } catch (err) {
        console.error('Fetch results error:', err);
        container.innerHTML = `
            <div class="empty-state" style="column-span:all;grid-column:1/-1;">
                <div class="empty-icon">⚠️</div>
                <h3>Could not load results</h3>
                <p>Make sure the backend server is running on port 5000.</p>
            </div>`;
    }
}

function buildCard(item) {
    const el = document.createElement('div');
    el.className = 'card';

    const isLoggedIn = !!localStorage.getItem('token');

    if (item.Name) {
        // Restaurant card
        const img = item.imageurl || FALLBACK_IMG;
        el.innerHTML = `
            <div style="overflow:hidden;">
                <img src="${img}" alt="${item.Name}" loading="lazy"
                     onerror="this.src='${FALLBACK_IMG}'"
                     style="width:100%;height:210px;object-fit:cover;display:block;transition:transform 0.5s ease;">
            </div>
            <div class="card-content">
                <span class="card-type-badge">🍴 Restaurant</span>
                <h3>${item.Name}</h3>
                <p><strong>📍</strong> ${item.City}${item.Locality ? ' · ' + item.Locality.trim() : ''}</p>
                <p><strong>Cuisine:</strong> ${Array.isArray(item.Cuisine) ? item.Cuisine.slice(0,3).join(', ') : item.Cuisine || '—'}</p>
                <p><strong>Cost:</strong> ₹${item.Cost || '—'} for two</p>
            </div>
            <div class="card-footer">
                <span class="card-rating">⭐ ${item.Rating || '—'} <span style="color:var(--text-muted);font-weight:400;">(${item.Votes || 0})</span></span>
                ${isLoggedIn ? `<button class="save-btn" data-type="restaurant" data-id="${item._id}">+ Save</button>` : ''}
            </div>
        `;
    } else {
        // Monument card
        const img = item.imageurl || `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80`;
        el.innerHTML = `
            <div style="overflow:hidden;">
                <img src="${img}" alt="${item.name}" loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80'"
                     style="width:100%;height:210px;object-fit:cover;display:block;transition:transform 0.5s ease;">
            </div>
            <div class="card-content">
                <span class="card-type-badge">🏛 ${item.type || 'Monument'}</span>
                <h3>${item.name}</h3>
                <p><strong>📍</strong> ${item.city}, ${item.state}</p>
                <p><strong>Best time:</strong> ${item.besttimetovisit || '—'} · <strong>Fee:</strong> ₹${item.entrancefee || '0'}</p>
                <a href="${item.googlemapslink}" target="_blank" rel="noopener">View on Maps →</a>
            </div>
            <div class="card-footer">
                <span class="card-rating">⭐ ${item.reviewrating || '—'}</span>
                ${isLoggedIn ? `<button class="save-btn" data-type="monument" data-id="${item._id}">+ Save</button>` : ''}
            </div>
        `;
    }

    // Hover image zoom effect
    const img = el.querySelector('img');
    el.addEventListener('mouseenter', () => { if(img) img.style.transform = 'scale(1.05)'; });
    el.addEventListener('mouseleave', () => { if(img) img.style.transform = 'scale(1)'; });

    return el;
}

async function handleSave(e) {
    const btn  = e.currentTarget;
    const id   = btn.dataset.id;
    const token = localStorage.getItem('token');

    if (!token) {
        showToast('Sign in to save destinations', 'info');
        return;
    }

    btn.textContent = '...';
    btn.disabled = true;

    try {
        const res = await fetch(`http://localhost:5000/api/explore/save/${id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (res.ok) {
            btn.textContent = '✓ Saved';
            btn.classList.add('saved-state');
            showToast('Saved to your profile!', 'success');
        } else {
            btn.textContent = '+ Save';
            btn.disabled = false;
            showToast('Could not save — try again', 'error');
        }
    } catch (err) {
        btn.textContent = '+ Save';
        btn.disabled = false;
        showToast('Network error', 'error');
    }
}

// Card entrance animation
const style = document.createElement('style');
style.textContent = `
@keyframes cardIn {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
}`;
document.head.appendChild(style);
