// assets/js/generator.js v1.1.1
// Rule generation logic for DNS Ad Block List Generator

function generateHeader(formatType, totalDomains, whitelistCount, dateStr) {
    const formatConfigs = {
        dnsmasq: {
            commentChar: '#',
            separator: '=====================================',
            title: 'Dnsmasq Ad Block List',
            description: 'Router-level ad blocking filter',
            usage: `# Usage:\n#   - Merlin: Software Center -> DNS Settings\n#   - OpenWrt: Services -> DHCP and DNS`
        },
        hosts: {
            commentChar: '#',
            separator: '=====================================',
            title: 'Hosts Ad Block List',
            description: 'Router-level ad blocking hosts file',
            usage: '# Usage: Import to router ad blocking settings'
        },
        adguard: {
            commentChar: '!',
            separator: '====================================',
            title: 'AdGuard Ad Block Filter',
            description: 'AdGuard-compatible ad blocking filter',
            usage: ''
        }
    };

    const config = formatConfigs[formatType];
    if (!config) return '';

    const { commentChar, separator, title, description, usage } = config;
    const lines = [];

    lines.push(`${commentChar} ${separator}`);
    lines.push(`${commentChar} ${settings.projectName} - ${title}`);
    lines.push(`${commentChar} ${separator}`);
    lines.push(`${commentChar}`);
    lines.push(`${commentChar} Description: ${description}`);
    lines.push(`${commentChar}`);
    lines.push(`${commentChar} Version: ${settings.version}`);
    lines.push(`${commentChar} Update: ${dateStr}`);
    lines.push(`${commentChar} Domains: ${totalDomains} unique domains`);
    if (whitelistCount > 0) {
        lines.push(`${commentChar} Whitelist: ${whitelistCount} domains`);
    }
    lines.push(`${commentChar}`);
    if (usage) {
        lines.push(usage);
        lines.push(`${commentChar}`);
    }
    lines.push(`${commentChar} Project: ${projectUrl}`);
    if (typeof demoUrl !== 'undefined') {
        lines.push(`${commentChar} Demo: ${demoUrl}`);
    }
    lines.push(`${commentChar}`);
    lines.push(`${commentChar} ${separator}`);

    return lines.join('\n') + '\n\n';
}

