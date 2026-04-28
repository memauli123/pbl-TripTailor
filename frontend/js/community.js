// community.js

const API_URL = 'http://localhost:5000/api/blogs';

document.addEventListener('DOMContentLoaded', () => {
    fetchBlogs();

    const token = localStorage.getItem('token');
    const form  = document.getElementById('blog-form');
    const prompt = document.getElementById('login-prompt');

    if (!token) {
        if (form)   form.style.display = 'none';
        if (prompt) prompt.style.display = 'block';
    }

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Publishing...';
        submitBtn.disabled = true;

        const blogData = {
            title:    document.getElementById('blog-title').value.trim(),
            location: document.getElementById('blog-location').value.trim(),
            image:    document.getElementById('blog-image').value.trim(),
            content:  document.getElementById('blog-content').value.trim()
        };

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(blogData)
            });

            if (res.ok) {
                form.reset();
                showToast('Story published! ✨', 'success');
                fetchBlogs();
            } else {
                const err = await res.json();
                showToast(err.msg || 'Failed to publish', 'error');
            }
        } catch (err) {
            showToast('Network error', 'error');
        } finally {
            submitBtn.textContent = 'Publish Story →';
            submitBtn.disabled = false;
        }
    });
});

async function fetchBlogs() {
    const feed = document.getElementById('blog-feed');
    feed.innerHTML = `<div class="loading"><div class="spinner"></div><span>Loading stories...</span></div>`;

    try {
        const res   = await fetch(API_URL);
        const blogs = await res.json();
        feed.innerHTML = '';

        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (!blogs.length) {
            feed.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">✍️</div>
                    <h3>No stories yet</h3>
                    <p>Be the first to share a travel experience!</p>
                </div>`;
            return;
        }

        blogs.forEach((blog, i) => {
            const isAuthor = blog.author._id === user.id;
            const card = document.createElement('div');
            card.className = 'blog-card';
            card.style.animation = `cardIn 0.4s ease ${i * 0.06}s both`;

            card.innerHTML = `
                ${blog.image ? `<img class="blog-card-img" src="${blog.image}" alt="${blog.title}" loading="lazy" onerror="this.style.display='none'">` : ''}
                <div class="blog-card-body">
                    <div class="blog-card-meta">
                        <span>✍️ ${blog.author.username}</span>
                        <span class="dot"></span>
                        <span>📍 ${blog.location}</span>
                        ${blog.createdAt ? `<span class="dot"></span><span>${new Date(blog.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>` : ''}
                    </div>
                    <h2>${blog.title}</h2>
                    <p>${blog.content.length > 280 ? blog.content.slice(0, 280) + '…' : blog.content}</p>
                </div>
                ${isAuthor ? `
                <div class="blog-card-actions">
                    <button class="delete-btn" data-id="${blog._id}">Delete</button>
                </div>` : ''}
            `;
            feed.appendChild(card);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Delete this story?')) return;
                await deleteBlog(btn.dataset.id);
            });
        });

    } catch (err) {
        feed.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h3>Could not load stories</h3>
                <p>Check the backend connection.</p>
            </div>`;
    }
}

async function deleteBlog(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
            showToast('Story deleted', 'success');
            fetchBlogs();
        } else {
            showToast('Could not delete', 'error');
        }
    } catch {
        showToast('Network error', 'error');
    }
}

// Card animation style
const style = document.createElement('style');
style.textContent = `
@keyframes cardIn {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
}`;
document.head.appendChild(style);
