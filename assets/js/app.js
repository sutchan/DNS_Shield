// assets/js/app.js v1.0.7
// Main entry point for DNS Ad Block List Generator

(function init() {
    const savedTheme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.querySelector('.theme-btn').textContent = '☀️';
    } else {
        document.querySelector('.theme-btn').textContent = '🌙';
    }

    isLangZh = localStorage.getItem('lang') !== 'en';
    updateLang();
    loadUrlList();
    loadAutoSave();

    const textarea = document.getElementById('sourceInput');
    if (textarea) {
        textarea.addEventListener('scroll', syncScroll);
    }

    const outputPreview = document.getElementById('outputPreview');
    if (outputPreview) {
        outputPreview.addEventListener('scroll', syncOutputScroll);
    }

    fetch('domains.txt')
        .then(r => {
            if (!r.ok) throw new Error('Failed to load domains.txt');
            return r.text();
        })
        .then(t => {
            if (t.trim()) {
                document.getElementById('sourceInput').value = t;
                parseSource();
                updateLineNumbers();
                document.querySelector('.preset-tag[onclick*="builtin"]')?.classList.add('active');
            }
        })
        .catch(err => {
            console.warn('Could not load domains.txt:', err);
            // Continue with empty input - not critical
        });

    document.addEventListener('keydown', handleKeyboardShortcuts);
    setInterval(autoSave, 30000);
})();

function handleKeyboardShortcuts(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        generateRules();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDomains();
    }
}

function autoSave() {
    const sourceInput = document.getElementById('sourceInput');
    if (sourceInput && sourceInput.value.trim()) {
        localStorage.setItem('dnsShield_autosave', sourceInput.value);
        localStorage.setItem('dnsShield_autosave_time', Date.now());
    }
}

function loadAutoSave() {
    const autosave = localStorage.getItem('dnsShield_autosave');
    const sourceInput = document.getElementById('sourceInput');
    if (autosave && sourceInput && !sourceInput.value.trim()) {
        sourceInput.value = autosave;
        parseSource();
        updateLineNumbers();
        const autoSaveTime = localStorage.getItem('dnsShield_autosave_time');
        if (autoSaveTime) {
            const timeAgo = Math.floor((Date.now() - parseInt(autoSaveTime)) / 60000);
            if (timeAgo > 0 && typeof showToast === 'function') {
                showToast(isLangZh ? `已恢复上次自动保存的内容 (${timeAgo}分钟前)` : `Restored auto-saved content (${timeAgo} min ago)`);
            }
        }
    }
}

function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}
