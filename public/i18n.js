const translations = {
    en: {
        authTitle: 'Login / Register',
        loginTab: 'Login',
        registerTab: 'Register',
        username: 'Username',
        password: 'Password',
        inviteCode: 'Invite Code (for register)',
        loginBtn: 'Login',
        registerBtn: 'Register',
        dashboardTitle: 'Dashboard',
        welcome: 'Welcome, ',
        uploadTitle: 'Upload Lua Script',
        obfuscationMethod: 'Obfuscation Method',
        custom: 'Custom Obfuscator',
        prometheus: 'Prometheus (Advanced)',
        chooseFile: 'Choose .lua file',
        uploadBtn: 'Upload & Obfuscate',
        yourScripts: 'Your Scripts',
        logout: 'Logout',
        copyLink: 'Copy Link',
        download: 'Download',
        invalidInvite: 'Invalid invite code',
        uploadSuccess: 'Upload successful!',
        uploadFail: 'Upload failed',
        loginFail: 'Login failed'
    },
    zh: {
        authTitle: '登录 / 注册',
        loginTab: '登录',
        registerTab: '注册',
        username: '用户名',
        password: '密码',
        inviteCode: '邀请码 (注册时需要)',
        loginBtn: '登录',
        registerBtn: '注册',
        dashboardTitle: '控制面板',
        welcome: '欢迎, ',
        uploadTitle: '上传 Lua 脚本',
        obfuscationMethod: '混淆方式',
        custom: '内置混淆器',
        prometheus: 'Prometheus (高级)',
        chooseFile: '选择 .lua 文件',
        uploadBtn: '上传并混淆',
        yourScripts: '你的脚本',
        logout: '登出',
        copyLink: '复制链接',
        download: '下载',
        invalidInvite: '邀请码无效',
        uploadSuccess: '上传成功！',
        uploadFail: '上传失败',
        loginFail: '登录失败'
    },
    fr: {
        authTitle: 'Connexion / Inscription',
        loginTab: 'Connexion',
        registerTab: 'Inscription',
        username: 'Nom d\'utilisateur',
        password: 'Mot de passe',
        inviteCode: 'Code d\'invitation',
        loginBtn: 'Connexion',
        registerBtn: 'Inscription',
        dashboardTitle: 'Tableau de bord',
        welcome: 'Bienvenue, ',
        uploadTitle: 'Téléverser un script Lua',
        obfuscationMethod: 'Méthode d\'obfuscation',
        custom: 'Obfuscateur intégré',
        prometheus: 'Prometheus (Avancé)',
        chooseFile: 'Choisir un fichier .lua',
        uploadBtn: 'Téléverser & Obfusquer',
        yourScripts: 'Vos scripts',
        logout: 'Déconnexion',
        copyLink: 'Copier le lien',
        download: 'Télécharger',
        invalidInvite: 'Code d\'invitation invalide',
        uploadSuccess: 'Téléversement réussi !',
        uploadFail: 'Échec du téléversement',
        loginFail: 'Échec de la connexion'
    }
};

let currentLang = localStorage.getItem('lang') || 'en';

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    const t = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('lang-select');
    select.value = currentLang;
    applyLanguage(currentLang);
    select.addEventListener('change', (e) => {
        applyLanguage(e.target.value);
    });
});
