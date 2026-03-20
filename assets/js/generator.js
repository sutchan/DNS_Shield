// assets/js/generator.js v1.1.0
// Rule generation logic for DNS Ad Block List Generator

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
        dnsmasqContent += `# =====================================\n`;
        dnsmasqContent += `# ${settings.projectName} - Dnsmasq Ad Block List\n`;
        dnsmasqContent += `# =====================================\n`;
        dnsmasqContent += `#\n`;
        dnsmasqContent += `# Description: Router-level ad blocking filter\n`;
        dnsmasqContent += `#\n`;
        dnsmasqContent += `# Version: ${settings.version}\n`;
        dnsmasqContent += `# Update: ${dateStr}\n`;
        dnsmasqContent += `# Domains: ${totalDomains} unique domains\n`;
        if (filteredWhitelist.length > 0) {
            dnsmasqContent += `# Whitelist: ${filteredWhitelist.length} domains\n`;
        }
        dnsmasqContent += `#\n`;
        dnsmasqContent += `# Usage:\n`;
        dnsmasqContent += `#   - Merlin: Software Center -> DNS Settings\n`;
        dnsmasqContent += `#   - OpenWrt: Services -> DHCP and DNS\n`;
        dnsmasqContent += `#\n`;
        dnsmasqContent += `# Project: ${projectUrl}\n`;
        if (typeof demoUrl !== 'undefined') {
            dnsmasqContent += `# Demo: ${demoUrl}\n`;
        }
        dnsmasqContent += `#\n`;
        dnsmasqContent += `# =====================================\n\n`;

        hostsContent += `# =====================================\n`;
        hostsContent += `# ${settings.projectName} - Hosts Ad Block List\n`;
        hostsContent += `# =====================================\n`;
        hostsContent += `#\n`;
        hostsContent += `# Description: Router-level ad blocking hosts file\n`;
        hostsContent += `#\n`;
        hostsContent += `# Version: ${settings.version}\n`;
        hostsContent += `# Update: ${dateStr}\n`;
        hostsContent += `# Domains: ${totalDomains} unique domains\n`;
        if (filteredWhitelist.length > 0) {
            hostsContent += `# Whitelist: ${filteredWhitelist.length} domains\n`;
        }
        hostsContent += `#\n`;
        hostsContent += `# Usage: Import to router ad blocking settings\n`;
        hostsContent += `#\n`;
        hostsContent += `# Project: ${projectUrl}\n`;
        if (typeof demoUrl !== 'undefined') {
            hostsContent += `# Demo: ${demoUrl}\n`;
        }
        hostsContent += `#\n`;
        hostsContent += `# =====================================\n\n`;

        adguardContent += `! ====================================\n`;
        adguardContent += `! ${settings.projectName} - AdGuard Ad Block Filter\n`;
        adguardContent += `! ====================================\n`;
        adguardContent += `!\n`;
        adguardContent += `! Description: AdGuard-compatible ad blocking filter\n`;
        adguardContent += `!\n`;
        adguardContent += `! Version: ${settings.version}\n`;
        adguardContent += `! Update: ${dateStr}\n`;
        adguardContent += `! Domains: ${totalDomains} unique domains\n`;
        if (filteredWhitelist.length > 0) {
            adguardContent += `! Whitelist: ${filteredWhitelist.length} domains\n`;
        }
        adguardContent += `!\n`;
        adguardContent += `! Project: ${projectUrl}\n`;
        if (typeof demoUrl !== 'undefined') {
            adguardContent += `! Demo: ${demoUrl}\n`;
        }
        adguardContent += `!\n`;
        adguardContent += `! ====================================\n\n`;
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
