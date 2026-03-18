// assets/js/generator.js v1.0.7
// Rule generation logic for DNS Ad Block List Generator

function generateRules() {
    const addHeader = document.getElementById('addHeader').checked;
    const blockIPv6 = document.getElementById('blockIPv6').checked;
    const dedupDomains = document.getElementById('dedupDomains').checked;
    const removeWildcard = document.getElementById('removeWildcard').checked;

    let processedDomains = [...domains];
    if (removeWildcard) {
        processedDomains = processedDomains.map(d => d.replace(/^\*\./, ''));
    }
    if (dedupDomains) {
        processedDomains = [...new Set(processedDomains)].sort();
    }

    let processedWhitelist = [...whitelist];
    if (removeWildcard) {
        processedWhitelist = processedWhitelist.map(d => d.replace(/^\*\./, ''));
    }
    if (dedupDomains) {
        processedWhitelist = [...new Set(processedWhitelist)].sort();
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;

    let dnsmasqContent = '';
    let hostsContent = '';
    let adguardContent = '';

    if (addHeader) {
        const totalDomains = processedDomains.length + customDns.length;
        dnsmasqContent += `# =====================================\n`;
        dnsmasqContent += `# ${settings.projectName} - Dnsmasq Ad Block List\n`;
        dnsmasqContent += `# =====================================\n`;
        dnsmasqContent += `#\n`;
        dnsmasqContent += `# Description: Router-level ad blocking filter\n`;
        dnsmasqContent += `#\n`;
        dnsmasqContent += `# Version: ${settings.version}\n`;
        dnsmasqContent += `# Update: ${dateStr}\n`;
        dnsmasqContent += `# Domains: ${totalDomains} unique domains\n`;
        if (processedWhitelist.length > 0) {
            dnsmasqContent += `# Whitelist: ${processedWhitelist.length} domains\n`;
        }
        dnsmasqContent += `#\n`;
        dnsmasqContent += `# Usage:\n`;
        dnsmasqContent += `#   - Merlin: Software Center -> DNS Settings\n`;
        dnsmasqContent += `#   - OpenWrt: Services -> DHCP and DNS\n`;
        dnsmasqContent += `#\n`;
        dnsmasqContent += `# Project: ${projectUrl}\n`;
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
        if (processedWhitelist.length > 0) {
            hostsContent += `# Whitelist: ${processedWhitelist.length} domains\n`;
        }
        hostsContent += `#\n`;
        hostsContent += `# Usage: Import to router ad blocking settings\n`;
        hostsContent += `#\n`;
        hostsContent += `# Project: ${projectUrl}\n`;
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
        if (processedWhitelist.length > 0) {
            adguardContent += `! Whitelist: ${processedWhitelist.length} domains\n`;
        }
        adguardContent += `!\n`;
        adguardContent += `! Project: ${projectUrl}\n`;
        adguardContent += `!\n`;
        adguardContent += `! ====================================\n\n`;
    }

    processedDomains.forEach(domain => {
        dnsmasqContent += `address=/${domain}/${settings.ipv4}\n`;
        hostsContent += `${settings.ipv4} ${domain}\n`;
        adguardContent += `||${domain}^\n`;

        if (blockIPv6) {
            dnsmasqContent += `address=/${domain}/${settings.ipv6}\n`;
            hostsContent += `${settings.ipv6} ${domain}\n`;
        }
    });

    customDns.forEach(item => {
        dnsmasqContent += `address=/${item.domain}/${item.ip}\n`;
        hostsContent += `${item.ip} ${item.domain}\n`;
        adguardContent += `||${item.domain}^\n`;

        if (blockIPv6) {
            dnsmasqContent += `address=/${item.domain}/::\n`;
        }
    });

    if (processedWhitelist.length > 0) {
        if (addHeader) {
            dnsmasqContent += `\n# Whitelist (allow these domains)\n`;
            hostsContent += `\n# Whitelist (allow these domains)\n`;
            adguardContent += `\n! Whitelist (allow these domains)\n`;
        }
        processedWhitelist.forEach(domain => {
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
    document.getElementById('mergeInfo').textContent = `黑名单: ${processedDomains.length} | 白名单: ${processedWhitelist.length} | 自定义DNS: ${customDns.length} | Dnsmasq: ${dnsmasqContent.split('\n').length} 行 | Hosts: ${hostsContent.split('\n').length} 行 | AdGuard: ${adguardContent.split('\n').length} 行`;
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
