// src/types/index.ts v2.2.1

export interface OutputContent {
  dnsmasq: string;
  hosts: string;
  adguard: string;
  whitelist: string;
}

export interface CustomDnsEntry {
  domain: string;
  ip: string;
}

export interface ParsedData {
  domains: string[];
  whitelist: string[];
  customDns: CustomDnsEntry[];
}

export interface Settings {
  projectName: string;
  version: string;
  ipv4: string;
  ipv6: string;
  addHeader: boolean;
  blockIPv6: boolean;
  dedupDomains: boolean;
  removeWildcard: boolean;
  dnsmasqFilename: string;
  hostsFilename: string;
  adguardFilename: string;
  whitelistFilename: string;
}

export interface Stats {
  domainCount: number;
  validCount: number;
  commentCount: number;
  blacklistCount: number;
  whitelistCount: number;
}

export interface Language {
  code: string;
  name: string;
  icon: string;
}

export type FormatType = 'hosts' | 'dnsmasq' | 'adguard' | 'whitelist';
