// assets/js/utils.js v1.1.0
// Utility functions - debounce, validation, download, toast

function debounce(fn, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function isValidDomain(domain) {
    return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain);
}

function parseDomainLine(line) {
    const trimmed = line.trim();
    
    if (!trimmed) {
        return { type: 'empty', originalLine: line };
    }
    
    const hashIndex = trimmed.indexOf('#');
    if (hashIndex === 0) {
        return { type: 'comment', originalLine: line };
    }
    
    let content = hashIndex >= 0 ? trimmed.substring(0, hashIndex).trim() : trimmed;
    
    if (!content) {
        return { type: 'comment', originalLine: line };
    }
    
    if (content.startsWith('!')) {
        return { type: 'comment', originalLine: line };
    }
    
    if (content.startsWith('+')) {
        const domain = content.substring(1).trim().toLowerCase().replace(/^\*\./, '');
        return {
            type: 'whitelist',
            domain: domain,
            isValid: domain ? isValidDomain(domain) : false,
            originalLine: line
        };
    }
    
    if (content.startsWith('@')) {
        const match = content.substring(1).trim().match(/^([^=]+)=(.+)$/);
        if (match) {
            const domain = match[1].toLowerCase().replace(/^\*\./, '');
            const ip = match[2].trim();
            return {
                type: 'customDns',
                domain: domain,
                ip: ip,
                isValid: domain ? isValidDomain(domain) : false,
                originalLine: line
            };
        }
        return { type: 'comment', originalLine: line };
    }
    
    if (content.startsWith('0.0.0.0 ') || content.startsWith('127.0.0.1 ')) {
        const domain = content.replace(/^(0\.0\.0\.0|127\.0\.0\.1)\s+/, '').toLowerCase().replace(/^\*\./, '');
        return {
            type: 'hosts',
            domain: domain,
            isValid: domain ? isValidDomain(domain) : false,
            originalLine: line
        };
    }
    
    if (content.startsWith('address=/')) {
        const match = content.match(/address=\/([^\/]+)\//);
        if (match) {
            const domain = match[1].toLowerCase().replace(/^\*\./, '');
            return {
                type: 'dnsmasq',
                domain: domain,
                isValid: domain ? isValidDomain(domain) : false,
                originalLine: line
            };
        }
        return { type: 'comment', originalLine: line };
    }
    
    const domain = content.toLowerCase().replace(/^\*\./, '');
    return {
        type: 'domain',
        domain: domain,
        isValid: domain ? isValidDomain(domain) : false,
        originalLine: line
    };
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast' + (isError ? ' error' : '');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function downloadFile(content, filename) {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