function generateRules() {
    const addHeader = document.getElementById('addHeader')?.checked ?? true;
    const blockIPv6 = document.getElementById('blockIPv6')?.checked ?? false;
    const dedupDomains = document.getElementById('dedupDomains')?.checked ?? true;
    const removeWildcard = document.getElementById('removeWildcard')?.checked ?? true;

    const domainList = domains || [];
    const whitelistList = whitelist || [];
    const customDnsList = customDns || [];

    const processedDomains = [...domainList];
    const processedWhitelist = [...whitelistList];

    let filteredDomains = processedDomains;
    if (removeWildcard) {
        filteredDomains = filteredDomains.map(d => d.replace(/^\*\./, ''));
    }
    if (dedupDomains) {
        filteredDomains = [...new Set(filteredDomains)].sort();
    }

    let filteredWhitelist = processedWhitelist;
    if (removeWildcard) {
        filteredWhitelist = filteredWhitelist.map(d => d.replace(/^\*\./, ''));
    }
    if (dedupDomains) {
        filteredWhitelist = [...new Set(filteredWhitelist)].sort();
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;

    let dnsmasqContent = '';
    let hostsContent = '';
    let adguardContent = '';

    if (addHeader) {
        const totalDomains = filteredDomains.length + customDnsList.length;
        const whitelistCount = filteredWhitelist.length;

        dnsmasqContent += generateHeader('dnsmasq', totalDomains, whitelistCount, dateStr);
        hostsContent += generateHeader('hosts', totalDomains, whitelistCount, dateStr);
        adguardContent += generateHeader('adguard', totalDomains, whitelistCount, dateStr);
    }

    filteredDomains.forEach(domain => {
        dnsmasqContent += `address=/${domain}/${settings.ipv4}\n`;
        hostsContent += `${settings.ipv4} ${domain}\n`;
        adguardContent += `||${domain}^\n`;

        if (blockIPv6) {
            dnsmasqContent += `address=/${domain}/${settings.ipv6}\n`;
            hostsContent += `${settings.ipv6} ${domain}\n`;
        }
    });

    customDnsList.forEach(item => {
        dnsmasqContent += `address=/${item.domain}/${item.ip}\n`;
        hostsContent += `${item.ip} ${item.domain}\n`;
        adguardContent += `||${item.domain}^\n`;

        if (blockIPv6) {
            dnsmasqContent += `address=/${item.domain}/::\n`;
        }
    });

    if (filteredWhitelist.length > 0) {
        if (addHeader) {
            dnsmasqContent += `\n# Whitelist (allow these domains)\n`;
            hostsContent += `\n# Whitelist (allow these domains)\n`;
            adguardContent += `\n! Whitelist (allow these domains)\n`;
        }
        filteredWhitelist.forEach(domain => {
            dnsmasqContent += `server=/${domain}/\n`;
            hostsContent += `# Whitelisted: ${domain}\n`;
            adguardContent += `@@||${domain}^\n`;
        });
    }

    outputContent.dnsmasq = dnsmasqContent;
    outputContent.hosts = hostsContent;
    outputContent.adguard = adguardContent;

    let preview = '';
    if (currentFormat === 'dnsmasq') {
        preview = dnsmasqContent;
    } else if (currentFormat === 'hosts') {
        preview = hostsContent;
    } else if (currentFormat === 'adguard') {
        preview = adguardContent;
    } else {
        preview = '=== Dnsmasq 格式 ===\n' + dnsmasqContent + '\n\n=== Hosts 格式 ===\n' + hostsContent;
    }

    document.getElementById('outputPreview').textContent = preview;
    updateOutputLineNumbers();
    document.getElementById('mergeInfo').textContent = `黑名单: ${filteredDomains.length} | 白名单: ${filteredWhitelist.length} | 自定义DNS: ${customDnsList.length} | Dnsmasq: ${dnsmasqContent.split('\n').length} 行 | Hosts: ${hostsContent.split('\n').length} 行 | AdGuard: ${adguardContent.split('\n').length} 行`;
}

function downloadOutput() {
    const format = currentFormat;
    if (format === 'dnsmasq') {
        downloadFile(outputContent.dnsmasq, settings.dnsmasqFilename);
    } else if (format === 'hosts') {
        downloadFile(outputContent.hosts, settings.hostsFilename);
    } else if (format === 'adguard') {
        downloadFile(outputContent.adguard, settings.adguardFilename);
    } else {
        downloadFile(outputContent.dnsmasq, settings.dnsmasqFilename);
        setTimeout(() => downloadFile(outputContent.hosts, settings.hostsFilename), 500);
    }
}

function downloadDnsmasq() {
    if (!outputContent.dnsmasq) generateRules();
    downloadFile(outputContent.dnsmasq, settings.dnsmasqFilename);
    showToast('已下载 ' + settings.dnsmasqFilename);
}

function downloadHosts() {
    if (!outputContent.hosts) generateRules();
    downloadFile(outputContent.hosts, settings.hostsFilename);
    showToast('已下载 ' + settings.hostsFilename);
}

function downloadAdguard() {
    if (!outputContent.adguard) generateRules();
    downloadFile(outputContent.adguard, settings.adguardFilename);
    showToast('已下载 ' + settings.adguardFilename);
}

function copyOutput() {
    const format = currentFormat;
    let text = '';
    if (format === 'dnsmasq') text = outputContent.dnsmasq;
    else if (format === 'hosts') text = outputContent.hosts;
    else if (format === 'adguard') text = outputContent.adguard;
    else text = outputContent.dnsmasq + '\n\n' + outputContent.hosts;

    navigator.clipboard.writeText(text).then(() => {
        showToast(t('toastCopied'));
    }).catch(() => {
        showToast('复制失败', true);
    });
}

function setFormat(format) {
    currentFormat = format;
    document.querySelectorAll('.format-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.format-tab[onclick="setFormat('${format}')"]`).classList.add('active');
    if (domains.length > 0) generateRules();
}
