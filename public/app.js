let token = localStorage.getItem('token');

const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const authForm = document.getElementById('auth-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const inviteInput = document.getElementById('invite-code');
const authSubmit = document.getElementById('auth-submit');
const authMessage = document.getElementById('auth-message');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const welcomeMsg = document.getElementById('welcome-message');
const logoutBtn = document.getElementById('logout-btn');
const uploadBtn = document.getElementById('upload-btn');
const scriptFile = document.getElementById('script-file');
const obfuscationMethod = document.getElementById('obfuscation-method');
const uploadStatus = document.getElementById('upload-status');
const scriptsUl = document.getElementById('scripts-ul');

let mode = 'login';

function updateUIBasedOnAuth() {
    if (token) {
        authSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        fetchUserData();
    } else {
        authSection.style.display = 'block';
        dashboardSection.style.display = 'none';
    }
}

async function fetchUserData() {
    try {
        const res = await fetch('/api/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const t = translations[currentLang];
        welcomeMsg.textContent = `${t.welcome}${data.username}`;
        renderScripts(data.scripts || []);
    } catch (e) {
        localStorage.removeItem('token');
        token = null;
        updateUIBasedOnAuth();
    }
}

function renderScripts(scripts) {
    scriptsUl.innerHTML = '';
    scripts.forEach(s => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${s.originalName} (${s.method})</span>
            <div>
                <button class="copy-link" data-id="${s.id}">Copy Link</button>
                <a href="/api/script/${s.id}" target="_blank">Download</a>
            </div>
        `;
        scriptsUl.appendChild(li);
    });
    document.querySelectorAll('.copy-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const link = `${window.location.origin}/api/script/${id}`;
            navigator.clipboard.writeText(link);
            alert('Link copied! (Requires authentication)');
        });
    });
}

loginTab.addEventListener('click', () => {
    mode = 'login';
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    inviteInput.style.display = 'none';
    authSubmit.textContent = translations[currentLang].loginBtn;
});

registerTab.addEventListener('click', () => {
    mode = 'register';
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    inviteInput.style.display = 'block';
    authSubmit.textContent = translations[currentLang].registerBtn;
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;
    const invite = inviteInput.value;
    const t = translations[currentLang];
    const endpoint = mode === 'login' ? '/api/login' : '/api/register';
    const body = { username, password };
    if (mode === 'register') body.inviteCode = invite;
    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) {
            authMessage.textContent = data.error || (mode === 'login' ? t.loginFail : t.invalidInvite);
            return;
        }
        token = data.token;
        localStorage.setItem('token', token);
        updateUIBasedOnAuth();
    } catch (err) {
        authMessage.textContent = 'Network error';
    }
});

logoutBtn.addEventListener('click', async () => {
    await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    localStorage.removeItem('token');
    token = null;
    updateUIBasedOnAuth();
});

uploadBtn.addEventListener('click', async () => {
    const file = scriptFile.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('script', file);
    formData.append('method', obfuscationMethod.value);
    const t = translations[currentLang];
    uploadStatus.textContent = 'Uploading...';
    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        uploadStatus.textContent = t.uploadSuccess;
        fetchUserData();
    } catch (err) {
        uploadStatus.textContent = t.uploadFail + ': ' + err.message;
    }
});

updateUIBasedOnAuth();
