// assets/js/core.js v1.1.1
// Core variables and configuration for DNS Ad Block List Generator
// Using namespace pattern to reduce global pollution

window.DNSShield = window.DNSShield || {};
const state = window.DNSShield.state = {
    domains: [],
    urlList: [],
    whitelist: [],
    customDns: [],
    currentFormat: 'hosts',
    outputContent: { dnsmasq: '', hosts: '', adguard: '' },
    isLangZh: true,
    projectUrl: 'https://github.com/sutchan/DNS_Shield',
    demoUrl: 'https://dns.ewuse.com/',
    settings: {
        projectName: 'DNS Shield',
        version: '1.0.7',
        ipv4: '127.0.0.1',
        ipv6: '::',
        dnsmasqFilename: 'dnsmasq.conf',
        hostsFilename: 'hosts.txt',
        adguardFilename: 'adguard.txt'
    },
    presets: {
        adguard: 'https://adguardteam.github.io/AdGuardSDNSFilter/Filters/filter.txt',
        easylist: 'https://easylist.to/easylist/easylist.txt',
        xiaomi: '',
        neohosts: 'https://raw.githubusercontent.com/neo-forte/neo-forte.github.io/main/hosts/AdGameHosts/hosts'
    }
};

// Getter/setter functions for backward compatibility
function getSettings() {
    return state.settings;
}

function getDomains() {
    return state.domains;
}

function getWhitelist() {
    return state.whitelist;
}

function getCustomDns() {
    return state.customDns;
}

function getOutputContent() {
    return state.outputContent;
}

function setOutputContent(content) {
    state.outputContent = content;
}

function isLangChinese() {
    return state.isLangZh;
}

// Expose state for direct access when needed
function getState() {
    return state;
}

// Legacy global variables for backward compatibility
// These reference the state arrays directly
var domains = state.domains;
var whitelist = state.whitelist;
var customDns = state.customDns;
var currentFormat = state.currentFormat;
var outputContent = state.outputContent;
var isLangZh = state.isLangZh;
var projectUrl = state.projectUrl;
var demoUrl = state.demoUrl;
var settings = state.settings;
