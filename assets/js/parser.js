// assets/js/parser.js v1.0.7
// Domain parsing logic for DNS Ad Block List Generator

function parseSource() {
    const content = document.getElementById('sourceInput').value;
    const lines = content.split('\n');

    domains = [];
    whitelist = [];
    customDns = [];
    let commentCount = 0;

    for (const line of lines) {
        let rawLine = line.trim();
        
        if (!rawLine) {
            commentCount++;
            continue;
        }

        const hashIndex = rawLine.indexOf('#');
        if (hashIndex === 0) {
            commentCount++;
            continue;
        }
        
        if (hashIndex > 0) {
            rawLine = rawLine.substring(0, hashIndex).trim();
        }
        
        if (!rawLine) {
            commentCount++;
            continue;
        }

        if (rawLine.startsWith('+')) {
            let domain = rawLine.substring(1).trim().toLowerCase().replace(/^\*\./, '');
            if (domain && isValidDomain(domain)) {
                whitelist.push(domain);
            } else {
                commentCount++;
            }
            continue;
        }

        if (rawLine.startsWith('!')) {
            commentCount++;
            continue;
        }

        if (rawLine.startsWith('@')) {
            const match = rawLine.substring(1).trim().match(/^([^=]+)=(.+)$/);
            if (match) {
                const dnsDomain = match[1].toLowerCase().replace(/^\*\./, '');
                const dnsIp = match[2].trim();
                if (dnsDomain && isValidDomain(dnsDomain)) {
                    customDns.push({ domain: dnsDomain, ip: dnsIp });
                } else {
                    commentCount++;
                }
            } else {
                commentCount++;
            }
            continue;
        }

        let domain = rawLine;

        if (rawLine.startsWith('0.0.0.0 ') || rawLine.startsWith('127.0.0.1 ')) {
            domain = rawLine.replace(/^(0\.0\.0\.0|127\.0\.0\.1)\s+/, '');
        }

        if (rawLine.startsWith('address=/')) {
            const match = rawLine.match(/address=\/([^\/]+)\//);
            if (match) domain = match[1];
        }

        domain = domain.toLowerCase().replace(/^\*\./, '');

        if (domain && isValidDomain(domain)) {
            domains.push(domain);
        } else {
            commentCount++;
        }
    }

    const whitelistSet = new Set(whitelist.map(w => w.replace(/^\*\./, '')));
    const customDnsSet = new Set(customDns.map(c => c.domain.replace(/^\*\./, '')));
    const excludeSet = new Set([...whitelistSet, ...customDnsSet]);

    domains = domains.filter(d => !excludeSet.has(d.replace(/^\*\./, '')));

    const uniqueWhitelist = [...new Set(whitelist)];
    whitelist = uniqueWhitelist;

    document.getElementById('domainCount').textContent = domains.length;
    document.getElementById('validCount').textContent = domains.length;
    document.getElementById('commentCount').textContent = commentCount;

    if (domains.length > 0 || whitelist.length > 0 || customDns.length > 0) {
        generateRules();
    }
}

function dedupeDomains() {
    const textarea = document.getElementById('sourceInput');
    const lines = textarea.value.split('\n');
    
    const seen = new Set();
    const uniqueLines = [];
    let removedCount = 0;
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            uniqueLines.push(line);
            continue;
        }
        
        let domain = trimmed;
        const hashIndex = domain.indexOf('#');
        if (hashIndex > 0) {
            domain = domain.substring(0, hashIndex).trim();
        }
        
        if (domain.startsWith('+') || domain.startsWith('!') || domain.startsWith('@')) {
            const prefix = domain[0];
            const value = domain.substring(1).trim().split('#')[0].trim();
            const key = prefix + value.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                uniqueLines.push(line);
            } else {
                removedCount++;
            }
        } else if (domain.startsWith('#')) {
            uniqueLines.push(line);
        } else if (domain.startsWith('0.0.0.0 ') || domain.startsWith('127.0.0.1 ')) {
            const d = domain.replace(/^(0\.0\.0\.0|127\.0\.0\.1)\s+/, '').toLowerCase();
            if (!seen.has(d)) {
                seen.add(d);
                uniqueLines.push(line);
            } else {
                removedCount++;
            }
        } else if (domain.startsWith('address=/')) {
            const match = domain.match(/address=\/([^\/]+)\//);
            if (match) {
                const d = match[1].toLowerCase();
                if (!seen.has(d)) {
                    seen.add(d);
                    uniqueLines.push(line);
                } else {
                    removedCount++;
                }
            } else {
                uniqueLines.push(line);
            }
        } else {
            const d = domain.toLowerCase();
            if (!seen.has(d)) {
                seen.add(d);
                uniqueLines.push(line);
            } else {
                removedCount++;
            }
        }
    }
    
    textarea.value = uniqueLines.join('\n');
    parseSource();
    showToast(`已去除 ${removedCount} 个重复项`);
}

function sortDomains() {
    const textarea = document.getElementById('sourceInput');
    const lines = textarea.value.split('\n');
    
    const headerComments = [];
    const bodyLines = [];
    const specialLines = [];
    
    let inHeader = true;
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            bodyLines.push(line);
            continue;
        }
        
        if (trimmed.startsWith('+') || trimmed.startsWith('!') || trimmed.startsWith('@')) {
            specialLines.push(line);
            continue;
        }
        
        if (trimmed.startsWith('#')) {
            if (inHeader) {
                headerComments.push(line);
            } else {
                bodyLines.push(line);
            }
            continue;
        }
        
        inHeader = false;
        bodyLines.push(line);
    }
    
    const plainDomains = bodyLines.filter(line => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith('#');
    });
    
    const comments = bodyLines.filter(line => {
        const trimmed = line.trim();
        return trimmed && trimmed.startsWith('#');
    });
    
    const sortedDomains = [...plainDomains].sort((a, b) => {
        const aClean = a.trim().replace(/^(0\.0\.0\.0|127\.0\.0\.1|address=\/)/, '').toLowerCase();
        const bClean = b.trim().replace(/^(0\.0\.0\.0|127\.0\.0\.1|address=\/)/, '').toLowerCase();
        return aClean.localeCompare(bClean);
    });
    
    const result = [
        ...headerComments,
        ...sortedDomains,
        ...specialLines,
        ...comments
    ];
    
    textarea.value = result.join('\n');
    parseSource();
    showToast(t('toastSorted'));
}

function updateSettings() {
    settings.projectName = document.getElementById('projectNameInput').value || 'ad_block_list';
    settings.version = document.getElementById('versionInput').value || '1.0.0';
    settings.ipv4 = document.getElementById('ipv4Input').value || '127.0.0.1';
    settings.ipv6 = document.getElementById('ipv6Input').value || '::';
    settings.dnsmasqFilename = document.getElementById('dnsmasqFilename').value || 'dnsmasq.conf';
    settings.hostsFilename = document.getElementById('hostsFilename').value || 'hosts.txt';
    settings.adguardFilename = document.getElementById('adguardFilename').value || 'adguard.txt';
    if (domains.length > 0) generateRules();
}
