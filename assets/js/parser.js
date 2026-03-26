// assets/js/parser.js v1.1.1
// Domain parsing logic for DNS Ad Block List Generator

function parseSource() {
    const content = document.getElementById('sourceInput').value;
    const lines = content.split('\n');

    domains = [];
    whitelist = [];
    customDns = [];
    let commentCount = 0;

    for (const line of lines) {
        const parsed = parseDomainLine(line);
        
        if (parsed.type === 'empty') {
            commentCount++;
            continue;
        }
        
        if (parsed.type === 'comment') {
            commentCount++;
            continue;
        }
        
        if (parsed.type === 'whitelist') {
            if (parsed.isValid) {
                whitelist.push(parsed.domain);
            } else {
                commentCount++;
            }
            continue;
        }
        
        if (parsed.type === 'customDns') {
            if (parsed.isValid) {
                customDns.push({ domain: parsed.domain, ip: parsed.ip });
            } else {
                commentCount++;
            }
            continue;
        }
        
        if (parsed.type === 'hosts' || parsed.type === 'dnsmasq' || parsed.type === 'domain') {
            if (parsed.isValid) {
                domains.push(parsed.domain);
            } else {
                commentCount++;
            }
            continue;
        }
        
        commentCount++;
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
        const parsed = parseDomainLine(line);
        
        if (parsed.type === 'empty') {
            uniqueLines.push(line);
            continue;
        }
        
        if (parsed.type === 'comment') {
            uniqueLines.push(line);
            continue;
        }
        
        if (!parsed.isValid) {
            uniqueLines.push(line);
            continue;
        }
        
        let key;
        if (parsed.type === 'whitelist') {
            key = '+' + parsed.domain;
        } else if (parsed.type === 'customDns') {
            key = '@' + parsed.domain + '=' + parsed.ip;
        } else {
            key = parsed.domain;
        }
        
        if (!seen.has(key)) {
            seen.add(key);
            uniqueLines.push(line);
        } else {
            removedCount++;
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
        const parsed = parseDomainLine(line);
        
        if (parsed.type === 'empty') {
            bodyLines.push(line);
            continue;
        }
        
        if (parsed.type === 'whitelist' || parsed.type === 'customDns') {
            specialLines.push(line);
            continue;
        }
        
        if (parsed.type === 'comment') {
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
        const parsed = parseDomainLine(line);
        return parsed.type === 'domain' || parsed.type === 'hosts' || parsed.type === 'dnsmasq';
    });
    
    const comments = bodyLines.filter(line => {
        const parsed = parseDomainLine(line);
        return parsed.type === 'comment';
    });
    
    const sortedDomains = [...plainDomains].sort((a, b) => {
        const aParsed = parseDomainLine(a);
        const bParsed = parseDomainLine(b);
        return aParsed.domain.localeCompare(bParsed.domain);
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
