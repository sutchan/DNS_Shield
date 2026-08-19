![DNS Shield Brand Banner](brand/brand-banner.svg)

![DNS Shield](brand/logo.svg)

[![English](https://img.shields.io/badge/language-English-blue)](README.en.md) [![中文](https://img.shields.io/badge/language-中文-red)](README.md) [![Version](https://img.shields.io/badge/version-3.7.51-green)](https://github.com/sutchan/DNS_Shield) [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org) [![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Router-level DNS-based ad blocking filter list with web management tool.

## Overview

This project provides a dnsmasq/hosts-based ad blocking solution that includes:

- **Blocked domains** - Local ad and tracking domain filter (expandable via preset sources like AdGuard, EasyList, NeoHosts)
- **Web management tool** - Generate custom filter lists via browser
- **Multiple output formats** - Dnsmasq, Hosts, AdGuard, Whitelist, Unbound, Pi-hole, Domains, Bind RPZ, SmartDNS
- **Single source workflow** - One domain list generates all output formats
- **Router compatible** - Works with Merlin, OpenWrt, Xiaomi, ASUS, TP-Link, and more
- **Whitelist management** - Independent whitelist editing interface with import/export support
- **Multi-language support** - Supports 16 languages, can be switched on the interface
- **Next.js framework** - Modern Next.js 14 App Router with modular architecture
- **Security hardening** - CSP headers, HSTS, Service Worker secure caching, filename sanitization

## Usage

### Method 1: Dnsmasq Format

For routers that support custom dnsmasq configuration.

#### Merlin Firmware (ASUS routers with Merlin)

**Path:** Software Center → DNS Settings → Custom dnsmasq

Copy all content from `dnsmasq.conf` and paste into the custom dnsmasq configuration.

#### OpenWrt

```bash
curl -sL https://raw.githubusercontent.com/sutchan/DNS_Shield/main/dnsmasq.conf >> /etc/dnsmasq.conf
```

### Method 2: Hosts Format

For routers that support custom hosts files.

#### Xiaomi Router

**Path:** Settings → Advertising Blocking → Custom hosts

Import `hosts.txt` into your router's ad blocking settings.

#### ASUS Router (Stock Firmware)

**Path:** Advanced Settings → LAN → DHCP Server → Custom hosts file

#### TP-Link Router

**Path:** Advanced → Network → Internet → Custom hosts

#### OpenWrt

```bash
# Method 1: Via LuCI
# Services → DNS and DHCP → Extra hosts fields

# Method 2: Via CLI
curl -sL https://raw.githubusercontent.com/sutchan/DNS_Shield/main/hosts.txt >> /etc/hosts
```

#### Other Routers

Most routers with custom hosts support can use the same method:

1. Download `hosts.txt` from the repository
2. Access your router's admin panel
3. Navigate to DNS/hosts settings
4. Import the hosts file

## Files

| File | Description |
|------|-------------|
| `dnsmasq.conf` | Main dnsmasq filter list (`address=/domain/0.0.0.0` format) |
| `hosts.txt` | Hosts file for routers (`0.0.0.0 domain` format) |
| `adguard.txt` | AdGuard browser extension/software format (`\|\|domain^`) |
| `whitelist.txt` | Whitelist file (domains that need to be allowed, `+domain` syntax) |
| `unbound.conf` | Unbound format (`local-zone ... refuse`) |
| `pihole.txt` | Pi-hole gravity format (`0.0.0.0 domain`) |
| `domains.txt` | Unified domain list (one domain per line, source of truth) |
| `rpz.db` | Bind RPZ response policy zone format |
| `smartdns.conf` | SmartDNS format (`address /domain/#`) |
| `src/app/` | Next.js source code directory with management interface logic |

### Using Pre-generated Files

This project provides pre-generated filter rule files that can be downloaded and used directly:

| File | Use Case | Download Link |
|------|----------|---------------|
| [dnsmasq.conf](dnsmasq.conf) | Routers with dnsmasq support (Merlin/OpenWrt) | [Download](https://raw.githubusercontent.com/sutchan/DNS_Shield/main/dnsmasq.conf) |
| [hosts.txt](hosts.txt) | Routers with hosts support (Xiaomi/ASUS/TP-Link) | [Download](https://raw.githubusercontent.com/sutchan/DNS_Shield/main/hosts.txt) |
| [adguard.txt](adguard.txt) | AdGuard browser extension/AdGuard Home | [Download](https://raw.githubusercontent.com/sutchan/DNS_Shield/main/adguard.txt) |
| [whitelist.txt](whitelist.txt) | Whitelist (domains that need to be allowed) | [Download](https://raw.githubusercontent.com/sutchan/DNS_Shield/main/whitelist.txt) |
| [unbound.conf](unbound.conf) | Unbound (local-zone refuse) | [Download](https://raw.githubusercontent.com/sutchan/DNS_Shield/main/unbound.conf) |
| [pihole.txt](pihole.txt) | Pi-hole gravity | [Download](https://raw.githubusercontent.com/sutchan/DNS_Shield/main/pihole.txt) |
| [rpz.db](rpz.db) | Bind RPZ | [Download](https://raw.githubusercontent.com/sutchan/DNS_Shield/main/rpz.db) |
| [smartdns.conf](smartdns.conf) | SmartDNS | [Download](https://raw.githubusercontent.com/sutchan/DNS_Shield/main/smartdns.conf) |

### Whitelist Usage Instructions

The `whitelist.txt` file contains domains that need to be allowed access, suitable for the following scenarios:

1. **AdGuard Browser Extension/AdGuard Home**:
   - Import the whitelist file into AdGuard's whitelist settings
   - Or copy the file content into AdGuard's custom whitelist rules

2. **Router Configuration**:
   - For routers that support whitelist functionality, add whitelist domains to the corresponding settings
   - Ensure whitelist rules have higher priority than blacklist rules

3. **Custom Filtering**:
   - When some websites cannot be accessed normally due to filtering rules, add the relevant domains to the whitelist
   - Whitelist format is `+domain`, for example: `+api.example.com`

> **Tip**: These files are updated regularly. Star or Watch this repository to get update notifications.

## Web Manager

The project is now based on Next.js. You can:

- Load and parse domain lists from URL (10s timeout) or local file
- Choose preset sources (built-in data, AdGuard, EasyList, NeoHosts)
- Generate Dnsmasq, Hosts, AdGuard, Whitelist, Unbound, Pi-hole, Domains, Bind RPZ, SmartDNS output
- Configure IP addresses (IPv4/IPv6), header comments, dedup, wildcard stripping
- Support custom DNS pointing (`@domain=ip`) and whitelist (`+domain`) prefixes
- Auto save to localStorage every 30s and restore on reload
- Auto deduplicate and sort domains
- Independent whitelist editing interface with import/export support
- Multi-language support, can switch between 16 languages on the interface
- Download or copy generated files to clipboard

## Single Source Workflow

```
domains.txt (Source of Truth, including + whitelist / @ custom DNS / # comment)
        ↓
  Next.js App (Web Tool, real-time generation)
        ↓
  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
  ↓     ↓     ↓     ↓     ↓     ↓     ↓     ↓     ↓
dns   hosts adguard white  unbound pihole domains  rpz   smartdns
masq         .txt  list   .conf  .txt           .db   .conf
  └────────────────────────────────────────────────────┘
                  Output: copy / download
```

## Contribution

Please refer to [Contribution Guide](CONTRIBUTING.md) to learn how to contribute to the project.

## Testing

Run tests using:

```bash
pnpm test
```

## Deployment

Please refer to [Deployment Guide](DEPLOYMENT.md) to learn how to deploy the web management tool.

## Security

Please refer to [Security Guide](SECURITY.md) to learn about the project's security best practices.

## License

MIT License

## Changelog

Please refer to [Changelog](CHANGELOG.md) for the project's version history and changes.

---

[中文版本](README.md)
