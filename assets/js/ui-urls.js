// assets/js/ui-urls.js v1.1.1
// URL management functions for DNS Ad Block List Generator

function addUrl() {
    const url = document.getElementById('urlInput').value.trim();
    if (!url) {
        showToast(t('toastInvalidUrl'), true);
        return;
    }

    if (!isValidUrl(url)) {
        showToast(t('toastInvalidUrl'), true);
        return;
    }

    if (urlList.some(u => u.url === url)) {
        showToast(t('toastUrlExists'), true);
        return;
    }

    urlList.push({ url, status: 'pending' });
    
    urlList.sort((a, b) => {
        const prefixA = /^[\+\!\@]/.test(a.url);
        const prefixB = /^[\+\!\@]/.test(b.url);
        if (prefixA && !prefixB) return -1;
        if (!prefixA && prefixB) return 1;
        return 0;
    });
    
    renderUrlList();
    saveUrlList();
}

function removeUrl(index) {
    urlList.splice(index, 1);
    renderUrlList();
    saveUrlList();
}

function sortUrls() {
    urlList.sort((a, b) => {
        const prefixA = /^[\+\!\@]/.test(a.url);
        const prefixB = /^[\+\!\@]/.test(b.url);
        if (prefixA && !prefixB) return -1;
        if (!prefixA && prefixB) return 1;
        return 0;
    });
    renderUrlList();
    saveUrlList();
    showToast(t('toastSorted'));
}

function renderUrlList() {
    const container = document.getElementById('urlList');
    container.innerHTML = urlList.map((item, index) => `
        <div class="url-item ${item.status}">
            <span class="url-text" title="${escapeHtml(item.url)}">${escapeHtml(item.url)}</span>
            <span class="url-remove" onclick="removeUrl(${index})">✕</span>
        </div>
    `).join('');
}

function validateUrl(url) {
    return new Promise((resolve) => {
        fetch(url, { method: 'HEAD' })
            .then(response => {
                resolve({
                    valid: response.ok,
                    status: response.status,
                    contentType: response.headers.get('content-type')
                });
            })
            .catch(() => resolve({ valid: false, status: 0 }));
    });
}

async function validateAllUrls() {
    const total = urlList.length;
    let validCount = 0;
    let invalidCount = 0;

    for (let i = 0; i < urlList.length; i++) {
        const item = urlList[i];
        item.status = 'loading';
        renderUrlList();

        const result = await validateUrl(item.url);

        if (result.valid) {
            item.status = 'success';
            item.valid = true;
            validCount++;
        } else {
            item.status = 'error';
            item.valid = false;
            invalidCount++;
        }

        renderUrlList();
    }

    saveUrlList();
    showToast(`${t('toastValidatedUrl')}: ${validCount}/${total}`);
}

async function fetchAllUrls() {
    const validUrls = urlList.filter(u => u.valid !== false);
    
    if (validUrls.length === 0) {
        showToast(t('toastNoValidUrls'), true);
        return;
    }

    let allContent = [];
    const btn = document.querySelector('[onclick="fetchAllUrls()"]');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
        btn.innerHTML = '<span class="spinner"></span>' + (isLangZh ? '获取中...' : 'Fetching...');
        btn.classList.add('btn-loading');
        btn.disabled = true;
    }

    for (const item of validUrls) {
        try {
            showToast(t('toastFetching') + ' ' + escapeHtml(item.url));
            const response = await fetch(item.url);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const content = await response.text();
            allContent.push(content);
        } catch (e) {
            showToast(t('toastFetchFailed') + escapeHtml(item.url), true);
        }
    }

    if (allContent.length > 0) {
        document.getElementById('sourceInput').value = allContent.join('\n');
        parseSource();
        showToast(t('toastFetchSuccess') + ` (${allContent.length} ${t('toastFiles')})`);
    }

    if (btn) {
        btn.innerHTML = originalText;
        btn.classList.remove('btn-loading');
        btn.disabled = false;
    }
}

function saveUrlList() {
    localStorage.setItem('urlList', JSON.stringify(urlList));
}

function loadUrlList() {
    const saved = localStorage.getItem('urlList');
    if (saved) {
        try {
            urlList = JSON.parse(saved);
            
            urlList.sort((a, b) => {
                const prefixA = /^[\+\!\@]/.test(a.url);
                const prefixB = /^[\+\!\@]/.test(b.url);
                if (prefixA && !prefixB) return -1;
                if (!prefixA && prefixB) return 1;
                return 0;
            });
            
            renderUrlList();
        } catch (e) {
            urlList = [];
        }
    }
}

let fileHandle = null;

async function saveDomains() {
    const content = document.getElementById('sourceInput').value;
    localStorage.setItem('domainsBackup', content);
    
    if ('showSaveFilePicker' in window) {
        try {
            if (!fileHandle) {
                fileHandle = await window.showSaveFilePicker({
                    suggestedName: 'domains.txt',
                    types: [{
                        description: 'Text Files',
                        accept: { 'text/plain': ['.txt'] }
                    }]
                });
            }
            const writable = await fileHandle.createWritable();
            await writable.write(content);
            await writable.close();
            showToast(t('toastSaved'));
            return;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('File save error:', err);
            }
        }
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'domains.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    showToast(t('toastSaved'));
}

async function fetchFromUrl() {
    const url = document.getElementById('urlInput').value.trim();
    if (!url) {
        showToast('请输入有效的 URL', true);
        return;
    }

    const btn = document.querySelector('#urlInput + .btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span>' + (isLangZh ? '获取中...' : 'Fetching...');
    btn.classList.add('btn-loading');
    btn.disabled = true;

    try {
        showToast(t('toastFetching'));
        const response = await fetch(url);
        if (!response.ok) throw new Error(t('toastFetchFailed'));
        const content = await response.text();
        document.getElementById('sourceInput').value = content;
        parseSource();
        showToast(t('toastFetchSuccess'));
    } catch (e) {
        showToast(t('toastFetchFailed') + e.message, true);
    } finally {
        btn.innerHTML = originalText;
        btn.classList.remove('btn-loading');
        btn.disabled = false;
    }
}

function loadPreset(name, evt) {
    document.querySelectorAll('.preset-tag').forEach(tag => tag.classList.remove('active'));
    if (evt && evt.target) evt.target.classList.add('active');
    
    if (name === 'builtin') {
        fetch('domains.txt').then(r => r.text()).then(t => {
            document.getElementById('sourceInput').value = t;
            parseSource();
            updateLineNumbers();
        }).catch(() => {
            showToast(t('toastPresetFailed'), true);
        });
        showToast(t('toastLoadPreset'));
        return;
    }
    
    const presetUrls = {
        'adguard': 'https://raw.githubusercontent.com/AdAway/adaway.github.io/master/hosts.txt',
        'easylist': 'https://raw.githubusercontent.com/easylist/easylist/master/easylist/easylist_adservers.txt',
        'neohosts': 'https://raw.githubusercontent.com/neoHosts/neoHosts/master/data/hosts/basic'
    };
    
    const url = presetUrls[name];
    if (url) {
        document.getElementById('urlInput').value = url;
        fetchFromUrl();
    }
    
    showToast(t('toastLoadPreset'));
}

// Helper function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, m => map[m]);
}