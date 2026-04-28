// profile.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user  = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Fill hero
    const name  = user.username || 'Traveller';
    const email = user.email    || '';

    document.getElementById('profile-username').textContent = name;
    document.getElementById('profile-email').textContent    = email;

    const avatar = document.getElementById('profile-avatar');
    if (avatar) avatar.textContent = name.charAt(0).toUpperCase();

    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    // Tabs
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const which = tab.dataset.tab;
            document.getElementById('tab-saved').style.display       = which === 'saved'       ? 'block' : 'none';
            document.getElementById('tab-restaurants').style.display = which === 'restaurants' ? 'block' : 'none';
        });
    });

    loadProfile();
});

async function loadProfile() {
    const token = localStorage.getItem('token');

    try {
        const res  = await fetch('http://localhost:5000/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Auth failed');
        const data = await res.json();

        const destinations = data.savedDestinations || [];
        const restaurants  = data.savedRestaurants  || [];

        document.getElementById('stat-destinations').textContent = destinations.length;
        document.getElementById('stat-restaurants').textContent  = restaurants.length;

        renderSaved(destinations, 'saved-items-container', 'monument');
        renderSaved(restaurants,  'saved-restaurants-container', 'restaurant');

    } catch (err) {
        console.error('Profile load error:', err);
        showEmpty('saved-items-container',       'Could not load saved places');
        showEmpty('saved-restaurants-container', 'Could not load saved restaurants');
    }
}

function showEmpty(containerId, msg) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = `
        <div class="empty-state" style="column-span:all;">
            <div class="empty-icon">🔖</div>
            <h3>${msg}</h3>
            <p>Check your connection or <a href="explore.html" style="color:var(--accent);">explore more places</a>.</p>
        </div>`;
}

function renderSaved(items, containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="column-span:all;">
                <div class="empty-icon">🔖</div>
                <h3>Nothing saved yet</h3>
                <p><a href="explore.html" style="color:var(--accent);">Explore destinations</a> and save your favourites.</p>
            </div>`;
        return;
    }

    items.forEach((item, i) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animation = `cardIn 0.4s ease ${i * 0.05}s both`;

        if (type === 'monument') {
            const img = item.imageurl || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80';
            card.innerHTML = `
                <div style="overflow:hidden;">
                    <img src="${img}" alt="${item.name}" loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80'"
                         style="width:100%;height:200px;object-fit:cover;display:block;">
                </div>
                <div class="card-content">
                    <span class="card-type-badge">🏛 ${item.type || 'Monument'}</span>
                    <h3>${item.name}</h3>
                    <p><strong>📍</strong> ${item.city}, ${item.state}</p>
                    <p><strong>Rating:</strong> ${item.reviewrating} ⭐ · <strong>Fee:</strong> ₹${item.entrancefee}</p>
                    <a href="${item.googlemapslink}" target="_blank" rel="noopener">View on Maps →</a>
                </div>
                <div class="card-footer">
                    <span class="card-rating">⭐ ${item.reviewrating}</span>
                    <button class="unsave-btn" data-id="${item._id}">Unsave</button>
                </div>
            `;
        } else {
            const img = item.imageurl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';
            card.innerHTML = `
                <div style="overflow:hidden;">
                    <img src="${img}" alt="${item.Name}" loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'"
                         style="width:100%;height:200px;object-fit:cover;display:block;">
                </div>
                <div class="card-content">
                    <span class="card-type-badge">🍴 Restaurant</span>
                    <h3>${item.Name}</h3>
                    <p><strong>📍</strong> ${item.City}</p>
                    <p><strong>Cuisine:</strong> ${Array.isArray(item.Cuisine) ? item.Cuisine.slice(0,3).join(', ') : item.Cuisine || '—'}</p>
                    <p><strong>Cost:</strong> ₹${item.Cost} for two</p>
                </div>
                <div class="card-footer">
                    <span class="card-rating">⭐ ${item.Rating}</span>
                    <button class="unsave-btn" data-id="${item._id}">Unsave</button>
                </div>
            `;
        }
        container.appendChild(card);
    });

    // Unsave listeners
    container.querySelectorAll('.unsave-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id    = btn.dataset.id;
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`http://localhost:5000/api/explore/save/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    btn.closest('.card').style.animation = 'cardOut 0.3s ease forwards';
                    setTimeout(() => loadProfile(), 350);
                    showToast('Removed from saved', 'success');
                } else {
                    showToast('Could not remove', 'error');
                }
            } catch {
                showToast('Network error', 'error');
            }
        });
    });
}

// Animations
const style = document.createElement('style');
style.textContent = `
@keyframes cardIn  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes cardOut { from { opacity:1; transform:scale(1); } to { opacity:0; transform:scale(0.95); } }
`;
document.head.appendChild(style);
