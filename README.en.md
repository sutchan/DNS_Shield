# DNS Shield

[![English](https://img.shields.io/badge/language-English-blue)](README.en.md) [![中文](https://img.shields.io/badge/language-中文-red)](README.md) [![Version](https://img.shields.io/badge/version-1.0.7-green)](https://github.com/sutchan/DNS_Shield)

Router-level DNS-based ad blocking filter list with web management tool.

## Overview

This project provides a dnsmasq/hosts-based ad blocking solution that includes:

- **422+ blocked domains** - Local ad and tracking domain filter (can expand to 6766+ with preset sources)
- **Web management tool** - Generate custom filter lists via browser
- **Multiple output formats** - Supports Dnsmasq and Hosts formats
- **Single source workflow** - One domain list generates all output formats
- **Router compatible** - Works with Merlin, OpenWrt, Xiaomi, ASUS, TP-Link, and more

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
| `index.html` | Web interface for managing and generating filter lists |
| `domains.txt` | Unified domain list (one domain per line, source of truth) |

## Web Manager

Open `index.html` in your browser to:

- Load and parse domain lists from URL or local file
- Choose preset sources (AdGuard, EasyList, NeoHosts, Xiaomi)
- Generate Dnsmasq or Hosts format output
- Configure IP addresses (IPv4/IPv6)
- Auto deduplicate and sort domains
- Download generated files

## Single Source Workflow

```
domains.txt (Source of Truth)
        ↓
    index.html (Web Tool)
        ↓
   ┌────────────┴────────────┐
   ↓                         ↓
dnsmasq.conf              hosts.txt
```

## Contribution

1. Edit `domains.txt` to add/remove domains
2. Open `index.html` to generate updated files
3. Submit Pull Request

## License

MIT License

---

[中文版本](README.md)
