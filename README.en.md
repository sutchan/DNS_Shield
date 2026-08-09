# DNS Shield

[![English](https://img.shields.io/badge/language-English-blue)](README.en.md) [![中文](https://img.shields.io/badge/language-中文-red)](README.md) [![Version](https://img.shields.io/badge/version-3.7.4-green)](https://github.com/sutchan/DNS_Shield)

Router-level DNS-based ad blocking filter list with web management tool.

## Overview

This project provides a dnsmasq/hosts-based ad blocking solution that includes:

- **473+ blocked domains** - Local ad and tracking domain filter (can expand to 6766+ with preset sources)
- **Web management tool** - Generate custom filter lists via browser
- **Multiple output formats** - Supports Dnsmasq, Hosts, AdGuard, and whitelist formats
- **Single source workflow** - One domain list generates all output formats
- **Router compatible** - Works with Merlin, OpenWrt, Xiaomi, ASUS, TP-Link, and more
- **Whitelist management** - Independent whitelist editing interface with import/export support
- **Multi-language support** - Supports 16 languages, can be switched on the interface
- **Next.js framework** - v3.7.4 version has migrated to modern Next.js framework and modular architecture
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
| `whitelist.txt` | Whitelist file (contains domains that need to be allowed) |
| `src/app/` | Next.js source code directory with management interface logic |
| `domains.txt` | Unified domain list (one domain per line, source of truth) |

### Using Pre-generated Files

This project provides pre-generated filter rule files that can be downloaded and used directly:

| File | Use Case | Download Link |
|------|----------|---------------|
| [dnsmasq.conf](dnsmasq.conf) | Routers with dnsmasq support (Merlin/OpenWrt) | [Download](https://raw.githubusercontent.com/sutchan/DNS_Shield/main/dnsmasq.conf) |
| [hosts.txt](hosts.txt) | Routers with hosts support (Xiaomi/ASUS/TP-Link) | [Download](https://raw.githubusercontent.com/sutchan/DNS_Shield/main/hosts.txt) |
| [adguard.txt](adguard.txt) | AdGuard browser extension/AdGuard Home | [Download](https://raw.githubusercontent.com/sutchan/DNS_Shield/main/adguard.txt) |
| [whitelist.txt](whitelist.txt) | Whitelist (domains that need to be allowed) | [Download](https://raw.githubusercontent.com/sutchan/DNS_Shield/main/whitelist.txt) |

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

- Load and parse domain lists from URL or local file
- Choose preset sources (AdGuard, EasyList, NeoHosts, Xiaomi)
- Generate Dnsmasq, Hosts, AdGuard, and whitelist format output
- Configure IP addresses (IPv4/IPv6)
- Auto deduplicate and sort domains
- Independent whitelist editing interface with import/export support
- Multi-language support, can switch between 16 languages on the interface
- Download generated files

## Single Source Workflow

```
domains.txt (Source of Truth)
        ↓
  Next.js App (Web Tool)
        ↓
   ┌────────────┴────────────┐
   ↓            ↓            ↓
dnsmasq.conf  hosts.txt  adguard.txt
        ↓            ↓            ↓
  (Router)     (Router)   (AdGuard)
        ↓
  Whitelist Output
        ↓
whitelist.txt
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
