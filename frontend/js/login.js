// login.js — auth modal logic

document.addEventListener('DOMContentLoaded', () => {
    const modal        = document.getElementById('login-modal');
    const loginBtn     = document.getElementById('login-btn');
    const closeBtn     = document.getElementById('close-modal');
    const toggleAuth   = document.getElementById('toggle-auth');
    const authForm     = document.getElementById('auth-form');
    const usernameField= document.getElementById('username-field');
    const usernameInput= document.getElementById('username');
    const modalTitle   = document.getElementById('modal-title');
    const authSubmit   = document.getElementById('auth-submit');
    const loginPromptBtn = document.getElementById('login-prompt-btn');

    let isLogin = true;

    function openModal() {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    loginBtn?.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    loginPromptBtn?.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    toggleAuth?.addEventListener('click', () => {
        isLogin = !isLogin;
        if (isLogin) {
            modalTitle.textContent = 'Welcome back';
            authSubmit.textContent = 'Sign In';
            usernameField.style.display = 'none';
            if (usernameInput) usernameInput.removeAttribute('required');
            toggleAuth.innerHTML = `Don't have an account? <span>Sign up</span>`;
        } else {
            modalTitle.textContent = 'Create account';
            authSubmit.textContent = 'Sign Up';
            usernameField.style.display = 'block';
            if (usernameInput) usernameInput.setAttribute('required', 'true');
            toggleAuth.innerHTML = `Already have an account? <span>Sign in</span>`;
        }
    });

    authForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const username = usernameInput?.value.trim();

        authSubmit.textContent = isLogin ? 'Signing in...' : 'Creating account...';
        authSubmit.disabled = true;

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload  = isLogin ? { email, password } : { username, email, password };

        try {
            const res  = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                closeModal();
                showToast(isLogin ? 'Welcome back! 👋' : 'Account created! 🎉', 'success');
                setTimeout(() => window.location.reload(), 800);
            } else {
                showToast(data.msg || 'Authentication failed', 'error');
            }
        } catch (err) {
            showToast('Server error — is the backend running?', 'error');
        } finally {
            authSubmit.textContent = isLogin ? 'Sign In' : 'Sign Up';
            authSubmit.disabled = false;
        }
    });
});
