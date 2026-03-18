// assets/js/ui-controls.js v1.0.7
// UI control functions for DNS Ad Block List Generator

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    if (isDark) {
        html.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        document.querySelector('.theme-btn').textContent = '🌙';
    } else {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        document.querySelector('.theme-btn').textContent = '☀️';
    }
}

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('collapsed');
    }
}

function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    const settingsBtn = document.querySelector('.settings-btn');
    if (panel) {
        panel.classList.toggle('collapsed');
        if (settingsBtn) {
            settingsBtn.classList.toggle('active');
        }
    }
}

function switchLang() {
    isLangZh = !isLangZh;
    localStorage.setItem('lang', isLangZh ? 'zh' : 'en');
    updateLang();
}

function updateLang() {
    const lang = localStorage.getItem('lang') || 'zh';
    const trans = getTranslations();

    document.querySelector('h1').textContent = trans.title;
    document.querySelector('.subtitle').textContent = trans.subtitle;

    const langSwitch = document.querySelector('.lang-switch');
    if (langSwitch) {
        if (lang === 'en') {
            langSwitch.classList.add('active');
            langSwitch.querySelector('.lang-zh').style.opacity = '0.6';
            langSwitch.querySelector('.lang-en').style.opacity = '1';
        } else {
            langSwitch.classList.remove('active');
            langSwitch.querySelector('.lang-zh').style.opacity = '1';
            langSwitch.querySelector('.lang-en').style.opacity = '0.6';
        }
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (trans[key]) {
            el.textContent = trans[key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (trans[key]) {
            el.placeholder = trans[key];
        }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (trans[key]) {
            el.title = trans[key];
        }
    });

    const usageToggle = document.getElementById('usageToggle');
    const usageGuide = document.getElementById('usageGuide');
    const usageToggleText = document.getElementById('usageToggleText');
    if (usageToggle && usageGuide) {
        const isExpanded = usageGuide.classList.contains('visible');
        if (isExpanded) {
            usageToggleText.textContent = trans.usageTitle;
        }
    }
}

function toggleUsage() {
    const usageToggle = document.getElementById('usageToggle');
    const usageGuide = document.getElementById('usageGuide');
    const usageToggleText = document.getElementById('usageToggleText');
    const trans = getTranslations();

    if (!usageToggle || !usageGuide) return;

    usageToggle.classList.toggle('expanded');
    usageGuide.classList.toggle('visible');

    const isExpanded = usageGuide.classList.contains('visible');
    usageToggleText.textContent = trans.usageTitle;
}
