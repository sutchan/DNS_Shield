// assets/js/app.js v1.0.6
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

    const textarea = document.getElementById('sourceInput');
    if (textarea) {
        textarea.addEventListener('scroll', syncScroll);
    }

    const outputPreview = document.getElementById('outputPreview');
    if (outputPreview) {
        outputPreview.addEventListener('scroll', syncOutputScroll);
    }

    fetch('domains.txt')
        .then(r => r.text())
        .then(t => {
            if (t.trim()) {
                document.getElementById('sourceInput').value = t;
                parseSource();
                updateLineNumbers();
                document.querySelector('.preset-tag[onclick*="builtin"]')?.classList.add('active');
            }
        })
        .catch(() => {});
})();
